import nodemailer from "nodemailer";
import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { mintToken } from "./lead-tokens";
import { buildFollowUp, type EmailLead, type StoredAudit } from "./follow-up-emails";
import { siteConfig } from "./site-config";

/**
 * Sends one follow-up email to one lead.
 *
 * Shared by the nightly scheduler and the Send-now buttons in the admin page,
 * so there is one copy of this and not two that drift apart.
 *
 * It does not decide *whether* a step is due — the caller does. The scheduler
 * paces itself; a person clicking a button in the admin page has already
 * decided, and being told to wait twenty hours would just be the software
 * arguing with them.
 *
 * What it will not do under any circumstances is send the same step twice.
 * The row is claimed before the email goes out, and the unique key on
 * (lead_id, step) means a second attempt fails at the database rather than
 * relying on this function being called carefully.
 */

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "no_database" | "no_lead" | "already_sent" | "no_smtp" | "send_failed" };

interface LeadRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  website: string;
  audit_json: string | null;
  unsubscribed_at: Date | null;
}

export async function sendFollowUp(leadId: number, step: number): Promise<SendResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return { ok: false, reason: "no_smtp" };

  const lead = await withDb(async (db) => {
    const [rows] = await db.query<LeadRow[]>(
      "SELECT id, name, email, website, audit_json, unsubscribed_at FROM scan_leads WHERE id = ?",
      [leadId],
    );
    return rows[0] ?? null;
  });

  if (lead === null) return { ok: false, reason: "no_database" };
  if (!lead.id) return { ok: false, reason: "no_lead" };

  // Unsubscribing stops everything, including a manual send. Someone who
  // asked not to be emailed does not get emailed because a button was handy.
  if (lead.unsubscribed_at !== null) return { ok: false, reason: "already_sent" };

  let audit: StoredAudit | null = null;
  if (lead.audit_json) {
    try {
      audit = JSON.parse(lead.audit_json) as StoredAudit;
    } catch {
      audit = null;
    }
  }

  const unsubscribeToken = mintToken("unsubscribe", lead.id);
  if (!unsubscribeToken) return { ok: false, reason: "no_smtp" };
  const unsubscribeUrl = `${siteConfig.url}/unsubscribe?t=${unsubscribeToken}`;

  const emailLead: EmailLead = {
    id: lead.id,
    name: lead.name,
    website: lead.website,
    audit,
  };

  const email = buildFollowUp(step, emailLead, unsubscribeUrl);
  if (!email) return { ok: false, reason: "no_lead" };

  // Claim it first. A duplicate-key error here means this step has already
  // gone out, which is a refusal rather than a failure.
  const claimed = await withDb(async (db) => {
    await db.execute(
      "INSERT INTO lead_emails (lead_id, step, subject, status) VALUES (?, ?, ?, 'sending')",
      [lead.id, step, email.subject],
    );
    return true;
  });
  if (!claimed) return { ok: false, reason: "already_sent" };

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      // Follow-ups go out from their own address rather than the inbox
      // clients write to. Two reasons: a sequence that gets marked as spam
      // then damages the reputation of the sending address, and that must
      // not be info@, which is where real correspondence lands. Set
      // MAIL_FROM to a mailbox the SMTP user may send as — most servers
      // reject a From that the authenticated account has no rights to, so
      // the safe route is a real second mailbox with its own credentials.
      // Falls back to the SMTP user, which is the behaviour until it is set.
      //
      // Deliberately a human address, never noreply@: these emails are
      // written to be replied to, and that is the only thing they are for.
      from: `"Walid at Shaz Marketing Group" <${process.env.MAIL_FROM || SMTP_USER}>`,
      to: lead.email,
      replyTo: siteConfig.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    await withDb(async (db) => {
      await db.execute("UPDATE lead_emails SET status = 'sent' WHERE lead_id = ? AND step = ?", [
        lead.id,
        step,
      ]);
    });
    return { ok: true };
  } catch (err) {
    console.error(`Follow-up step ${step} failed for lead ${lead.id}:`, err);
    await withDb(async (db) => {
      await db.execute(
        "UPDATE lead_emails SET status = 'failed', error = ? WHERE lead_id = ? AND step = ?",
        [String(err).slice(0, 500), lead.id, step],
      );
    });
    return { ok: false, reason: "send_failed" };
  }
}
