import { createHmac, createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { withDb } from "./db";
import type { RowDataPacket } from "mysql2";

/**
 * Login for a client looking at their own results.
 *
 * Deliberately not the admin login reused. The admin login is one shared
 * password in an environment variable, which is right when there is one
 * person and wrong the moment there are several, because a shared password
 * cannot be changed for one client without locking out the rest, and cannot
 * be revoked at all.
 *
 * So: a row per client, a password hashed with scrypt and its own salt, and
 * a cookie signed with a server secret that names which client it is. A
 * database dump does not hand anybody a working login, and switching
 * is_active off locks one client out without touching anyone else.
 *
 * The cookie carries the client id and an expiry, signed. There is no
 * session table, so an individual stolen cookie cannot be revoked — the
 * answer is to change that client's password, which changes nothing about
 * the signature, so SESSION_SECRET rotation is the blunt instrument for a
 * wider problem. Worth knowing rather than discovering.
 */

const COOKIE = "sm_client";
const SESSION_HOURS = 24 * 14;

function signingKey(): string | null {
  // Reuses the session secret the site already has rather than inventing a
  // second one nobody will remember to set.
  const value = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return value && value.length > 0 ? value : null;
}

function sign(clientId: number, expiry: number, key: string): string {
  return createHmac("sha256", key).update(`client:${clientId}:${expiry}`).digest("hex");
}

function equals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** scrypt, so a stolen hash is expensive to attack rather than instant. */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  return { hash: scryptSync(password, salt, 64).toString("hex"), salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const attempt = scryptSync(password, salt, 64);
    const stored = Buffer.from(hash, "hex");
    if (attempt.length !== stored.length) return false;
    return timingSafeEqual(attempt, stored);
  } catch {
    return false;
  }
}

interface ClientRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  password_hash: string | null;
  password_salt: string | null;
  is_active: number;
}

export type ClientAccount = { id: number; slug: string; name: string };

/** Null for a wrong password, an unknown client, or one switched off. */
export async function checkClientLogin(
  slug: string,
  password: string,
): Promise<ClientAccount | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<ClientRow[]>(
      "SELECT id, slug, name, password_hash, password_salt, is_active FROM clients WHERE slug = ? LIMIT 1",
      [slug.trim().toLowerCase()],
    );
    return rows[0] ?? null;
  });

  if (!found || !found.is_active) return null;
  if (!found.password_hash || !found.password_salt) return null;
  if (!verifyPassword(password, found.password_hash, found.password_salt)) return null;

  // Stamped here rather than in currentClient, which runs on every page
  // view: this answers "when did they last come to look", and a write on
  // each request would answer "when did they last load a page", besides
  // writing to the clients table a few times a minute while they read.
  // A failure to record it must not stop them signing in.
  await withDb(async (db) => {
    await db.execute("UPDATE clients SET last_login_at = NOW() WHERE id = ?", [found.id]);
    return true;
  });

  return { id: found.id, slug: found.slug, name: found.name };
}

export async function startClientSession(clientId: number): Promise<void> {
  const key = signingKey();
  if (!key) return;

  const expiry = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
  const store = await cookies();
  store.set(COOKIE, `${clientId}.${expiry}.${sign(clientId, expiry, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function endClientSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/**
 * Who is looking, or null.
 *
 * Re-reads the client row on every request rather than trusting the cookie's
 * contents, so switching a client off takes effect immediately instead of
 * whenever their cookie happens to expire.
 */
export async function currentClient(): Promise<ClientAccount | null> {
  const key = signingKey();
  if (!key) return null;

  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;

  const [idPart, expiryPart, signature] = raw.split(".");
  const clientId = Number(idPart);
  const expiry = Number(expiryPart);
  if (!Number.isInteger(clientId) || clientId <= 0 || !Number.isFinite(expiry)) return null;
  if (expiry < Date.now()) return null;
  if (!signature || !equals(signature, sign(clientId, expiry, key))) return null;

  const found = await withDb(async (db) => {
    const [rows] = await db.query<ClientRow[]>(
      "SELECT id, slug, name, password_hash, password_salt, is_active FROM clients WHERE id = ? LIMIT 1",
      [clientId],
    );
    return rows[0] ?? null;
  });

  if (!found || !found.is_active) return null;
  return { id: found.id, slug: found.slug, name: found.name };
}
