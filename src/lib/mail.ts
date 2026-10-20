import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp", "application/pdf"];

// Settings pasted into Hostinger can carry stray spaces or quotes.
const env = (name: string) => (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");

export function isMailConfigured() {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

function transport(timeout = 10000) {
  // 465 unless a different number was set (a blank or mistyped port would hang).
  const port = Number(env("SMTP_PORT")) || 465;
  return nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout * 2,
  });
}

// Logs in to the email server without sending anything (for the admin status bar).
export async function verifyMail() {
  const host = env("SMTP_HOST");
  const port = Number(env("SMTP_PORT")) || 465;
  try {
    // Gives up before the status bar's own 8 second limit, so the real reason shows.
    await transport(6000).verify();
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "EAUTH") throw new Error(`The email server said the password is wrong for ${env("SMTP_USER")}. Check SMTP_PASS in Hostinger.`);
    if (e.code === "EDNS" || e.code === "ENOTFOUND") throw new Error(`Couldn't find the email server "${host}". SMTP_HOST should be smtp.hostinger.com.`);
    if (e.code === "ETIMEDOUT" || e.code === "ECONNECTION" || e.code === "ESOCKET")
      throw new Error(`Couldn't reach ${host} on port ${port}. SMTP_HOST should be smtp.hostinger.com and SMTP_PORT 465.`);
    throw err;
  }
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
    from: `${m.fromName ?? "PlatedUp"} <${env("SMTP_USER")}>`,
    to: m.to,
    replyTo: m.replyTo,
    subject: m.subject,
    text: m.text,
    html: m.html,
    attachments: m.attachments,
  });
}

export function shopAddress() {
  return env("ORDERS_EMAIL") || env("SMTP_USER");
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
