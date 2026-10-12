import { execute, query } from "./db";

// Reviews customers leave on the website. Every review waits for the shop
// to approve it (Admin → Reviews) before it shows.

export type ReviewStatus = "pending" | "approved" | "hidden";

export type Review = {
  id: number;
  name: string;
  email: string;
  rating: number;
  body: string;
  // The email matches a paid order, so they really bought from us.
  verified: number;
  status: ReviewStatus;
  created_at: Date;
};

export async function createReview(r: { name: string; email: string; rating: number; body: string }) {
  const bought = await query(
    "SELECT 1 FROM orders WHERE LOWER(email) = ? AND status IN ('paid', 'in_production', 'dispatched') LIMIT 1",
    [r.email.toLowerCase()],
  );
  await execute("INSERT INTO reviews (name, email, rating, body, verified) VALUES (?, ?, ?, ?, ?)", [
    r.name,
    r.email.toLowerCase(),
    r.rating,
    r.body,
    bought.length ? 1 : 0,
  ]);
}

export async function listApprovedReviews(limit = 6) {
  return query<Review>("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?", [limit]);
}

export async function reviewSummary() {
  const rows = await query<{ count: number; average: number | null }>(
    "SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE status = 'approved'",
  );
  return { count: Number(rows[0]?.count ?? 0), average: Number(rows[0]?.average ?? 0) };
}

export async function listAllReviews() {
  return query<Review>("SELECT * FROM reviews ORDER BY status = 'pending' DESC, created_at DESC LIMIT 200");
}

export async function setReviewStatus(id: number, status: ReviewStatus) {
  await execute("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteReview(id: number) {
  await execute("DELETE FROM reviews WHERE id = ?", [id]);
}
