import nodemailer from "nodemailer";

/**
 * One transport, shared by the enquiry form and the welcome email.
 *
 * Returns null rather than throwing when SMTP is not configured, so a caller
 * can decide whether that is fatal. For an enquiry it is; for a welcome
 * email it is not — nobody should fail to get an account because the mail
 * server is misconfigured.
 */
export function mailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    // Implicit TLS on 465; 587 negotiates STARTTLS instead.
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export const mailFrom = () => process.env.SMTP_USER ?? "";
