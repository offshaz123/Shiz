import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { ResultSetHeader } from "mysql2";
import { siteConfig } from "@/lib/site-config";
import { withDb } from "@/lib/db";
import { mintToken } from "@/lib/lead-tokens";

export const runtime = "nodejs";

/**
 * Records somebody who ran a website scan.
 *
 * It writes a row for the admin page and the follow-up sequence to work from,
 * and emails the details through the same way the contact form does. Both,
 * deliberately: the email is a free backup, so a database problem never
 * silently loses a lead.
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

  const referrer = request.headers.get("referer")?.slice(0, 255) ?? null;

  // Recorded first, so the id is available for the email. A null here means
  // there is no database configured or it refused the write; the lead still
  // goes out by email below.
  const leadId = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO scan_leads (name, email, phone, website, marketing_consent, referrer)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, website, consent ? 1 : 0, referrer],
    );
    return result.insertId;
  });

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
    leadId
      ? `Saved as lead #${leadId}.`
      : "NOT SAVED to the database — this email is the only record of it.",
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

  // The token lets the browser attach the finished audit to this row once the
  // scan completes, without ever handing out the row id — the ids are
  // sequential, so in the clear they would let anyone overwrite other people's
  // results by counting upwards.
  return NextResponse.json({
    success: true,
    token: leadId ? mintToken("result", leadId) : null,
  });
}
