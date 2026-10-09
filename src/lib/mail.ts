import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp", "application/pdf"];

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function transport() {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

type Mail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Attachment[];
  fromName?: string;
};

// Without SMTP settings the message is printed to the server log in
// development; in production that would silently lose orders, so it throws.
export async function sendMail(m: Mail) {
  if (!isMailConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured");
    console.log(`\n[email not configured] to ${m.to}: ${m.subject}\n${m.text}\n`);
    return;
  }
  await transport().sendMail({
    from: `${m.fromName ?? "PlatedUp"} <${process.env.SMTP_USER}>`,
    to: m.to,
    replyTo: m.replyTo,
    subject: m.subject,
    text: m.text,
    html: m.html,
    attachments: m.attachments,
  });
}

export function shopAddress() {
  return process.env.ORDERS_EMAIL || process.env.SMTP_USER || "";
}

export async function sendToShop(m: Omit<Mail, "to" | "fromName">) {
  await sendMail({ ...m, to: shopAddress(), fromName: "PlatedUp Website" });
}

// Reads uploaded files from a form, rejecting anything too big or of a type
// we don't accept. Returns an error message instead of throwing so the route
// can show it to the customer.
export async function readUploads(
  form: FormData,
  fields: { name: string; label: string; required: boolean }[],
): Promise<{ attachments: Attachment[] } | { error: string }> {
  const attachments: Attachment[] = [];
  for (const f of fields) {
    const file = form.get(f.name);
    if (!(file instanceof File) || file.size === 0) {
      if (f.required) return { error: `Please upload your ${f.label}.` };
      continue;
    }
    if (file.size > MAX_FILE_BYTES) return { error: `Your ${f.label} file is over 10MB. Please upload a smaller photo.` };
    if (file.type && !ALLOWED_TYPES.includes(file.type))
      return { error: `Your ${f.label} must be a photo (JPG, PNG, HEIC) or a PDF.` };
    attachments.push({
      filename: `${f.label.replace(/[^a-z0-9]+/gi, "-")}-${file.name}`.slice(0, 120),
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type || undefined,
    });
  }
  return { attachments };
}

export function field(form: FormData, name: string, max = 200) {
  const v = form.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function orderRef() {
  const n = Math.floor(Math.random() * 36 ** 5)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0");
  return `PU-${n}`;
}
