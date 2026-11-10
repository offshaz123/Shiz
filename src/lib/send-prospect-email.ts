import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { getProspect, recordProspectEmail } from "./prospects";
import { siteConfig } from "./site-config";
import { fileInSent } from "./mail-store";
import { mintToken } from "./lead-tokens";

/**
 * Sends one outreach email to one prospect.
 *
 * Why this exists at all: a mailto: link does nothing on a machine with no
 * desktop mail client, and Hostinger's webmail cannot be handed a pre-filled
 * draft from a URL. So the admin page composes the email itself and the
 * server sends it through the same Hostinger SMTP account the rest of the
 * site already uses. The practical win is that it works from any device that
 * can log into /admin — a phone on a job, a borrowed laptop — with no mail
 * client set up and no webmail password to hand.
 *
 * The first email is never sent by anything but a person pressing send after
 * reading it. Steps 2 and 3 are sent by the cron, but only for a prospect
 * whose step 1 went out by hand, and they stop on a reply, an unsubscribe, or
 * any status that says the answer is already known. There is no "email all"
 * button and there should not be one: a sole trader is an individual
 * subscriber under PECR, and bulk cold email to one needs consent we do not
 * have.
 *
 * The recipient is read from the database and never taken from the request,
 * so this can only ever write to an address the scanner found on a prospect's
 * own website.
 */

export type SendProspectResult =
  | { ok: true; recipient: string; filedInSent: boolean }
  | {
      ok: false;
      reason:
        | "no_smtp"
        | "no_database"
        | "no_prospect"
        | "no_email"
        | "empty"
        | "unsubscribed"
        | "send_failed";
    };

const MAX_SUBJECT = 200;
const MAX_BODY = 20_000;

/** The one-click unsubscribe link for a prospect, or "" when there is no
 *  CRON_SECRET to sign it with — in which case the email says "reply and say
 *  so" and nothing links to a page that cannot work. */
export function prospectUnsubscribeUrl(id: number): string {
  const token = mintToken("unsubscribe-prospect", id);
  return token ? `${siteConfig.url}/unsubscribe?t=${token}` : "";
}

export async function sendProspectEmail(
  id: number,
  subject: string,
  body: string,
  step = 1,
): Promise<SendProspectResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return { ok: false, reason: "no_smtp" };

  const cleanSubject = subject.trim().slice(0, MAX_SUBJECT);
  const cleanBody = body.trim().slice(0, MAX_BODY);
  if (!cleanSubject || !cleanBody) return { ok: false, reason: "empty" };

  const prospect = await getProspect(id);
  if (!prospect) return { ok: false, reason: "no_prospect" };
  if (!prospect.email) return { ok: false, reason: "no_email" };
  // Not negotiable, and checked here rather than only in the cron so that a
  // button in the admin page cannot do it either.
  if (prospect.unsubscribedAt) return { ok: false, reason: "unsubscribed" };

  const fromAddress = process.env.MAIL_FROM || SMTP_USER;
  const unsubscribeUrl = prospectUnsubscribeUrl(id);

  // The raw message is built once and then both sent and filed, so the copy
  // in the Sent folder is the same message that arrived, with the same
  // Message-ID, rather than a near-identical re-rendering of it.
  const raw = await new MailComposer({
    from: `"Walid at Shaz Marketing Group" <${fromAddress}>`,
    to: prospect.email,
    replyTo: siteConfig.email,
    subject: cleanSubject,
    // Plain text only, on purpose. A one-to-one note about someone's website
    // should look like one, and an HTML template around four sentences reads
    // as a mailshot to both the recipient and the filters.
    text: cleanBody,
    headers: unsubscribeUrl
      ? {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : {},
  })
    .compile()
    .build();

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      raw,
      envelope: { from: fromAddress, to: [prospect.email] },
    });
  } catch (err) {
    console.error(`Outreach email to prospect ${id} failed:`, err);
    await recordProspectEmail(id, {
      recipient: prospect.email,
      subject: cleanSubject,
      body: cleanBody,
      step,
      status: "failed",
      error: String(err),
    });
    return { ok: false, reason: "send_failed" };
  }

  // Filed afterwards, and never allowed to fail the send: the email has
  // already gone, and a mailbox that would not take the copy does not change
  // that. The row below is the record either way.
  const filedInSent = await fileInSent(raw).catch(() => false);

  await recordProspectEmail(id, {
    recipient: prospect.email,
    subject: cleanSubject,
    body: cleanBody,
    step,
    status: "sent",
  });

  return { ok: true, recipient: prospect.email, filedInSent };
}
