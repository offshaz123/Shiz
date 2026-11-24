import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { getProspect, recordProspectEmail } from "./prospects";
import { siteConfig } from "./site-config";
import { fileInSent } from "./mail-store";
import { prospectUnsubscribeUrl } from "./unsubscribe-url";

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
 * All three emails can now be sent by the scheduler, including the first.
 * That used to be untrue and this comment used to say so at length: step 1
 * was a person pressing send after reading it, and there was no "email all"
 * button because a sole trader is an individual subscriber under PECR and
 * bulk cold email to one needs consent we do not have.
 *
 * Walid was asked about exactly that and chose to send to everyone on the
 * list. The PECR position has not changed, so it is written down here rather
 * than quietly dropped: limited companies may be emailed with an opt-out,
 * sole traders strictly need consent first, and nothing in this file can
 * tell the two apart. What it does enforce is the part that is enforceable
 * — a working one-click unsubscribe on every message, honoured immediately
 * and checked here as well as in the cron, so no button or scheduler can
 * write to somebody who has used it.
 *
 * Every send is stamped with whether the scheduler or a person sent it, so
 * the admin page can show what the site has done on its own.
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

export async function sendProspectEmail(
  id: number,
  subject: string,
  body: string,
  step = 1,
  /** Defaults to the scheduler: the admin route is the one that must say so,
   *  because a person pressing send is now the exception rather than the
   *  rule. */
  sentBy: "auto" | "hand" = "auto",
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
      sentBy,
      sentFrom: fromAddress,
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
    sentBy,
    sentFrom: fromAddress,
  });

  return { ok: true, recipient: prospect.email, filedInSent };
}
