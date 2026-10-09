import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { execute, isDbConfigured, query } from "./db";

const scryptAsync = promisify(scrypt) as (pw: string, salt: string, len: number) => Promise<Buffer>;

export const USER_COOKIE = "pu_session";
export const ADMIN_COOKIE = "pu_admin";
// Readable by the page (not secret), just so the header can say "My Account".
export const LOGGED_IN_HINT = "pu_logged_in";
const DAY = 24 * 60 * 60;

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  address1: string;
  address2: string;
  town: string;
  postcode: string;
  created_at: Date;
};

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const hash = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return expected.length === hash.length && timingSafeEqual(expected, hash);
}

function cookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function createSession(opts: { userId: number | null; admin: boolean; days: number }) {
  const token = randomBytes(32).toString("hex");
  await execute("INSERT INTO sessions (token, user_id, is_admin, expires_at) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))", [
    token,
    opts.userId,
    opts.admin ? 1 : 0,
    opts.days,
  ]);
  return token;
}

export async function startUserSession(userId: number) {
  const token = await createSession({ userId, admin: false, days: 30 });
  const jar = await cookies();
  jar.set(USER_COOKIE, token, cookieOptions(30 * DAY));
  jar.set(LOGGED_IN_HINT, "1", cookieOptions(30 * DAY, false));
}

export async function endUserSession() {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (token && isDbConfigured()) await execute("DELETE FROM sessions WHERE token = ?", [token]);
  jar.delete(USER_COOKIE);
  jar.delete(LOGGED_IN_HINT);
}

export async function getCurrentUser(): Promise<User | null> {
  // Read cookies first, always: that's how Next.js knows this page is per-visitor.
  const token = (await cookies()).get(USER_COOKIE)?.value;
  if (!isDbConfigured() || !token || !/^[a-f0-9]{64}$/.test(token)) return null;
  // Only the database call is guarded: cookies() above must be allowed to
  // throw so Next.js knows the page depends on who is logged in.
  try {
    const rows = await query<User>(
      `SELECT u.id, u.email, u.name, u.phone, u.address1, u.address2, u.town, u.postcode, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.is_admin = 0 AND s.expires_at > NOW()`,
      [token],
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("Loading the logged-in user failed", err);
    return null;
  }
}

// The shop owner logs in on the normal login page with ADMIN_EMAIL and
// ADMIN_PASSWORD from the hosting settings, and lands in the admin portal.
// That email can't be used to sign up as a customer.
export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL) && (process.env.ADMIN_PASSWORD ?? "").length >= 8;
}

export function isAdminEmail(email: string) {
  return isAdminConfigured() && email.trim().toLowerCase() === process.env.ADMIN_EMAIL!.trim().toLowerCase();
}

export function checkAdminLogin(email: string, password: string) {
  if (!isAdminEmail(email)) return false;
  const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  const given = Buffer.from(password);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export async function startAdminSession() {
  const token = await createSession({ userId: null, admin: true, days: 7 });
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, cookieOptions(7 * DAY));
  jar.set(LOGGED_IN_HINT, "admin", cookieOptions(7 * DAY, false));
}

export async function endAdminSession() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token && isDbConfigured()) await execute("DELETE FROM sessions WHERE token = ?", [token]);
  jar.delete(ADMIN_COOKIE);
  jar.delete(LOGGED_IN_HINT);
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!isDbConfigured() || !token || !/^[a-f0-9]{64}$/.test(token)) return false;
  try {
    const rows = await query("SELECT 1 FROM sessions WHERE token = ? AND is_admin = 1 AND expires_at > NOW()", [token]);
    return rows.length > 0;
  } catch (err) {
    console.error("Checking the admin session failed", err);
    return false;
  }
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 190;
}

// Small pause on failed logins to slow down password guessing.
export function failDelay() {
  return new Promise((r) => setTimeout(r, 600));
}
