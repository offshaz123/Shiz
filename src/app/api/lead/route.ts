import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";

const REQUIRED_FIELDS = ["name", "business", "email", "phone"];

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  business: "Business name",
  email: "Email",
  phone: "Phone number",
  industry: "Business category",
  budget: "Monthly ad budget",
  message: "Message",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  if ((data.get("_honey") as string)?.length) {
    return NextResponse.json({ ok: true });
  }

  const fields: Record<string, string> = {};
  for (const key of Object.keys(FIELD_LABELS)) {
    const value = data.get(key);
    if (typeof value === "string") fields[key] = value.trim();
  }

  for (const field of REQUIRED_FIELDS) {
    if (!fields[field]) {
      return NextResponse.json(
        { ok: false, error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) {
    console.error("GMAIL_USER / GMAIL_APP_PASSWORD is not configured");
    return NextResponse.json(
      { ok: false, error: "Email delivery is not configured yet." },
      { status: 500 }
    );
  }

  const rows = Object.entries(fields)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 14px;font-weight:600;border:1px solid #e4e4e9;">${
          FIELD_LABELS[key] ?? key
        }</td><td style="padding:6px 14px;border:1px solid #e4e4e9;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    await transporter.sendMail({
      from: `"Shaz Marketing Group Website" <${gmailUser}>`,
      to: siteConfig.email,
      replyTo: fields.email,
      subject: `New website lead: ${fields.business || fields.name}`,
      html: `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`,
    });
  } catch (err) {
    console.error("Gmail send error", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send email notification." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
