import nodemailer from "nodemailer";
import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { siteConfig } from "./site-config";

/**
 * The reply a new enquiry gets within seconds of arriving.
 *
 * The single highest-value automation a local business has. Somebody who
 * fills in a form at nine at night has usually filled in three others, and
 * the business that answers first is the one still in the running by
 * breakfast. It is also the only thing that moves the reply-time figure on
 * their dashboard from days to minutes without anybody changing how they
 * work.
 *
 * Off until the client switches it on, with wording they can change. An
 * auto-reply that does not sound like them is worse than none: it tells
 * the customer they are in a system rather than talking to a person.
 *
 * Deliberately not counted as answering them. first_replied_at stays null
 * and the dashboard still says "not answered yet", because a machine
 * saying "we'll be in touch" is not a reply and a figure that counts it as
 * one is a figure that flatters. auto_replied_at is its own column.
 *
 * Never throws. A mail server having a bad minute must not lose the
 * enquiry, which is the thing that actually matters.
 */

const DEFAULT_TEXT = `Thanks for getting in touch. I've got your message and I'll come back to you shortly.

If it's urgent, give me a ring.`;

interface ClientRow extends RowDataPacket {
  name: string;
  contact_email: string | null;
  auto_reply_on: number;
  auto_reply_text: string | null;
}

export async function sendAutoReply(clientId: number, leadId: number, to: string): Promise<void> {
  if (!to || !to.includes("@")) return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return;

  const client = await withDb(async (db) => {
    const [rows] = await db.query<ClientRow[]>(
      `SELECT name, contact_email, auto_reply_on, auto_reply_text
         FROM clients WHERE id = ? AND is_active = 1 LIMIT 1`,
      [clientId],
    );
    return rows[0] ?? null;
  });

  if (!client || !client.auto_reply_on) return;

  const body = [
    (client.auto_reply_text?.trim() || DEFAULT_TEXT),
    ``,
    client.name,
  ].join("\n");

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      // Their name, our address: sending as their domain would fail SPF and
      // land in spam, which is worse for them than an unfamiliar address.
      from: `"${client.name}" <${process.env.MAIL_FROM || SMTP_USER}>`,
      to,
      // A reply belongs to the business, not to us.
      replyTo: client.contact_email || siteConfig.email,
      subject: `Thanks for getting in touch`,
      text: body,
    });

    await withDb(async (db) => {
      await db.execute(
        "UPDATE client_leads SET auto_replied_at = NOW() WHERE id = ? AND client_id = ?",
        [leadId, clientId],
      );
    });
  } catch (err) {
    // Said out loud but never raised. The enquiry is already saved, and
    // that is the thing worth protecting.
    console.error(`Auto-reply for lead ${leadId}:`, err);
  }
}
