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
  // "old_site": left on the previous PlatedUp website and brought over as written.
  source: string | null;
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

// Reviews customers left on the previous PlatedUp website, copied over word
// for word (4 stars included) and added once, approved. Marked verified: the
// shop checked each one against the previous website's orders.
const OLD_SITE_REVIEWS: [string, number, string][] = [
  ["Callum", 5, "Really happy with the plates, quality is spot on and look great on the car. Would order again."],
  ["Imran Shah", 4, "Plates are really good quality and exactly what I ordered. Delivery took a little longer than expected but overall still would use them again."],
  ["Nathan Williams", 5, "Ordered on Monday and received them really quickly. Packaging was good and the plates look brilliant. Definitely recommend."],
  ["Ayaan", 5, "Very good service, easy ordering process and great quality plates. Happy customer!"],
  ["Michael James Carter", 5, "Honestly impressed with the quality. Didn't expect them to look this good for the price. Will definitely be coming back."],
  ["Reece", 4, "Plates are still really good and I would use them again, only reason I haven't given 5 stars is because I would have expected quicker delivery."],
  ["Bilal Mahmood", 5, "Good communication throughout and the plates arrived in perfect condition. Exactly what I wanted."],
  ["Josh Taylor", 5, "Quick delivery, great quality and no issues at all. Can't complain."],
  ["Sameer", 5, "Ordered replacement plates and they came out perfect. Really pleased with them."],
  ["Thomas Reed", 5, "Really easy website to order from. Everything was straightforward and the plates look premium once fitted."],
  ["Hamza", 5, "Quality is unreal for the price. Delivery was quick aswell. Happy with my purchase."],
  ["Daniel Robert Evans", 5, "Great experience from start to finish. Fast responses to my questions and the finished plates look exactly how I wanted them."],
  ["Aaron", 5, "Spot on, plates arrived quickly and look smart. Would recommend."],
  ["Usman Ali", 4, "Really happy with the plates themselves, quality is great and they look nice fitted. Would have given 5 stars if delivery was a bit quicker."],
  ["George Bennett", 5, "First time using PlatedUp and won't be the last. Great service, reasonable prices and excellent quality."],
  ["Ibrahim", 5, "Ordered a set for my new car and they look amazing. Came well packaged and the whole process was easy."],
  ["Kieran Murphy", 5, "Brilliant quality and really quick delivery. Exactly as described on the website."],
  ["Mo", 5, "Can't fault them. Easy to order and plates came quicker than expected. Top service."],
  ["Adam Hussain", 5, "Very impressed with the finish and overall quality. Had a question about my order and customer service was helpful. Definitely recommend."],
  ["Liam Cooper", 5, "Ordered online, received updates and my plates turned up safely packaged. Really good experience overall."],
];

let imported = false;
async function importOldSiteReviews() {
  if (imported) return;
  const first = await execute("INSERT IGNORE INTO weekly_reports (week) VALUES ('oldreviews')");
  if (first.affectedRows === 1)
    for (const [i, [name, rating, body]] of OLD_SITE_REVIEWS.entries())
      await execute("INSERT INTO reviews (name, email, rating, body, verified, status, source) VALUES (?, ?, ?, ?, 1, 'approved', 'old_site')", [
        name,
        `previous-site-${i + 1}@platedup.co.uk`,
        rating,
        body,
      ]);
  imported = true;
}

export async function listApprovedReviews(limit = 6) {
  await importOldSiteReviews();
  return query<Review>("SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?", [limit]);
}

export async function reviewSummary() {
  await importOldSiteReviews();
  const rows = await query<{ count: number; average: number | null }>(
    "SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews WHERE status = 'approved'",
  );
  return { count: Number(rows[0]?.count ?? 0), average: Number(rows[0]?.average ?? 0) };
}

export async function listAllReviews() {
  await importOldSiteReviews();
  return query<Review>("SELECT * FROM reviews ORDER BY status = 'pending' DESC, created_at DESC LIMIT 200");
}

export async function setReviewStatus(id: number, status: ReviewStatus) {
  await execute("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
}

export async function deleteReview(id: number) {
  await execute("DELETE FROM reviews WHERE id = ?", [id]);
}
