import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

/**
 * Records somebody who ran a website scan.
 *
 * For now it emails the details through, the same way the contact form does.
 * Once the MySQL credentials are in the environment this also writes a row, so
 * the admin page has something to list and the follow-up sequence has
 * something to work from. Emailing stays either way — it is a free backup and
 * it means a database problem never silently loses a lead.
 *
 * The scan is never blocked on this succeeding. If it fails the visitor still
 * gets their report; we just lose the record, which is the right way round.
 */

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
  marketingConsent?: unknown;
};

/** Enough to stop a form post turning into an email of arbitrary size. */
const MAX_FIELD = 200;

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_FIELD) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Payload | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const website = clean(body.website);
  const consent = body.marketingConsent === true;

  if (!name || !email || !phone || !website) {
    return NextResponse.json({ success: false, error: "missing_fields" }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("Scan lead: SMTP environment variables are not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  // Consent is recorded either way. "No" matters as much as "yes": it is the
  // record showing the follow-up sequence was not sent to someone who had not
  // agreed to it.
  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Website: ${website}`,
    "",
    `Marketing consent: ${consent ? "YES — may receive the follow-up sequence" : "NO — report only, do not add to any list"}`,
    `Captured: ${new Date().toISOString()}`,
  ];

  try {
    await transporter.sendMail({
      from: `"Shaz Marketing Group Website" <${SMTP_USER}>`,
      to: siteConfig.email,
      replyTo: email,
      subject: `Website scan: ${website}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Scan lead: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
