import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

/** Deliberately loose — this catches typos, not every invalid address. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || (body as Record<string, unknown>)._honey) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const email = String((body as Record<string, unknown>).email ?? "").trim();
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ success: false, error: "invalid_email" }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("Subscribe: SMTP environment variables are not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"Shaz Marketing Group Website" <${SMTP_USER}>`,
      to: siteConfig.email,
      replyTo: email,
      subject: "New newsletter subscriber",
      text: `${email} subscribed to marketing tips from the website footer.`,
    });
  } catch (err) {
    console.error("Subscribe: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
