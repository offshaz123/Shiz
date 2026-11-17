import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * A small account system: sign up, log in, know who you are.
 *
 * Deliberately no dependencies. Password hashing is Node's own scrypt, which
 * is memory-hard and is what you want here; sessions are a signed cookie
 * rather than a session table, so there is nothing to expire or clean up.
 *
 * There is no bank account behind any of this and it must never grow one
 * without a rethink. It exists so a customer can be recognised and greeted,
 * and so there is somewhere to put the things listed in the README next to
 * this file. Nothing here is regulated data.
 *
 * STORAGE is a JSON file. That is the right size for this: hundreds of
 * accounts, one writer, no relational queries. Two things it needs from the
 * host — a Node runtime and a writable, PERSISTENT disk. On a host with an
 * ephemeral filesystem every deploy would wipe the accounts, so if this ends
 * up somewhere like that, `readUsers`/`writeUsers` are the only two
 * functions that have to change.
 */

const SCRYPT_KEYLEN = 64;
const SESSION_DAYS = 30;

export const SESSION_COOKIE = "ovaropay_session";

export type Address = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** "salt:hash", both hex. */
  password: string;
  createdAt: string;
  /** Optional from here down — an account is usable without any of it. */
  phone?: string;
  company?: string;
  address?: Address;
  /** Roughly what they convert in a month, in GBP. Drives the cost figure. */
  monthlyVolume?: number;
};

export type PublicUser = Omit<User, "password">;

/** Strip the password before anything leaves the server. */
export function publicUser(user: User): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

/** Where the account store lives. Exported so failures can name it in the log. */
export function dataFile() {
  const dir = process.env.AUTH_DATA_DIR || path.join(process.cwd(), ".data");
  return path.join(dir, "users.json");
}

/**
 * Thrown when the account store cannot be read or written.
 *
 * It exists so the routes can tell a storage failure apart from a genuine
 * "that did not work" and say something useful. Without it a read-only or
 * unwritable AUTH_DATA_DIR surfaces as an unhandled 500 with an HTML error
 * page, the browser cannot parse JSON out of it, and the visitor gets
 * "Something went wrong" with nothing in it to act on. That is exactly what
 * happened on the first deploy.
 */
export class StorageError extends Error {
  constructor(
    readonly operation: "read" | "write",
    readonly path: string,
    readonly cause: unknown
  ) {
    const code = (cause as NodeJS.ErrnoException)?.code ?? "unknown";
    super(`Could not ${operation} the account store at ${path} (${code})`);
    this.name = "StorageError";
  }
}

function secret() {
  const value = process.env.AUTH_SECRET;
  // Refuse rather than fall back to a default. A predictable signing key
  // means anyone can mint a session cookie for any account.
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters");
  }
  return value;
}

export function authConfigured() {
  return Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}

async function readUsers(): Promise<User[]> {
  const file = dataFile();
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as User[];
  } catch (err) {
    // No file yet is the normal state before the first sign-up.
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw new StorageError("read", file, err);
  }
}

async function writeUsers(users: User[]) {
  const file = dataFile();
  // Write then rename, so a crash mid-write cannot leave a truncated file
  // where the account list used to be. The temp file is a sibling on
  // purpose: rename is only atomic within one filesystem.
  const temp = `${file}.${randomBytes(6).toString("hex")}.tmp`;
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(temp, JSON.stringify(users, null, 2), "utf8");
    await fs.rename(temp, file);
  } catch (err) {
    await fs.rm(temp, { force: true }).catch(() => {});
    throw new StorageError("write", file, err);
  }
}

function hash(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, SCRYPT_KEYLEN, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await hash(password, salt)).toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const expected = Buffer.from(key, "hex");
  const actual = await hash(password, salt);
  // Lengths must match before timingSafeEqual, which throws otherwise.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();

export async function findByEmail(email: string) {
  const target = normaliseEmail(email);
  return (await readUsers()).find((user) => user.email === target) ?? null;
}

export async function findById(id: string) {
  return (await readUsers()).find((user) => user.id === id) ?? null;
}

export async function createUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const users = await readUsers();
  const email = normaliseEmail(input.email);
  if (users.some((user) => user.email === email)) return null;

  const user: User = {
    id: randomBytes(16).toString("hex"),
    email,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    password: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  await writeUsers([...users, user]);
  return user;
}

/** Fields a person may change about themselves. Never the id or the email. */
export type ProfilePatch = Partial<
  Pick<User, "firstName" | "lastName" | "phone" | "company" | "address" | "monthlyVolume">
>;

async function mutate(id: string, change: (user: User) => User) {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  const updated = change(users[index]);
  users[index] = updated;
  await writeUsers(users);
  return updated;
}

export function updateProfile(id: string, patch: ProfilePatch) {
  return mutate(id, (user) => ({
    ...user,
    ...(patch.firstName !== undefined ? { firstName: patch.firstName.trim() } : {}),
    ...(patch.lastName !== undefined ? { lastName: patch.lastName.trim() } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone.trim() } : {}),
    ...(patch.company !== undefined ? { company: patch.company.trim() } : {}),
    ...(patch.address !== undefined ? { address: patch.address } : {}),
    ...(patch.monthlyVolume !== undefined ? { monthlyVolume: patch.monthlyVolume } : {}),
  }));
}

export async function setPassword(id: string, password: string) {
  const hashed = await hashPassword(password);
  return mutate(id, (user) => ({ ...user, password: hashed }));
}

/* -------------------------------------------------------------------------
   Password reset tokens.

   Stateless, like the session, but signed over the CURRENT PASSWORD HASH as
   well as the id and expiry. That is what makes them single-use without a
   table to track them in: the moment the password changes the hash changes,
   every token minted against the old one stops verifying, and a link that
   has been used — or an old link from a previous request — is dead.

   One hour, because a reset link sitting in a mailbox is a way into the
   account.
   ---------------------------------------------------------------------- */

const RESET_MINUTES = 60;

const signReset = (payload: string, passwordHash: string) =>
  createHmac("sha256", secret()).update(`reset:${payload}:${passwordHash}`).digest("hex");

export function createResetToken(user: User) {
  const payload = `${user.id}.${Date.now() + RESET_MINUTES * 60_000}`;
  return `${payload}.${signReset(payload, user.password)}`;
}

export async function userForResetToken(token: string): Promise<User | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiry, signature] = parts;
  if (!Number(expiry) || Number(expiry) < Date.now()) return null;

  const user = await findById(userId);
  if (!user) return null;

  const expected = Buffer.from(signReset(`${userId}.${expiry}`, user.password), "hex");
  const given = Buffer.from(signature, "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  return user;
}

/* -------------------------------------------------------------------------
   Sessions: "<userId>.<expiryMs>.<hmac>".

   Stateless on purpose. The signature covers the id and the expiry together,
   so neither can be edited without the secret, and logging out everywhere is
   a matter of rotating AUTH_SECRET.
   ---------------------------------------------------------------------- */

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export function createSessionToken(userId: string) {
  const payload = `${userId}.${Date.now() + SESSION_DAYS * 86_400_000}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [userId, expiry, signature] = parts;
  const expected = Buffer.from(sign(`${userId}.${expiry}`), "hex");
  const given = Buffer.from(signature, "hex");
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (!Number(expiry) || Number(expiry) < Date.now()) return null;

  return userId;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
};
