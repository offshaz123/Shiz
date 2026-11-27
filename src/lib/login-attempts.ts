import { withDb } from "./db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

/**
 * Login attempt limiting, shared by every login on the site.
 *
 * Two things were wrong before. It lived inside admin-auth, so only the
 * admin form was guarded and the client portal had none at all —
 * fifteen wrong passwords went through in eleven seconds and nothing
 * would have stopped the fifteen thousandth. And it was a Map held in
 * module memory, which turned out not to be shared: the two server
 * actions are bundled separately, so each had its own empty copy. The
 * admin login blocked because its own copy counted; the portal's never
 * saw a second request. A control that depends on how a bundler split
 * the code is not a control, so the count is in the database now.
 *
 * Why it matters more for clients than for the owner: a client password
 * is the only thing between a stranger and that business's leads,
 * invoices and customer list. And client passwords are hashed with
 * scrypt, which is deliberately slow — unlimited guesses are also
 * unlimited scrypt runs, which on shared hosting flattens the site
 * without guessing anything at all.
 *
 * It is still a speed bump rather than a lockout: an attacker with many
 * addresses gets many allowances, and the length of the password is
 * what actually has to hold. It is the difference between a few guesses
 * and an unlimited number of them.
 *
 * Counted per address AND per kind, so somebody fumbling the client
 * portal cannot lock the owner out of the admin page from the same
 * office.
 */

/** Enough for a person having a bad morning, few enough to be useless
 *  to a script. */
export const MAX_ATTEMPTS = 8;

/** How long a run of failures keeps counting, in minutes. */
export const WINDOW_MINUTES = 15;

export type LoginKind = "admin" | "client";

export async function tooManyAttempts(ip: string, kind: LoginKind = "admin"): Promise<boolean> {
  const hit = await withDb(async (db) => {
    const [[row]] = await db.query<(RowDataPacket & { tries: number })[]>(
      `SELECT tries FROM login_attempts
        WHERE scope = ? AND ip = ? AND until_at > NOW()`,
      [kind, ip.slice(0, 64)],
    );
    return Number(row?.tries ?? 0);
  });
  // A database that cannot be read is not a reason to let somebody in,
  // but it is also not a reason to lock everybody out. Null reads as
  // "no record", which is the same answer as a first attempt.
  return (hit ?? 0) >= MAX_ATTEMPTS;
}

export async function recordFailure(ip: string, kind: LoginKind = "admin"): Promise<void> {
  await withDb(async (db) => {
    // One statement decides it. An expired row is started again rather
    // than added to, so a failure last month does not count towards a
    // lockout today.
    await db.execute<ResultSetHeader>(
      `INSERT INTO login_attempts (scope, ip, tries, until_at)
            VALUES (?, ?, 1, DATE_ADD(NOW(), INTERVAL ? MINUTE))
       ON DUPLICATE KEY UPDATE
            tries = IF(until_at > NOW(), tries + 1, 1),
            until_at = IF(until_at > NOW(), until_at, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [kind, ip.slice(0, 64), WINDOW_MINUTES, WINDOW_MINUTES],
    );
    // Cheap housekeeping on the way past, so this never needs a job.
    await db.execute(`DELETE FROM login_attempts WHERE until_at < DATE_SUB(NOW(), INTERVAL 1 DAY)`);
  });
}

export async function clearAttempts(ip: string, kind: LoginKind = "admin"): Promise<void> {
  await withDb(async (db) => {
    await db.execute(`DELETE FROM login_attempts WHERE scope = ? AND ip = ?`, [kind, ip.slice(0, 64)]);
  });
}
