import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { brand } from "@/lib/brand";

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "business", label: "Company" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "businessType", label: "Business type" },
  { key: "volume", label: "Monthly volume in" },
  { key: "currency", label: "Pays suppliers in" },
  { key: "currentProvider", label: "Currently banks with" },
  { key: "message", label: "Message" },
  { key: "source", label: "Came from" },
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
    console.error("Enquiry form: SMTP environment variables are not configured");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const rows = FIELDS.filter((field) => data[field.key])
    .map((field) => `${field.label}: ${data[field.key]}`)
    .join("\n");

  try {
    await transporter.sendMail({
      from: `"${brand.name} website" <${SMTP_USER}>`,
      to: brand.email,
      replyTo: data.email,
      subject: `New enquiry: ${data.business || data.name}`,
      text: rows,
    });
  } catch (err) {
    console.error("Enquiry form: failed to send email", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
