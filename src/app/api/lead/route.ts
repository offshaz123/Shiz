import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";
import { sendMetaLeadEvent } from "@/lib/meta-conversions-api";

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "business", label: "Business" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "industry", label: "Industry" },
  { key: "budget", label: "Budget" },
  { key: "message", label: "Message" },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || (body as Record<string, unknown>)._honey) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const data = body as Record<string, string>;
  if (!data.name || !data.email || !data.phone) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error("Lead form: SMTP environment variables are not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const rows = FIELDS.filter((f) => data[f.key]).map((f) => `${f.label}: ${data[f.key]}`).join("\n");

  try {
    await transporter.sendMail({
      from: `"Shaz Marketing Group Website" <${SMTP_USER}>`,
      to: siteConfig.email,
      replyTo: data.email,
      subject: `New lead: ${data.business || data.name}`,
      text: rows,
    });
  } catch (err) {
    console.error("Lead form: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  if (data.eventId) {
    void sendMetaLeadEvent({ request, eventId: data.eventId, email: data.email, phone: data.phone });
  }

  return NextResponse.json({ success: true });
}
