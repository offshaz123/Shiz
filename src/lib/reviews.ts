import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { withDb } from "./db";

/**
 * Reviews, and the one rule that matters: nothing shows until it is approved.
 *
 * Everything here reads from the database. There are no sample reviews, no
 * placeholder names and no "example" testimonials waiting to be swapped out
 * later, because the way fake testimonials end up on a live site is somebody
 * putting them there as filler and forgetting. An empty table renders an
 * empty section, which is the correct output when nobody has reviewed you yet.
 */

export type ReviewStatus = "pending" | "approved" | "hidden";

export type Review = {
  id: number;
  name: string;
  business: string | null;
  rating: number;
  body: string;
  status: ReviewStatus;
  email: string | null;
  createdAt: string;
};

interface ReviewRow extends RowDataPacket {
  id: number;
  name: string;
  business: string | null;
  rating: number;
  body: string;
  status: ReviewStatus;
  email: string | null;
  created_at: Date;
}

function toReview(row: ReviewRow): Review {
  return {
    id: row.id,
    name: row.name,
    business: row.business,
    rating: row.rating,
    body: row.body,
    status: row.status,
    email: row.email,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

/** What the public site shows. Approved only, newest first. */
export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  const rows = await withDb(async (db) => {
    const [result] = await db.query<ReviewRow[]>(
      `SELECT * FROM reviews WHERE status = 'approved'
       ORDER BY created_at DESC LIMIT ?`,
      [limit],
    );
    return result;
  });

  // No database, or a failed query, means no reviews — never a fallback set.
  return (rows ?? []).map(toReview);
}

/** Everything, for the admin page. */
export async function getAllReviews(limit = 200): Promise<Review[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<ReviewRow[]>(
      `SELECT * FROM reviews
       ORDER BY FIELD(status, 'pending', 'approved', 'hidden'), created_at DESC
       LIMIT ?`,
      [limit],
    );
    return rows.map(toReview);
  });
}

export async function createReview(input: {
  name: string;
  business: string | null;
  rating: number;
  body: string;
  email: string | null;
}): Promise<number | null> {
  return withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO reviews (name, business, rating, body, email, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [input.name, input.business, input.rating, input.body, input.email],
    );
    return result.insertId;
  });
}

export async function setReviewStatus(id: number, status: ReviewStatus): Promise<void> {
  await withDb(async (db) => {
    await db.execute("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
  });
}

export async function deleteReview(id: number): Promise<void> {
  await withDb(async (db) => {
    await db.execute("DELETE FROM reviews WHERE id = ?", [id]);
  });
}

/** Average and count across approved reviews, for the heading. */
export function summarise(reviews: Review[]): { average: number; count: number } | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}
