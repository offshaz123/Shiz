import { isValidEmail } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { clientIp, rateLimited } from "@/lib/places";
import { createReview } from "@/lib/reviews";

// A customer leaving a review. It's saved for the shop to approve first.
export async function POST(req: Request) {
  if (rateLimited(`review:${clientIp(req)}`, 5))
    return Response.json({ error: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
  if (!isDbConfigured()) return Response.json({ error: "Reviews aren't available right now." }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  // Hidden field only bots fill in.
  if (b.website) return Response.json({ ok: true });
  const name = String(b.name ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
  const email = String(b.email ?? "").trim().slice(0, 190);
  const rating = Math.round(Number(b.rating));
  const body = String(b.body ?? "").trim().slice(0, 1500);
  if (name.length < 2) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!isValidEmail(email)) return Response.json({ error: "Please enter a valid email (it won't be shown)." }, { status: 400 });
  if (!(rating >= 1 && rating <= 5)) return Response.json({ error: "Please choose a star rating." }, { status: 400 });
  if (body.length < 10) return Response.json({ error: "Please write a few words about your plates." }, { status: 400 });
  try {
    await createReview({ name, email, rating, body });
  } catch (err) {
    console.error("Saving review failed", err);
    return Response.json({ error: "We couldn't save your review. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
