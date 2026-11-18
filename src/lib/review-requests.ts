import nodemailer from "nodemailer";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { siteConfig } from "./site-config";

/**
 * Asking a client's customer for a review, the day after the job.
 *
 * The single most valuable thing a local business can automate. Reviews
 * are what decide the map pack and what a stranger reads before ringing,
 * and almost nobody asks — not because they do not want to, but because
 * the moment to ask is the evening after a job and that is exactly when
 * nobody is doing admin.
 *
 * Three things keep this from being a nuisance:
 *
 *  - Off unless the client switches it on, and silent without their review
 *    link. An email asking somebody to leave a review with nowhere to
 *    leave it is worse than no email.
 *  - One per job, ever, stamped after the send rather than before.
 *  - A day after the job, not the same evening. Same-day reads as pushy
 *    and arrives while they are still deciding what they think.
 *
 * On who it comes from. It is sent through our mail server, because that
 * is the only one we have credentials for, so the From address is ours and
 * the display name is the client's business. Sending as their own domain
 * would fail SPF and DKIM and land in spam, which would be worse for them
 * than a slightly odd address. Reply-to is the client, so a reply reaches
 * the business and not us, and the body says plainly who is asking.
 */

export type ReviewRun = { sent: number; failed: number; considered: number };

interface DueRow extends RowDataPacket {
  booking_id: number;
  customer_name: string;
  email: string;
  job: string | null;
  client_name: string;
  client_email: string | null;
  review_link: string;
}

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendReviewRequests(): Promise<ReviewRun> {
  const run: ReviewRun = { sent: 0, failed: 0, considered: 0 };

  const due = await withDb(async (db) => {
    const [rows] = await db.query<DueRow[]>(
      `SELECT b.id AS booking_id, b.customer_name, b.email, b.job,
              c.name AS client_name, c.contact_email AS client_email, c.review_link
         FROM client_bookings b
         JOIN clients c ON c.id = b.client_id
        WHERE b.status = 'done'
          AND b.review_sent_at IS NULL
          AND b.email IS NOT NULL AND b.email <> ''
          AND b.booked_on <= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          AND b.booked_on >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
          AND c.is_active = 1
          AND c.review_requests_on = 1
          AND c.review_link IS NOT NULL AND c.review_link <> ''
        ORDER BY b.booked_on ASC
        LIMIT 50`,
    );
    return rows;
  });

  if (!due || due.length === 0) return run;
  run.considered = due.length;

  const mail = transport();
  if (!mail) return run;

  for (const row of due) {
    // Written as the business, in the plainest possible words. A review
    // request that reads like marketing gets deleted; one that reads like
    // the person who did the work gets answered.
    const first = row.customer_name.trim().split(/\s+/)[0] || "there";
    const body = [
      `Hi ${first},`,
      ``,
      row.job
        ? `Thanks for having us out for the ${row.job.toLowerCase()}.`
        : `Thanks for your custom the other day.`,
      ``,
      `If you were happy with it, would you mind leaving us a quick review? It genuinely makes a difference to a business our size, and it takes about thirty seconds:`,
      ``,
      row.review_link,
      ``,
      `And if anything was not right, reply to this instead and tell me — I would rather hear it from you than read it later.`,
      ``,
      `Thanks,`,
      row.client_name,
    ].join("\n");

    try {
      await mail.sendMail({
        from: `"${row.client_name}" <${process.env.MAIL_FROM || process.env.SMTP_USER || siteConfig.email}>`,
        to: row.email,
        // A reply belongs to the business that did the work, not to us.
        replyTo: row.client_email || siteConfig.email,
        subject: `Quick favour, ${first}?`,
        text: body,
      });

      // Only after it has gone, so a failure is retried rather than lost.
      await withDb(async (db) => {
        await db.execute<ResultSetHeader>(
          "UPDATE client_bookings SET review_sent_at = NOW() WHERE id = ?",
          [row.booking_id],
        );
      });
      run.sent += 1;
    } catch (err) {
      console.error(`Review request for booking ${row.booking_id}:`, err);
      run.failed += 1;
    }
  }

  return run;
}
