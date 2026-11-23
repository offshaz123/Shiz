import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_PAGES, type PageKey } from "./admin-pages";
import { REGIONS, type Region } from "./regions";
import { getStaff } from "./staff";

/**
 * Login for the admin page.
 *
 * The owner signs in with one shared password in an environment variable.
 * Staff sign in with their own name and password against the staff table,
 * and the cookie says which of the two it is.
 *
 * It was one password and no accounts for as long as one person used it,
 * and the comment here said accounts would be machinery with nothing to do.
 * That stopped being true the day somebody else started working the call
 * list: a shared login cannot say who made a call, and cannot keep anyone
 * out of the clients page.
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

/**
 * The signature covers who as well as when.
 *
 * Without the identity in the signed part, a member of staff could edit
 * their own cookie to say owner and the signature would still check out.
 */
function sign(expiry: number, who: string, key: string): string {
  return createHmac("sha256", key).update(`admin:${who}:${expiry}`).digest("hex");
}

/** Who a session belongs to. "owner" is Walid with ADMIN_PASSWORD. */
export type Who =
  | { kind: "owner"; id: null; name: string; pages: "all"; regions: Region[] }
  | { kind: "staff"; id: number; name: string; pages: PageKey[]; regions: Region[] };

export function checkPassword(attempt: string): boolean {
  const key = secret();
  if (!key) return false;
  return equals(attempt, key);
}

export async function startSession(staffId?: number): Promise<void> {
  const key = secret();
  if (!key) return;

  const who = staffId === undefined ? "owner" : `s${staffId}`;
  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const store = await cookies();
  store.set(COOKIE, `${expiry}.${who}.${sign(expiry, who, key)}`, {
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

/**
 * Reads the cookie and says who it belongs to, or null.
 *
 * Two shapes are accepted. The old one, "expiry.signature", predates staff
 * accounts and means the owner — kept so that adding accounts does not sign
 * Walid out of a session he already has. The new one carries who.
 */
async function sessionOwner(): Promise<"owner" | number | null> {
  const key = secret();
  if (!key) return null;

  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  const [expiryPart] = parts;
  const expiry = Number(expiryPart);
  if (!expiryPart || !Number.isFinite(expiry)) return null;
  if (Date.now() > expiry) return null;

  if (parts.length === 2) {
    // The old cookie. Its signature did not cover an identity, so the only
    // thing it can mean is the one account that existed when it was issued.
    return equals(parts[1], createHmac("sha256", key).update(`admin:${expiry}`).digest("hex"))
      ? "owner"
      : null;
  }

  if (parts.length !== 3) return null;
  const [, who, signature] = parts;
  if (!equals(signature, sign(expiry, who, key))) return null;

  if (who === "owner") return "owner";
  const id = Number(who.slice(1));
  return who.startsWith("s") && Number.isInteger(id) && id > 0 ? id : null;
}

/** Whether the current request carries a valid, unexpired admin cookie. */
export async function isAdmin(): Promise<boolean> {
  return (await sessionOwner()) !== null;
}

/**
 * Who is signed in, with their permissions.
 *
 * Staff are read from the database on every call rather than from the
 * cookie, deliberately. Switching somebody off, or taking the clients page
 * away, has to take effect now — not in twelve hours when their session
 * expires.
 */
export async function currentUser(): Promise<Who | null> {
  const session = await sessionOwner();
  if (session === null) return null;
  if (session === "owner") {
    return { kind: "owner", id: null, name: "Walid", pages: "all", regions: [...REGIONS] };
  }

  const staff = await getStaff(session);
  if (!staff || !staff.active) return null;
  return {
    kind: "staff",
    id: staff.id,
    name: staff.name,
    pages: staff.pages,
    regions: staff.regions,
  };
}

/** Whether this person is allowed to open that page. */
export function canSee(who: Who | null, key: PageKey): boolean {
  if (!who) return false;
  if (who.pages === "all") return true;
  const page = ADMIN_PAGES.find((p) => p.key === key);
  if (!page || !page.canGrant) return false;
  return who.pages.includes(key);
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
 * Guard for the things only Walid does: adding people, changing what they
 * can see, and anything on the clients page a member of staff has not been
 * given. Hiding a link is not permission — the action behind it is reachable
 * by direct POST whether or not the button was drawn.
 */
export async function requireOwner(): Promise<void> {
  const who = await currentUser();
  if (who?.kind !== "owner") throw new Error("Not authorised");
}

/** Whether this person works that country's list. */
export function canSeeRegion(who: Who | null, region: Region): boolean {
  return Boolean(who?.regions.includes(region));
}

/** Guard for an action that belongs to one page. */
export async function requirePage(key: PageKey): Promise<Who> {
  const who = await currentUser();
  if (!canSee(who, key)) throw new Error("Not authorised");
  return who as Who;
}

/**
 * Who to write in the log for whatever is about to happen.
 *
 * Falls back to the owner rather than throwing: every caller of this has
 * already checked permission, and a logging helper is not the place to
 * discover otherwise.
 */
export async function actor(): Promise<{ id: number | null; name: string }> {
  const who = await currentUser();
  return { id: who?.kind === "staff" ? who.id : null, name: who?.name ?? "Walid" };
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
