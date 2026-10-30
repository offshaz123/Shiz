import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createReview } from "@/lib/reviews";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

/**
 * Takes a review from a customer.
 *
 * Everything arrives as pending and nothing reaches the site until it is
 * approved in the admin page. That is not a moderation nicety — a public form
 * that published straight to the homepage would be an open invitation to
 * whoever found it.
 */

const MAX_NAME = 120;
const MAX_BUSINESS = 160;
const MAX_BODY = 2000;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false }, { status: 400 });

  // Honeypot. Answered as success so a bot learns nothing from being caught.
  if (clean(body.company, 100)) return NextResponse.json({ success: true });

  const name = clean(body.name, MAX_NAME);
  const business = clean(body.business, MAX_BUSINESS) || null;
  const text = clean(body.body, MAX_BODY);
  const email = clean(body.email, 200) || null;
  const rating = Number(body.rating);

  if (!name || !text || text.length < 10) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: "bad_rating" }, { status: 400 });
  }

  const id = await createReview({ name, business, rating, body: text, email });
  if (!id) {
    return NextResponse.json({ success: false, error: "not_saved" }, { status: 500 });
  }

  // Tell Walid there's something waiting, so a review doesn't sit unapproved
  // for a fortnight. A failure here doesn't matter — the row is already saved.
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      await transporter.sendMail({
        from: `"Shaz Marketing Group Website" <${SMTP_USER}>`,
        to: siteConfig.email,
        replyTo: email ?? undefined,
        subject: `New review awaiting approval — ${rating}/5 from ${name}`,
        text: [
          `${rating} out of 5`,
          `From: ${name}${business ? ` (${business})` : ""}`,
          email ? `Email: ${email}` : "No email given",
          "",
          text,
          "",
          `Approve or hide it at ${siteConfig.url}/admin`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Review notification failed to send", err);
    }
  }

  return NextResponse.json({ success: true });
}
