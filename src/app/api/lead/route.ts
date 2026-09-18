import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/lib/site-config";
import { sendMetaLeadEvent } from "@/lib/meta-conversions-api";

/** 5MB, matching the form. Base64 inflates by roughly a third on the wire. */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg"];

const FIELDS: { key: string; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "business", label: "Business" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "industry", label: "Industry" },
  { key: "budget", label: "Budget" },
  { key: "website", label: "Website" },
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

  // Optional attachment. Re-checked server-side — the browser limit is a
  // convenience, not a control, since anything can post to this endpoint.
  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  if (data.attachmentData && data.attachmentName) {
    const buffer = Buffer.from(data.attachmentData, "base64");
    if (buffer.length > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ success: false, error: "attachment_too_large" }, { status: 413 });
    }
    const extension = data.attachmentName.toLowerCase().slice(data.attachmentName.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ success: false, error: "attachment_type" }, { status: 415 });
    }
    attachments.push({
      // Strip any path the browser may have included, and keep the name plain.
      filename: data.attachmentName.replace(/[^\w.\- ]+/g, "_").slice(-80),
      content: buffer,
      contentType: data.attachmentType || "application/octet-stream",
    });
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
      text: attachments.length ? `${rows}\n\nAttachment: ${attachments[0].filename}` : rows,
      ...(attachments.length ? { attachments } : {}),
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
