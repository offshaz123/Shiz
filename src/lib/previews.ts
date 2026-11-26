import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomBytes } from "node:crypto";
import { withDb } from "./db";
import { siteConfig } from "./site-config";

/**
 * The pages we build for a business out of their own website.
 *
 * One row per page sent. The token is the whole of its security, because
 * these carry somebody else's logo and photographs: unguessable, never
 * indexed, and dead after a week whether anybody looked or not.
 *
 * The slug exists only so the link reads like the business it belongs to.
 * "shazmarketing.com/preview/auto-supreme-9f2a1c" gets opened; a page of
 * random characters gets deleted. It is never used to find the row, so a
 * business that renames itself breaks nothing.
 *
 * The opens are the point of keeping any of this. A business that opened
 * their page three times is the best call on the list that morning, and
 * before this there was no way to know.
 */

/** A week. Long enough to get round to it, short enough to be a reason to ring. */
export const PREVIEW_DAYS = 7;

export type Preview = {
  id: number;
  prospectId: number;
  token: string;
  slug: string;
  createdAt: string;
  expiresAt: string;
  opens: number;
  firstOpenedAt: string | null;
  lastOpenedAt: string | null;
};

interface Row extends RowDataPacket {
  id: number;
  prospect_id: number;
  token: string;
  slug: string;
  created_at: string;
  expires_at: string;
  opens: number;
  first_opened_at: string | null;
  last_opened_at: string | null;
}

function toPreview(row: Row): Preview {
  return {
    id: Number(row.id),
    prospectId: Number(row.prospect_id),
    token: String(row.token),
    slug: String(row.slug),
    createdAt: String(row.created_at),
    expiresAt: String(row.expires_at),
    opens: Number(row.opens ?? 0),
    firstOpenedAt: row.first_opened_at ? String(row.first_opened_at) : null,
    lastOpenedAt: row.last_opened_at ? String(row.last_opened_at) : null,
  };
}

/**
 * A business name as it will appear in the address.
 *
 * Kept short and plain. Accents and ampersands come out, so the link can
 * be pasted into a message without turning into percent signs.
 */
export function slugFor(name: string): string {
  const clean = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return clean || "business";
}

/** The address to put in the email. */
export function previewUrl(preview: { slug: string; token: string }): string {
  return `${siteConfig.url}/preview/${preview.slug}-${preview.token}`;
}

/**
 * The token out of the last part of the address.
 *
 * Everything before the final hyphen is the slug and is ignored, so
 * somebody forwarding "the-wrong-name-9f2a1c3d4e5f6a7b" still lands on
 * the right page.
 */
export function tokenFrom(segment: string): string {
  const last = segment.split("-").pop() ?? "";
  return /^[a-f0-9]{16}$/.test(last) ? last : "";
}

/** Builds one, with a week on the clock. Returns null if the database is away. */
export async function createPreview(
  prospectId: number,
  businessName: string,
): Promise<Preview | null> {
  const token = randomBytes(8).toString("hex");
  const slug = slugFor(businessName);

  const made = await withDb(async (db) => {
    const [res] = await db.execute<ResultSetHeader>(
      `INSERT INTO prospect_previews (prospect_id, token, slug, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [prospectId, token, slug, PREVIEW_DAYS],
    );
    return res.insertId;
  });
  if (!made) return null;

  return byToken(token);
}

export async function byToken(token: string): Promise<Preview | null> {
  if (!/^[a-f0-9]{16}$/.test(token)) return null;
  const found = await withDb(async (db) => {
    const [rows] = await db.query<Row[]>(
      `SELECT * FROM prospect_previews WHERE token = ? LIMIT 1`,
      [token],
    );
    return rows[0] ?? null;
  });
  return found ? toPreview(found) : null;
}

/**
 * Written down the moment somebody opens it.
 *
 * Counted even after the page has expired, because a business coming
 * back to a dead link is still a business worth ringing, and arguably a
 * better one.
 */
export async function recordOpen(token: string): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE prospect_previews
          SET opens = opens + 1,
              first_opened_at = COALESCE(first_opened_at, NOW()),
              last_opened_at = NOW()
        WHERE token = ?`,
      [token],
    );
  }).catch(() => null);
}

/** The newest page built for each of these businesses, for the call list. */
export async function previewsForProspects(
  ids: number[],
): Promise<Map<number, Preview> | null> {
  if (ids.length === 0) return new Map();
  return withDb(async (db) => {
    const [rows] = await db.query<Row[]>(
      `SELECT p.* FROM prospect_previews p
         JOIN (SELECT prospect_id, MAX(id) AS newest
                 FROM prospect_previews
                WHERE prospect_id IN (${ids.map(() => "?").join(",")})
                GROUP BY prospect_id) latest
           ON latest.newest = p.id`,
      ids,
    );
    const out = new Map<number, Preview>();
    for (const row of rows) out.set(Number(row.prospect_id), toPreview(row));
    return out;
  });
}

/**
 * Thrown away when the email it was made for never left.
 *
 * The page is built before the email so the link can go inside it. If
 * the send then fails, the row still exists, and because it exists
 * this business can never be sent one again: a mail server having a
 * bad minute would quietly cost us the best email we had for them.
 */
export async function dropPreview(id: number): Promise<void> {
  await withDb(async (db) => {
    await db.execute("DELETE FROM prospect_previews WHERE id = ?", [id]);
  }).catch(() => null);
}

/** Whether one has ever been built for this business. One each, ever. */
export async function hasPreview(prospectId: number): Promise<boolean> {
  const n = await withDb(async (db) => {
    const [[row]] = await db.query<(RowDataPacket & { n: number })[]>(
      `SELECT COUNT(*) AS n FROM prospect_previews WHERE prospect_id = ?`,
      [prospectId],
    );
    return Number(row?.n ?? 0);
  });
  return (n ?? 0) > 0;
}

/**
 * Who has opened one and not been rung since.
 *
 * The reason the whole thing earns its keep: a morning list of people
 * who have already looked, in the order of how interested they seem.
 */
export type WarmPreview = {
  prospectId: number;
  business: string;
  phone: string;
  opens: number;
  lastOpenedAt: string;
  region: string;
};

export async function openedPreviews(regions?: string[]): Promise<WarmPreview[] | null> {
  return withDb(async (db) => {
    const where = [
      "v.opens > 0",
      "p.deleted_at IS NULL",
      "p.status NOT IN ('customer', 'not-interested')",
      // Opened since the last time anybody rang them, so a business that
      // has already been spoken to drops off rather than nagging.
      "(p.called_at IS NULL OR v.last_opened_at > p.called_at)",
    ];
    const params: string[] = [];
    if (regions && regions.length > 0) {
      where.push(`p.region IN (${regions.map(() => "?").join(", ")})`);
      params.push(...regions);
    }

    const [rows] = await db.query<
      (RowDataPacket & {
        prospect_id: number;
        name: string;
        phone: string | null;
        opens: number;
        last_opened_at: string;
        region: string;
      })[]
    >(
      `SELECT v.prospect_id, p.name, p.phone, v.opens, v.last_opened_at, p.region
         FROM prospect_previews v
         JOIN prospects p ON p.id = v.prospect_id
        WHERE ${where.join(" AND ")}
        ORDER BY v.opens DESC, v.last_opened_at DESC
        LIMIT 50`,
      params,
    );

    return rows.map((r) => ({
      prospectId: Number(r.prospect_id),
      business: String(r.name ?? ""),
      phone: String(r.phone ?? ""),
      opens: Number(r.opens ?? 0),
      lastOpenedAt: String(r.last_opened_at),
      region: String(r.region ?? "uk"),
    }));
  });
}
