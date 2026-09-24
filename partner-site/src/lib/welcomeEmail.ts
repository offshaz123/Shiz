import { brand, currencies } from "@/lib/brand";

/**
 * The welcome email.
 *
 * Written for email clients, not browsers, which is a different craft:
 *
 *  - Tables, not flexbox or grid. Outlook renders through Word.
 *  - Inline styles. Gmail strips <style> blocks in some contexts.
 *  - No remote images. Most clients block them by default and a design that
 *    depends on one arrives broken, so the colour and shape here is all CSS
 *    and text. The "pictures" are drawn with backgrounds and type.
 *  - A preheader line, because inboxes show it beside the subject and
 *    otherwise it fills with whatever text comes first.
 *  - A plain-text alternative, because sending HTML alone is a spam signal.
 *
 * It sets no expectations we cannot meet: it does not promise an account,
 * a balance, or a payment, because none of those exist behind a login yet.
 */

const INK = "#05283a";
const ACCENT = "#069ec1";
const MUTED = "#4d6069";
const BORDER = "#d8e4e9";
/** Clients ignore an inherited family, so this is repeated on every text node. */
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

function feature(emoji: string, title: string, body: string) {
  return `
    <tr>
      <td style="padding:0 0 18px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="44" valign="top" style="padding-right:14px;">
              <div style="width:44px;height:44px;line-height:44px;text-align:center;border-radius:12px;background:#e2f4f9;font-size:20px;font-family:${FONT};">${emoji}</div>
            </td>
            <td valign="top">
              <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:${INK};font-family:${FONT};">${title}</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};font-family:${FONT};">${body}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function welcomeEmail(firstName: string) {
  const name = firstName ? ` ${firstName}` : "";
  const subject = `Welcome to ${brand.name}`;
  const preheader = `Your ${brand.name} account is set up. Here is what we do and what happens next.`;

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f8fa;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f8fa;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${BORDER};">

        <!-- The blue band, the same one the site opens with. -->
        <tr>
          <td style="background:${INK};background-image:linear-gradient(135deg,${INK} 0%,#07425c 55%,${ACCENT} 140%);padding:38px 36px;">
            <p style="margin:0 0 22px 0;font-size:19px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;font-family:${FONT};">${brand.name}</p>
            <p style="margin:0;font-size:28px;line-height:1.25;font-weight:800;color:#ffffff;font-family:${FONT};">
              Welcome${name}.
            </p>
            <p style="margin:12px 0 0 0;font-size:15px;line-height:1.6;color:#cfeaf2;font-family:${FONT};">
              Your account is set up. Here is what we do, and what happens next.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:34px 36px 8px 36px;">
            <p style="margin:0 0 26px 0;font-size:15px;line-height:1.7;color:${MUTED};font-family:${FONT};">
              ${brand.name} gives UK businesses a payment account in their own company name — money in
              from your customers, currency converted at a rate you are quoted before you commit, and
              money out to your suppliers the same day.
            </p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${feature("&#127974;", "An account in your company name", "Named, not shared. Your customers pay your company, and your suppliers see who paid them.")}
              ${feature("&#128176;", "The rate before you commit", "You are quoted, you decide, then it goes. You can price a purchase order against a rate you have been given.")}
              ${feature("&#127758;", `${currencies.length} currencies, one account`, "Pay suppliers, contractors and staff abroad without a round trip through sterling on the way.")}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:14px 36px 6px 36px;">
            <div style="border-top:1px solid ${BORDER};padding-top:26px;">
              <p style="margin:0 0 10px 0;font-size:15px;font-weight:700;color:${INK};font-family:${FONT};">What happens next</p>
              <p style="margin:0 0 22px 0;font-size:14px;line-height:1.7;color:${MUTED};font-family:${FONT};">
                Nothing you need to do right now. When you are ready to talk about an account, reply to
                this email or write to <a href="mailto:${brand.email}" style="color:${ACCENT};font-weight:600;text-decoration:none;">${brand.email}</a>
                and tell us what the business trades, roughly what comes in each month, and the currency
                that goes out. That is enough for us to tell you whether we are the right fit and what it
                would cost.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-radius:999px;background:${ACCENT};">
                  <a href="${brand.url}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;font-family:${FONT};">
                    Visit ${brand.name}
                  </a>
                </td></tr>
              </table>
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:30px 36px 34px 36px;">
            <div style="border-top:1px solid ${BORDER};padding-top:20px;">
              <p style="margin:0 0 10px 0;font-size:12px;line-height:1.65;color:#7b8f98;font-family:${FONT};">
                ${brand.name} is acting as an introducer to ${brand.provider.regulatedEntity}, who is
                providing the regulated payment services and is authorised and regulated by the Financial
                Conduct Authority under ${brand.provider.permissions} (firm reference number
                ${brand.provider.firmReferenceNumber}). ${brand.name} is not a bank.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.65;color:#7b8f98;font-family:${FONT};">
                ${brand.registeredName ? `${brand.registeredName} is a company registered in ${brand.registeredIn}, company number ${brand.companyNumber}. ` : ""}You are receiving this because an account was created with this email address at ${brand.url}.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Welcome${name}.

Your ${brand.name} account is set up.

${brand.name} gives UK businesses a payment account in their own company name
- money in from your customers, currency converted at a rate you are quoted
before you commit, and money out to your suppliers the same day.

  * An account in your company name - named, not shared.
  * The rate before you commit - you are quoted, you decide, then it goes.
  * ${currencies.length} currencies on one account.

WHAT HAPPENS NEXT
Nothing you need to do right now. When you are ready to talk about an account,
reply to this email or write to ${brand.email} and tell us what the business
trades, roughly what comes in each month, and the currency that goes out.

${brand.url}

---
${brand.name} is acting as an introducer to ${brand.provider.regulatedEntity}, who is providing
the regulated payment services and is authorised and regulated by the Financial
Conduct Authority under ${brand.provider.permissions} (firm reference number
${brand.provider.firmReferenceNumber}). ${brand.name} is not a bank.
You are receiving this because an account was created with this email address.`;

  return { subject, html, text };
}
