import nodemailer from "nodemailer";
import { siteConfig } from "./site-config";
import { pounds, type Invoice, type InvoiceSender } from "./invoices";

/**
 * Emailing an invoice to the client's own customer.
 *
 * The invoice is built again here as plain HTML with its styles written on
 * each element, rather than rendering the page component. Email clients
 * throw stylesheets away and most of them have never heard of a CSS class,
 * so the document on screen and the document in the inbox are two different
 * build problems and pretending otherwise produces an unstyled table in
 * somebody's Outlook.
 *
 * It goes from our address under their name, with replies pointed at them.
 * Sending as their own domain would fail SPF at the far end and land in
 * spam, and an invoice in a spam folder is an invoice that does not get
 * paid. Their name on the From line is what the customer reads.
 */

const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Typed line breaks have to survive into the email. */
function block(text: string): string {
  return escape(text).replace(/\n/g, "<br>");
}

function date(iso: string): string {
  if (!iso) return "";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const GREY = "#4b5563";
const RULE = "#e5e7eb";

export function invoiceEmailHtml(invoice: Invoice, sender: InvoiceSender): string {
  const lines = invoice.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:10px 12px 10px 0;border-bottom:1px solid ${RULE};">${escape(line.description)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${RULE};text-align:right;">${
          Number.isInteger(line.quantity) ? line.quantity : line.quantity.toFixed(2)
        }</td>
        <td style="padding:10px 0;border-bottom:1px solid ${RULE};text-align:right;">${pounds(line.unitPence)}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${RULE};text-align:right;font-weight:600;">${pounds(
          Math.round(line.quantity * line.unitPence),
        )}</td>
      </tr>`,
    )
    .join("");

  const vatRow =
    invoice.vatRate > 0
      ? `<tr><td style="padding:6px 0;color:${GREY};">VAT at ${invoice.vatRate}%</td>
         <td style="padding:6px 0;text-align:right;">${pounds(invoice.vatPence)}</td></tr>`
      : "";

  return `<!doctype html>
<html lang="en-GB"><body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:28px;">

    <table width="100%" style="border-collapse:collapse;border-bottom:1px solid ${RULE};padding-bottom:16px;">
      <tr>
        <td style="vertical-align:top;font-size:13px;line-height:1.6;">
          ${
            sender.logoUrl
              ? `<img src="${escape(sender.logoUrl)}" alt="" width="56" style="display:block;margin-bottom:10px;">`
              : ""
          }
          <strong style="font-size:16px;">${escape(sender.name)}</strong><br>
          ${sender.address ? `<span style="color:${GREY};">${block(sender.address)}</span><br>` : ""}
          ${sender.phone ? `<span style="color:${GREY};">${escape(sender.phone)}</span><br>` : ""}
          ${sender.email ? `<span style="color:${GREY};">${escape(sender.email)}</span><br>` : ""}
          ${sender.website ? `<span style="color:${GREY};">${escape(sender.website)}</span><br>` : ""}
          ${sender.vatNumber ? `<span style="color:${GREY};">VAT no. ${escape(sender.vatNumber)}</span>` : ""}
        </td>
        <td style="vertical-align:top;text-align:right;font-size:13px;line-height:1.6;">
          <span style="font-size:22px;font-weight:bold;letter-spacing:-0.5px;">INVOICE</span><br>
          <strong>No. ${String(invoice.number).padStart(4, "0")}</strong><br>
          <span style="color:${GREY};">Issued ${date(invoice.issuedOn)}</span><br>
          ${invoice.dueOn ? `<span style="color:${GREY};">Due ${date(invoice.dueOn)}</span>` : ""}
        </td>
      </tr>
    </table>

    <div style="padding:20px 0 4px;font-size:13px;line-height:1.6;">
      <div style="font-size:11px;letter-spacing:0.05em;text-transform:uppercase;color:#6b7280;">Billed to</div>
      <strong style="font-size:15px;">${escape(invoice.customerName)}</strong><br>
      ${invoice.customerAddress ? `<span style="color:${GREY};">${block(invoice.customerAddress)}</span>` : ""}
    </div>

    <table width="100%" style="border-collapse:collapse;font-size:13px;margin-top:16px;">
      <tr>
        <th align="left" style="padding:8px 12px 8px 0;border-bottom:2px solid #111827;">Description</th>
        <th align="right" style="padding:8px 0;border-bottom:2px solid #111827;">Qty</th>
        <th align="right" style="padding:8px 0;border-bottom:2px solid #111827;">Each</th>
        <th align="right" style="padding:8px 0;border-bottom:2px solid #111827;">Amount</th>
      </tr>
      ${lines}
    </table>

    <table align="right" style="border-collapse:collapse;font-size:13px;margin-top:16px;min-width:240px;">
      <tr>
        <td style="padding:6px 0;color:${GREY};">Subtotal</td>
        <td style="padding:6px 0;text-align:right;">${pounds(invoice.subtotalPence)}</td>
      </tr>
      ${vatRow}
      <tr>
        <td style="padding:10px 0;border-top:2px solid #111827;font-size:15px;font-weight:bold;">Total due</td>
        <td style="padding:10px 0;border-top:2px solid #111827;text-align:right;font-size:15px;font-weight:bold;">${pounds(
          invoice.totalPence,
        )}</td>
      </tr>
    </table>

    <div style="clear:both;"></div>

    <div style="margin-top:72px;border-top:1px solid ${RULE};padding-top:16px;font-size:12px;line-height:1.6;">
      <div style="font-size:11px;letter-spacing:0.05em;text-transform:uppercase;color:#6b7280;">How to pay</div>
      <div style="margin-top:6px;color:#374151;">${
        sender.paymentDetails ? block(sender.paymentDetails) : escape(`Please contact ${sender.name}.`)
      }</div>
      ${invoice.notes ? `<div style="margin-top:16px;color:${GREY};">${block(invoice.notes)}</div>` : ""}
      <div style="margin-top:24px;border-top:1px solid #f3f4f6;padding-top:12px;text-align:center;font-size:10px;color:#9ca3af;">
        Powered by ${escape(siteConfig.url.replace(/^https?:\/\//, ""))}
      </div>
    </div>

  </div>
</body></html>`;
}

function plainText(invoice: Invoice, sender: InvoiceSender): string {
  return [
    `Invoice No. ${String(invoice.number).padStart(4, "0")} from ${sender.name}`,
    ``,
    `Issued ${date(invoice.issuedOn)}${invoice.dueOn ? `, due ${date(invoice.dueOn)}` : ""}`,
    ``,
    ...invoice.lines.map(
      (line) =>
        `${line.description} — ${line.quantity} x ${pounds(line.unitPence)} = ${pounds(
          Math.round(line.quantity * line.unitPence),
        )}`,
    ),
    ``,
    `Total due: ${pounds(invoice.totalPence)}`,
    ``,
    `How to pay:`,
    sender.paymentDetails || `Please contact ${sender.name}.`,
    invoice.notes ? `\n${invoice.notes}` : ``,
    ``,
    `Powered by ${siteConfig.url.replace(/^https?:\/\//, "")}`,
  ].join("\n");
}

/**
 * Sends it, and says whether it went.
 *
 * Unlike the auto-reply, a failure here is reported rather than swallowed.
 * The client pressed a button and is about to be told their invoice is with
 * their customer; if it is not, they need to know now, while they still
 * think they have an unpaid invoice outstanding rather than a lost one.
 */
export async function sendInvoice(
  invoice: Invoice,
  sender: InvoiceSender,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!invoice.customerEmail) return { ok: false, reason: "no_customer_email" };
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return { ok: false, reason: "no_mail_set_up" };

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${sender.name}" <${MAIL_FROM || SMTP_USER}>`,
      to: invoice.customerEmail,
      replyTo: sender.email || siteConfig.email,
      subject: `Invoice ${String(invoice.number).padStart(4, "0")} from ${sender.name}`,
      text: plainText(invoice, sender),
      html: invoiceEmailHtml(invoice, sender),
    });
    return { ok: true };
  } catch (err) {
    console.error(`Invoice ${invoice.id}:`, err);
    return { ok: false, reason: "send_failed" };
  }
}
