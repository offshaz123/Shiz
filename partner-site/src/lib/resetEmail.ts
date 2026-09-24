import { brand } from "@/lib/brand";

const INK = "#05283a";
const ACCENT = "#069ec1";
const MUTED = "#4d6069";
const BORDER = "#d8e4e9";
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/**
 * The password reset email. Same email-client constraints as the welcome
 * one: tables, inline styles, no remote images, plain-text alternative.
 *
 * It states the expiry and what to do if they did not ask, because a reset
 * email nobody requested is the first sign of someone trying the front door.
 */
export function resetEmail(firstName: string, link: string, minutes: number) {
  const subject = `Reset your ${brand.name} password`;
  const preheader = `The link is good for ${minutes} minutes.`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f4f8fa;font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f8fa;padding:28px 12px;">
   <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid ${BORDER};">
      <tr><td style="background:${INK};background-image:linear-gradient(135deg,${INK} 0%,#07425c 55%,${ACCENT} 140%);padding:34px 36px;">
        <p style="margin:0 0 18px 0;font-size:18px;font-weight:800;color:#ffffff;font-family:${FONT};">${brand.name}</p>
        <p style="margin:0;font-size:25px;line-height:1.3;font-weight:800;color:#ffffff;font-family:${FONT};">Reset your password</p>
      </td></tr>

      <tr><td style="padding:32px 36px;">
        <p style="margin:0 0 18px 0;font-size:15px;line-height:1.7;color:${MUTED};font-family:${FONT};">
          ${firstName ? `Hello ${firstName},` : "Hello,"} someone asked to reset the password on the
          ${brand.name} account for this address. Use the button below to choose a new one.
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="border-radius:999px;background:${ACCENT};">
            <a href="${link}" style="display:inline-block;padding:14px 30px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;font-family:${FONT};">Choose a new password</a>
          </td>
        </tr></table>

        <p style="margin:22px 0 0 0;font-size:13px;line-height:1.7;color:${MUTED};font-family:${FONT};">
          The link stops working in ${minutes} minutes, and once you have used it, it cannot be used again.
        </p>
        <p style="margin:14px 0 0 0;font-size:13px;line-height:1.7;color:${MUTED};font-family:${FONT};">
          <strong style="color:${INK};">If you did not ask for this</strong>, you can ignore this email —
          your password has not changed. If it keeps arriving, tell us at
          <a href="mailto:${brand.email}" style="color:${ACCENT};font-weight:600;text-decoration:none;">${brand.email}</a>.
        </p>

        <p style="margin:24px 0 0 0;font-size:12px;line-height:1.6;color:#7b8f98;word-break:break-all;font-family:${FONT};">
          If the button does not work, paste this into your browser:<br>${link}
        </p>
      </td></tr>
    </table>
   </td></tr>
  </table>
</body></html>`;

  const text = `Reset your ${brand.name} password

${firstName ? `Hello ${firstName},` : "Hello,"} someone asked to reset the password on the
${brand.name} account for this address.

Choose a new password:
${link}

The link stops working in ${minutes} minutes, and once used it cannot be used again.

If you did not ask for this you can ignore this email - your password has not
changed. If it keeps arriving, tell us at ${brand.email}.`;

  return { subject, html, text };
}
