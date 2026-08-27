import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "vehicle", label: "Vehicle" },
  { key: "service", label: "Service" },
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
      from: `"${siteConfig.name} Website" <${SMTP_USER}>`,
      to: siteConfig.email,
      replyTo: data.email,
      subject: `New quote request: ${data.service || data.name}`,
      text: rows,
    });
  } catch (err) {
    console.error("Lead form: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
