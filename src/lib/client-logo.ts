import type { RowDataPacket } from "mysql2/promise";
import { withDb } from "./db";
import { MAX_LOGO_BYTES } from "./client-logo-limits";

export { MAX_LOGO_BYTES };

/**
 * A client's own logo, stored as bytes and served back as an image.
 *
 * It is in the database rather than on disk because every deploy replaces
 * the site's files. A logo written into the app directory would disappear
 * the next time anything was pushed, and it would do it silently — showing
 * up as a hole on an invoice that had already gone to somebody's customer.
 *
 * Only three formats are accepted, and the type is read from the bytes
 * rather than believed from the upload. A file's name and its declared
 * type are both whatever the sender says; the first few bytes are what it
 * actually is, and an <img> tag will only render what it actually is.
 */

const SIGNATURES: { mime: string; test: (b: Buffer) => boolean }[] = [
  {
    mime: "image/png",
    test: (b) => b.length > 8 && b.subarray(0, 8).toString("hex") === "89504e470d0a1a0a",
  },
  {
    mime: "image/jpeg",
    test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/webp",
    test: (b) =>
      b.length > 12 &&
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

/** The real type of these bytes, or null if they are not an image we serve. */
export function sniffImage(bytes: Buffer): string | null {
  return SIGNATURES.find((sig) => sig.test(bytes))?.mime ?? null;
}

export async function saveLogo(
  clientId: number,
  bytes: Buffer,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (bytes.length === 0) return { ok: false, reason: "empty" };
  if (bytes.length > MAX_LOGO_BYTES) return { ok: false, reason: "too_big" };

  const mime = sniffImage(bytes);
  if (!mime) return { ok: false, reason: "not_an_image" };

  const done = await withDb(async (db) => {
    await db.execute(
      `INSERT INTO client_logos (client_id, mime, bytes) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE mime = VALUES(mime), bytes = VALUES(bytes)`,
      [clientId, mime, bytes],
    );
    return true;
  });
  return done ? { ok: true } : { ok: false, reason: "not_saved" };
}

export async function deleteLogo(clientId: number): Promise<boolean> {
  const done = await withDb(async (db) => {
    await db.execute("DELETE FROM client_logos WHERE client_id = ?", [clientId]);
    return true;
  });
  return done ?? false;
}

export async function readLogo(
  slug: string,
): Promise<{ mime: string; bytes: Buffer; updatedAt: string } | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & { mime: string; bytes: Buffer; updated_at: string })[]
    >(
      `SELECT l.mime, l.bytes, l.updated_at
         FROM client_logos l JOIN clients c ON c.id = l.client_id
        WHERE c.slug = ? LIMIT 1`,
      [slug.trim().toLowerCase()],
    );
    const row = rows[0];
    return row ? { mime: row.mime, bytes: row.bytes, updatedAt: String(row.updated_at) } : null;
  });
  return found ?? null;
}

/** Whether there is one, without pulling the bytes back to find out. */
export async function hasLogo(clientId: number): Promise<boolean> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT 1 FROM client_logos WHERE client_id = ? LIMIT 1",
      [clientId],
    );
    return rows.length > 0;
  });
  return found ?? false;
}
