import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { withDb } from "./db";
import { defaultPages, type PageKey } from "./admin-pages";
import { REGIONS, isRegion, type Region } from "./regions";

/**
 * Accounts for the people who work the list, and a record of what they did.
 *
 * Two things Walid asked for at once, and they belong together: an account
 * is only worth having if it is attached to a log, and a log is only worth
 * reading if it knows whose it is.
 *
 * The owner has no row here. He signs in with ADMIN_PASSWORD, sees every
 * page, and cannot be switched off by anything on this screen — which also
 * means there is no account to lock himself out of.
 */

export type Staff = {
  id: number;
  name: string;
  username: string;
  pages: PageKey[];
  /** Which countries' lists they work. Always a full list in memory —
   *  the empty column means both, resolved here so nothing downstream
   *  has to know about that. */
  regions: Region[];
  active: boolean;
  createdAt: string;
  lastSeenAt: string | null;
};

interface StaffRow extends RowDataPacket {
  id: number;
  name: string;
  username: string;
  pass_hash: string;
  pages: string;
  regions?: string | null;
  active: number;
  created_at: string;
  last_seen_at: string | null;
}

function toStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    pages: row.pages ? (row.pages.split(",").filter(Boolean) as PageKey[]) : [],
    regions: row.regions
      ? row.regions.split(",").filter(isRegion)
      : [...REGIONS],
    active: Boolean(row.active),
    createdAt: String(row.created_at),
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null,
  };
}

/**
 * Password storage: scrypt, with a random salt per password.
 *
 * Not a plain hash. These are passwords chosen by people who will reuse
 * them elsewhere, and the cost of scrypt is the entire point — a leaked
 * table of fast hashes is a leaked table of passwords.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function passwordMatches(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const attempt = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  if (attempt.length !== known.length) return false;
  return timingSafeEqual(attempt, known);
}

/**
 * Names nobody may sign up as.
 *
 * "admin" is how Walid signs in, so a member of staff holding that
 * username would be a staff account standing in front of the owner's
 * login. The rest are reserved because they read as the system rather
 * than as a person.
 */
export const RESERVED_USERNAMES = ["admin", "administrator", "owner", "root", "system"];

export function isReservedUsername(name: string): boolean {
  return RESERVED_USERNAMES.includes(toUsername(name));
}

/** Tidies a typed name into something that can be a username. */
export function toUsername(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "")
    .slice(0, 40);
}

export async function listStaff(): Promise<Staff[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<StaffRow[]>(
      "SELECT * FROM staff ORDER BY active DESC, name ASC",
    );
    return rows.map(toStaff);
  });
}

export async function getStaff(id: number): Promise<Staff | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<StaffRow[]>("SELECT * FROM staff WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? toStaff(rows[0]) : null;
  });
  return found ?? null;
}

/**
 * Signs somebody in, or says no.
 *
 * Returns null for a wrong password, an unknown username and a switched-off
 * account alike. The sign-in screen must not tell whoever is standing in
 * front of it which of the three it was.
 */
export async function checkStaffLogin(username: string, password: string): Promise<Staff | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<StaffRow[]>(
      "SELECT * FROM staff WHERE username = ? LIMIT 1",
      [toUsername(username)],
    );
    const row = rows[0];
    if (!row || !row.active) return null;
    if (!passwordMatches(password, row.pass_hash)) return null;
    return toStaff(row);
  });
  return found ?? null;
}

export async function addStaff(
  name: string,
  username: string,
  password: string,
): Promise<{ ok: true; id: number } | { ok: false; reason: string }> {
  const clean = toUsername(username);
  if (name.trim().length < 2) return { ok: false, reason: "Give them a name." };
  if (clean.length < 3) return { ok: false, reason: "The username needs three characters or more." };
  if (isReservedUsername(clean)) {
    return { ok: false, reason: `"${clean}" is reserved. Pick another username.` };
  }
  if (password.length < 10) {
    return { ok: false, reason: "Passwords need to be at least ten characters." };
  }

  const result = await withDb(async (db) => {
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id FROM staff WHERE username = ? LIMIT 1",
      [clean],
    );
    if (existing.length > 0) return { ok: false as const, reason: "That username is taken." };

    const [res] = await db.execute<ResultSetHeader>(
      "INSERT INTO staff (name, username, pass_hash, pages) VALUES (?, ?, ?, ?)",
      [name.trim().slice(0, 80), clean, hashPassword(password), defaultPages().join(",")],
    );
    return { ok: true as const, id: res.insertId };
  });

  return result ?? { ok: false, reason: "No database connection." };
}

/** Replaces the whole set rather than toggling one, so the screen and the
 *  row cannot drift apart over several clicks. */
export async function setStaffPages(id: number, pages: PageKey[]): Promise<void> {
  await withDb(async (db) => {
    await db.execute("UPDATE staff SET pages = ? WHERE id = ?", [pages.join(","), id]);
  }).catch(() => null);
}

/** Replaces the whole set, like setStaffPages and for the same reason.
 *  An empty list is stored as every region rather than as none: nobody
 *  means to give somebody an account with no list at all, and if they do,
 *  switching the account off says it properly. */
export async function setStaffRegions(id: number, regions: Region[]): Promise<void> {
  const clean = regions.filter(isRegion);
  await withDb(async (db) => {
    await db.execute("UPDATE staff SET regions = ? WHERE id = ?", [
      clean.length ? clean.join(",") : REGIONS.join(","),
      id,
    ]);
  }).catch(() => null);
}

export async function setStaffActive(id: number, active: boolean): Promise<void> {
  await withDb(async (db) => {
    await db.execute("UPDATE staff SET active = ? WHERE id = ?", [active ? 1 : 0, id]);
  }).catch(() => null);
}

export async function setStaffPassword(id: number, password: string): Promise<boolean> {
  if (password.length < 10) return false;
  const done = await withDb(async (db) => {
    await db.execute("UPDATE staff SET pass_hash = ? WHERE id = ?", [hashPassword(password), id]);
    return true;
  });
  return done === true;
}

/** Stamped on sign-in and on each recorded action, so "last seen" is a
 *  real answer rather than the last time somebody typed a password. */
export async function touchStaff(id: number): Promise<void> {
  await withDb(async (db) => {
    await db.execute("UPDATE staff SET last_seen_at = NOW() WHERE id = ?", [id]);
  }).catch(() => null);
}

/* ---------------------------------------------------------------- the log */

export type Activity = {
  id: number;
  staffId: number | null;
  who: string;
  action: string;
  subject: string;
  detail: string;
  at: string;
};

/**
 * Writes one line in the log.
 *
 * Never throws and never blocks the thing it is recording. A call that was
 * made but not logged is a gap in a report; a call that could not be made
 * because the logging failed is a lost customer.
 */
export async function logAction(
  who: { id: number | null; name: string },
  action: string,
  subject?: string,
  detail?: string,
): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      "INSERT INTO staff_actions (staff_id, who, action, subject, detail) VALUES (?, ?, ?, ?, ?)",
      [
        who.id,
        who.name.slice(0, 80),
        action.slice(0, 40),
        subject?.slice(0, 160) ?? null,
        detail?.slice(0, 255) ?? null,
      ],
    );
    if (who.id !== null) {
      await db.execute("UPDATE staff SET last_seen_at = NOW() WHERE id = ?", [who.id]);
    }
  }).catch(() => null);
}

export async function listActivity(
  staffId: number | null | "everyone",
  limit = 60,
): Promise<Activity[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      staffId === "everyone"
        ? `SELECT * FROM staff_actions ORDER BY created_at DESC LIMIT ?`
        : `SELECT * FROM staff_actions WHERE staff_id <=> ? ORDER BY created_at DESC LIMIT ?`,
      staffId === "everyone" ? [limit] : [staffId, limit],
    );
    return rows.map((r) => ({
      id: Number(r.id),
      staffId: r.staff_id === null ? null : Number(r.staff_id),
      who: String(r.who),
      action: String(r.action),
      subject: r.subject ? String(r.subject) : "",
      detail: r.detail ? String(r.detail) : "",
      at: String(r.created_at),
    }));
  });
}

export type StaffTally = {
  staffId: number | null;
  today: number;
  week: number;
  callsToday: number;
  lastAt: string | null;
  /** When the first and last thing happened today, so a morning's work and
   *  two clicks at nine o'clock do not read the same. */
  firstTodayAt: string | null;
};

/**
 * The counts behind each person's row.
 *
 * Facts only: how many actions today, how many this week, how many of them
 * were calls, and the first and last of them today. Whether that is a good
 * day's work is a judgement for the person reading it, who knows what the
 * day was supposed to contain. A number here calling somebody lazy would be
 * this file's opinion dressed up as data.
 */
export async function staffTallies(): Promise<StaffTally[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT staff_id,
              SUM(created_at >= CURDATE()) AS today,
              SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS week,
              SUM(created_at >= CURDATE() AND action = 'logged-call') AS calls_today,
              MAX(created_at) AS last_at,
              MIN(CASE WHEN created_at >= CURDATE() THEN created_at END) AS first_today
         FROM staff_actions
        GROUP BY staff_id`,
    );
    return rows.map((r) => ({
      staffId: r.staff_id === null ? null : Number(r.staff_id),
      today: Number(r.today ?? 0),
      week: Number(r.week ?? 0),
      callsToday: Number(r.calls_today ?? 0),
      lastAt: r.last_at ? String(r.last_at) : null,
      firstTodayAt: r.first_today ? String(r.first_today) : null,
    }));
  });
}

/* ----------------------------------------------------------- sittings */

export type Sitting = {
  id: number;
  staffId: number | null;
  who: string;
  startedAt: string;
  lastSeenAt: string;
  endedAt: string | null;
  endedReason: string;
  /** Minutes between signing in and the last sign of life. */
  minutes: number;
  /** True while they are still signed in. */
  open: boolean;
};

function minutesBetween(from: string, to: string): number {
  const a = new Date(from.replace(" ", "T")).getTime();
  const b = new Date(to.replace(" ", "T")).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 60000));
}

/** Opens a sitting. Called once, on a successful sign-in. */
export async function startSitting(who: { id: number | null; name: string }): Promise<void> {
  await withDb(async (db) => {
    // Anything still open for this person is closed first. A session left
    // open by a closed laptop must not swallow the next day's.
    await db.execute(
      `UPDATE staff_sessions
          SET ended_at = last_seen_at, ended_reason = 'left'
        WHERE staff_id <=> ? AND ended_at IS NULL`,
      [who.id],
    );
    await db.execute("INSERT INTO staff_sessions (staff_id, who) VALUES (?, ?)", [
      who.id,
      who.name.slice(0, 80),
    ]);
  }).catch(() => null);
}

/**
 * Marks that they are still here.
 *
 * Called as pages load. One cheap UPDATE against an indexed row, and the
 * difference between a record that says "signed in at nine" and one that
 * says "signed in at nine and was still there at one".
 */
export async function touchSitting(staffId: number | null): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE staff_sessions SET last_seen_at = NOW()
        WHERE staff_id <=> ? AND ended_at IS NULL
        ORDER BY started_at DESC LIMIT 1`,
      [staffId],
    );
  }).catch(() => null);
}

/** Closes it properly, when they press sign out. */
export async function endSitting(staffId: number | null): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE staff_sessions
          SET ended_at = NOW(), last_seen_at = NOW(), ended_reason = 'signed-out'
        WHERE staff_id <=> ? AND ended_at IS NULL`,
      [staffId],
    );
  }).catch(() => null);
}

/** Recent sittings, newest first, for the team screen. */
export async function listSittings(limit = 40): Promise<Sitting[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT * FROM staff_sessions ORDER BY started_at DESC LIMIT ?`,
      [limit],
    );
    return rows.map((r) => {
      const startedAt = String(r.started_at);
      const lastSeenAt = String(r.last_seen_at);
      const endedAt = r.ended_at ? String(r.ended_at) : null;
      return {
        id: Number(r.id),
        staffId: r.staff_id === null ? null : Number(r.staff_id),
        who: String(r.who),
        startedAt,
        lastSeenAt,
        endedAt,
        endedReason: r.ended_reason ? String(r.ended_reason) : "",
        // To the last sign of life, not to now. A tab left open overnight
        // is not fourteen hours of work and should not be recorded as it.
        minutes: minutesBetween(startedAt, endedAt ?? lastSeenAt),
        open: endedAt === null,
      };
    });
  });
}
