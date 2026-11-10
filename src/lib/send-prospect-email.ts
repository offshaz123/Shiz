import nodemailer from "nodemailer";
import { getProspect, recordProspectEmail } from "./prospects";
import { siteConfig } from "./site-config";

/**
 * Sends one outreach email to one prospect, from the admin page.
 *
 * Why this exists at all: a mailto: link does nothing on a machine with no
 * desktop mail client, and Hostinger's webmail cannot be handed a pre-filled
 * draft from a URL. So the admin page composes the email itself and the
 * server sends it through the same Hostinger SMTP account the rest of the
 * site already uses. The practical win is that it works from any device that
 * can log into /admin — a phone on a job, a borrowed laptop — with no mail
 * client set up and no webmail password to hand.
 *
 * What it deliberately is not: a campaign tool. One row, one click, one
 * email, with the text on screen and editable before it goes. That is one
 * person writing to one business about their own website, which is the side
 * of PECR we intend to stay on — a sole trader is an individual subscriber,
 * and bulk cold email to one needs consent we do not have. There is no
 * "email all" button here and there should not be one.
 *
 * The recipient is read from the database and never taken from the request,
 * so the endpoint can only ever write to an address the scanner found on a
 * prospect's own website.
 */

export type SendProspectResult =
  | { ok: true; recipient: string }
  | {
      ok: false;
      reason: "no_smtp" | "no_database" | "no_prospect" | "no_email" | "empty" | "send_failed";
    };

const MAX_SUBJECT = 200;
const MAX_BODY = 10_000;

export async function sendProspectEmail(
  id: number,
  subject: string,
  body: string,
): Promise<SendProspectResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return { ok: false, reason: "no_smtp" };

  const cleanSubject = subject.trim().slice(0, MAX_SUBJECT);
  const cleanBody = body.trim().slice(0, MAX_BODY);
  if (!cleanSubject || !cleanBody) return { ok: false, reason: "empty" };

  const prospect = await getProspect(id);
  if (!prospect) return { ok: false, reason: "no_prospect" };
  if (!prospect.email) return { ok: false, reason: "no_email" };

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      // MAIL_FROM when it is set, otherwise the authenticated mailbox. Most
      // servers reject a From the SMTP account has no rights to, so this is
      // never a made-up address.
      from: `"Walid at Shaz Marketing Group" <${process.env.MAIL_FROM || SMTP_USER}>`,
      to: prospect.email,
      replyTo: siteConfig.email,
      // A copy to the office inbox, because the server sending this means
      // there is no Sent folder for it to appear in. It also puts the
      // conversation in a real mail client, so a reply can be written from
      // there like any other email.
      bcc: siteConfig.email,
      subject: cleanSubject,
      // Plain text only, on purpose. A one-to-one note about someone's
      // website should look like one, and an HTML template around four
      // sentences reads as a mailshot to both the recipient and the filters.
      text: cleanBody,
    });
  } catch (err) {
    console.error(`Outreach email to prospect ${id} failed:`, err);
    await recordProspectEmail(id, {
      recipient: prospect.email,
      subject: cleanSubject,
      body: cleanBody,
      status: "failed",
      error: String(err),
    });
    return { ok: false, reason: "send_failed" };
  }

  await recordProspectEmail(id, {
    recipient: prospect.email,
    subject: cleanSubject,
    body: cleanBody,
    status: "sent",
  });

  return { ok: true, recipient: prospect.email };
}
