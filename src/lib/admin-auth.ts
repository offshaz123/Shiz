import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Login for the admin page.
 *
 * One shared password in an environment variable, and a signed cookie to
 * remember it. There is one person logging in, so accounts, password resets
 * and a users table would all be machinery with nothing to do.
 *
 * The cookie holds an expiry and a signature over it, nothing else — there is
 * no session table, so a stolen cookie cannot be revoked individually. The
 * answer to a leak is to change ADMIN_PASSWORD, which invalidates every
 * cookie ever issued at once, because the password is the signing key.
 */

const COOKIE = "sm_admin";
const SESSION_HOURS = 12;

/**
 * Marks this browser as the owner's, so page views from it are not counted.
 *
 * Separate from the login cookie and much longer lived, because the admin
 * session expires after half a day and Walid reads his own site more often
 * than he logs in. It holds no identity and no session value — it is a flag
 * saying "do not count me", and the worst anyone could do with a stolen copy
 * is leave themselves out of the statistics.
 *
 * It is worth being plain about what this can and cannot do. It excludes a
 * browser, not a person. A different browser, a phone, or a private window
 * is a different browser, and will be counted until it has logged in too.
 */
const NO_TRACK_COOKIE = "sm_no_track";
const NO_TRACK_DAYS = 365;

function secret(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  // A blank or absent password must not mean "anyone gets in". Every entry
  // point below treats null as a locked door.
  return value && value.length > 0 ? value : null;
}

/** Constant-time string comparison that doesn't leak length either. */
function equals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(expiry: number, key: string): string {
  return createHmac("sha256", key).update(`admin:${expiry}`).digest("hex");
}

export function checkPassword(attempt: string): boolean {
  const key = secret();
  if (!key) return false;
  return equals(attempt, key);
}

export async function startSession(): Promise<void> {
  const key = secret();
  if (!key) return;

  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const store = await cookies();
  store.set(COOKIE, `${expiry}.${sign(expiry, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });

  store.set(NO_TRACK_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NO_TRACK_DAYS * 24 * 60 * 60,
  });
}

/**
 * Whether this request comes from a browser that has logged into the admin.
 *
 * Checked by the page-view tracker so the owner reading his own site does
 * not inflate his own numbers. Logging out deliberately leaves this in
 * place: the point is to stop counting the browser, not to end a session.
 */
export async function isOwnerBrowser(): Promise<boolean> {
  const store = await cookies();
  if (store.get(NO_TRACK_COOKIE)?.value === "1") return true;
  return await isAdmin();
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Whether the current request carries a valid, unexpired admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;

  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;

  const [expiryPart, signature] = raw.split(".");
  const expiry = Number(expiryPart);
  if (!expiryPart || !signature || !Number.isFinite(expiry)) return false;
  if (Date.now() > expiry) return false;

  return equals(signature, sign(expiry, key));
}

/**
 * Guard for server actions.
 *
 * Server actions are reachable by direct POST, not only through the page that
 * renders the form, so rendering the dashboard behind a login is not itself
 * protection. Every action calls this first.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authorised");
}

/**
 * Login attempt limiting, held in memory.
 *
 * Process-local, so it resets on deploy and would not be shared across
 * instances. That is a real limit and worth naming: it is a speed bump
 * against someone guessing at the password, not a lockout. The password's own
 * length is what actually has to hold.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

export function tooManyAttempts(ip: string): boolean {
  const record = attempts.get(ip);
  if (!record) return false;
  if (Date.now() > record.until) {
    attempts.delete(ip);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.until) {
    attempts.set(ip, { count: 1, until: now + WINDOW_MS });
    return;
  }
  record.count += 1;

  // Stop the map growing without bound if someone cycles through addresses.
  if (attempts.size > 5000) {
    for (const [key, value] of attempts) {
      if (now > value.until) attempts.delete(key);
    }
  }
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}
