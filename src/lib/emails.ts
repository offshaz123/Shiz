import { describe, money, sizeOf, unitPrice, type CartItem } from "./plates";
import { site, whatsappHref } from "./site";
import { trackingLink } from "./tracking";
import type { Order } from "./orders";

// Email templates. Email apps only understand simple, old-style HTML
// (tables and inline styles), so that's what this uses.

const GOLD = "#b8901f";
const INK = "#14110b";
const MUTED = "#5f5647";
const LINE = "#e6dcc6";
const CREAM = "#faf7f0";

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function fmtDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" });
}

function brand(b: string | null) {
  if (!b) return "Card";
  return { visa: "Visa", mastercard: "Mastercard", amex: "American Express" }[b] ?? b[0].toUpperCase() + b.slice(1);
}

export function cardLine(o: Pick<Order, "card_brand" | "card_last4">) {
  return o.card_last4 ? `${brand(o.card_brand)} ending ${o.card_last4}` : "";
}

// PNG of the plate, drawn by /api/plate-image (email apps can't show SVG).
export function plateImageParams(i: CartItem, side: "front" | "rear" = i.which === "front" ? "front" : "rear") {
  return new URLSearchParams({
    text: i.reg,
    type: i.type,
    size: i.size,
    style: i.style,
    badge: i.badge,
    border: i.border,
    side,
  });
}

export function plateImageUrl(i: CartItem) {
  return `${site.url}/api/plate-image?${plateImageParams(i)}`;
}

// Pictures are attached to the email itself ("cid:" links) when possible,
// because Outlook and others block pictures loaded from websites until the
// reader trusts the sender. If attaching fails, fall back to web links.
export type ImageMode = "inline" | "web";
export const LOGO_CID = "platedup-logo";
export const plateCid = (index: number) => `plate-${index}`;

function itemsHtml(o: Order, imgWidth: number, images: ImageMode) {
  return o.items
    .map((i, index) => {
      // Short hex plates are drawn narrower, to scale with a standard plate.
      const w = Math.round((imgWidth * sizeOf(i).width) / 520);
      return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid ${LINE};">
          <img src="${images === "inline" ? `cid:${plateCid(index)}` : esc(plateImageUrl(i))}" width="${w}" alt="${esc(i.reg)} number plate" style="display:block;width:${w}px;max-width:100%;height:auto;border-radius:6px;" />
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
            <tr>
              <td style="font:600 18px Arial,sans-serif;color:${INK};white-space:pre;">${esc(i.reg)}${i.qty > 1 ? ` &times; ${i.qty}` : ""}</td>
              <td align="right" style="font:600 16px Arial,sans-serif;color:${INK};">${money(unitPrice(i) * i.qty)}</td>
            </tr>
            <tr><td colspan="2" style="font:14px Arial,sans-serif;color:${MUTED};padding-top:4px;">${esc(describe(i))}</td></tr>
            ${i.type === "show" ? `<tr><td colspan="2" style="font:13px Arial,sans-serif;color:#8a4a12;padding-top:4px;">Show plate: for display and off-road use only, not road legal.</td></tr>` : ""}
          </table>
        </td>
      </tr>`;
    })
    .join("");
}

function row(label: string, value: string, bold = false) {
  return `<tr>
    <td style="font:${bold ? "700 18px" : "15px"} Arial,sans-serif;color:${bold ? INK : MUTED};padding:4px 0;">${label}</td>
    <td align="right" style="font:${bold ? "700 18px" : "15px"} Arial,sans-serif;color:${INK};padding:4px 0;">${value}</td>
  </tr>`;
}

function button(href: string, label: string, bg: string, color = "#ffffff") {
  return `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:${color};font:700 15px Arial,sans-serif;text-decoration:none;padding:13px 22px;border-radius:999px;">${label}</a>`;
}

function layout(title: string, preheader: string, body: string, images: ImageMode) {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
      <tr><td align="center" style="background:${INK};padding:22px;">
        <img src="${images === "inline" ? `cid:${LOGO_CID}` : `${site.url}/email/logo.png`}" width="180" alt="PlatedUp" style="display:block;width:180px;height:auto;" />
      </td></tr>
      <tr><td style="height:4px;background:linear-gradient(90deg,#a37c18,#f2dc93,#c9a227,#f6e6ae,#b8901f);background-color:${GOLD};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 28px 8px;">${body}</td></tr>
      <tr><td style="padding:20px 28px 28px;border-top:1px solid ${LINE};font:12px Arial,sans-serif;color:${MUTED};line-height:1.6;">
        ${site.name} · DVLA registered number plate supplier · Road-legal plates made to BS AU 145e<br />
        ${esc(site.address)} · <a href="mailto:${site.email}" style="color:${MUTED};">${site.email}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function customerOrderEmail(o: Order, images: ImageMode = "web") {
  const first = o.customer_name.split(" ")[0] || "there";
  const paid = o.status === "paid" || o.amount_paid !== null;
  const card = cardLine(o);
  const uploadUrl = `${site.url}/upload-documents?ref=${encodeURIComponent(o.ref)}`;
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`I need some help with my order ${o.ref}`),
  );

  const docsMissing = o.docs_status === "outstanding";
  // Big red box near the top: road-legal plates can't be made without these.
  // Show-plate-only orders never get it (their docs_status is "not_needed").
  const docsWarning = docsMissing
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 4px;background:#fdecec;border:2px solid #d92d20;border-radius:12px;">
      <tr><td style="padding:18px 20px;">
        <p style="font:700 18px Arial,sans-serif;color:#b42318;margin:0 0 8px;">⚠️ Action needed: please upload your documents</p>
        <p style="font:15px/1.6 Arial,sans-serif;color:#7a271a;margin:0 0 6px;">By law we must see <strong>proof you own the registration</strong> (V5C logbook, new keeper slip, V750 or V778) and <strong>photo ID</strong> before we can make road-legal number plates.</p>
        <p style="font:700 15px/1.6 Arial,sans-serif;color:#b42318;margin:0 0 14px;">Until we receive them, your order can't go ahead and will be delayed.</p>
        <p style="margin:0 0 8px;">${button(uploadUrl, "Upload my documents now", "#d92d20")}</p>
        <p style="font:13px/1.5 Arial,sans-serif;color:#7a271a;margin:8px 0 0;">It takes a minute. A clear photo from your phone is perfect. You'll need your order number: <strong>${o.ref}</strong></p>
      </td></tr>
    </table>`
    : "";

  const next =
    docsMissing
      ? `<p style="font:15px/1.6 Arial,sans-serif;color:#b42318;margin:0 0 8px;"><strong>As soon as we have your documents</strong> we'll make your plates. Orders are dispatched the same working day when everything is in before ${site.dispatchCutoff}.</p>
         <p style="margin:0 0 8px;">${button(uploadUrl, "Upload my documents", "#d92d20")}</p>`
      : paid
        ? `<p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">We're making your plates now. Orders placed before ${site.dispatchCutoff} on a working day are dispatched the same day, and we'll let you know when they're on the way.</p>`
        : `<p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">We'll send you a secure link to pay for your order. As soon as it's paid we'll start making your plates.</p>`;

  const html = layout(
    `Your PlatedUp order ${o.ref}`,
    `Thanks ${first}! Order ${o.ref}${paid ? ` · ${money(o.amount_paid ?? o.total)} paid` : ""}.`,
    `
    <p style="font:700 26px Arial,sans-serif;color:${INK};margin:0 0 6px;">Thanks for your order, ${esc(first)}!</p>
    <p style="font:15px Arial,sans-serif;color:${MUTED};margin:0 0 18px;">Order <strong style="color:${INK};">${o.ref}</strong> · ${fmtDate(o.paid_at ?? o.created_at)}</p>
    <p style="margin:0 0 6px;"><span style="display:inline-block;background:${paid ? "#e7f6ec" : "#fff5ec"};color:${paid ? "#1f7a3d" : "#8a4a12"};font:700 13px Arial,sans-serif;padding:6px 12px;border-radius:999px;">${paid ? "✓ Payment received" : "Order received · awaiting payment"}</span></p>
    ${docsWarning}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 544, images)}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row("Subtotal", money(o.subtotal))}
      ${o.discount ? row(`Discount (${esc(o.discount_code ?? "")})`, `−${money(o.discount)}`) : ""}
      ${row(esc(o.delivery_name), o.delivery_price ? money(o.delivery_price) : "FREE")}
      ${row(paid ? "Total paid" : "Total", money(o.amount_paid ?? o.total), true)}
      ${card ? `<tr><td colspan="2" style="font:14px Arial,sans-serif;color:${MUTED};padding-top:2px;">Paid with ${esc(card)}</td></tr>` : ""}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:${CREAM};border:1px solid ${LINE};border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 14px Arial,sans-serif;color:${GOLD};letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Delivering to</p>
        <p style="font:15px/1.5 Arial,sans-serif;color:${INK};margin:0;">${esc(o.customer_name)}<br />${esc(o.address1)}${o.address2 ? `<br />${esc(o.address2)}` : ""}<br />${esc(o.town)} ${esc(o.postcode)}</p>
      </td></tr>
    </table>

    <p style="font:700 18px Arial,sans-serif;color:${INK};margin:24px 0 8px;">What happens next</p>
    ${next}
    <p style="font:14px/1.6 Arial,sans-serif;color:${MUTED};margin:12px 0 0;">Check your order status any time: <a href="${esc(`${site.url}/track?ref=${encodeURIComponent(o.ref)}`)}" style="color:${GOLD};font-weight:700;">Track my order</a></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;background:#f1faf3;border:1px solid #cfe6d4;border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Any questions or issues?</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">Message us on WhatsApp with your order number and a real person will help.</p>
        ${button(helpHref, "Chat on WhatsApp", "#25D366")}
      </td></tr>
    </table>
    `,
    images,
  );

  const text = [
    docsMissing
      ? `ACTION NEEDED: please upload your V5C (or other proof you own the registration) and photo ID. Until we receive them your order can't go ahead and will be delayed. Upload here: ${uploadUrl}\n`
      : "",
    `Thanks for your order, ${first}!`,
    `Order ${o.ref} · ${paid ? `Payment received (${money(o.amount_paid ?? o.total)})` : "Awaiting payment"}`,
    card && `Paid with ${card}`,
    "",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`),
    o.discount ? `Discount (${o.discount_code}): −${money(o.discount)}` : "",
    `Delivery: ${o.delivery_name} (${o.delivery_price ? money(o.delivery_price) : "FREE"})`,
    `Total: ${money(o.amount_paid ?? o.total)}`,
    "",
    o.docs_status === "outstanding" ? `Please upload your V5C and photo ID: ${uploadUrl}` : paid ? "We're making your plates now." : "We'll send you a secure link to pay. We'll start making your plates once it's paid.",
    `Check your order status any time: ${site.url}/track?ref=${encodeURIComponent(o.ref)}`,
    "",
    `Questions? WhatsApp us: ${helpHref}`,
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");

  return {
    subject:
      (paid ? `Order confirmed: ${o.ref} (${money(o.amount_paid ?? o.total)} paid)` : `Order received: ${o.ref}`) +
      (docsMissing ? " · Action needed: upload your documents" : ""),
    html,
    text,
  };
}

// Sent when the shop presses "Mark dispatched" in the admin.
export function customerDispatchEmail(o: Order, images: ImageMode = "web") {
  const first = o.customer_name.split(" ")[0] || "there";
  const plates = o.items.reduce((n, i) => n + i.qty, 0);
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`I need some help with my order ${o.ref}`),
  );
  const hasLegal = o.items.some((i) => i.type !== "show");
  const tracking = trackingLink(o);
  const trackHref = `${site.url}/track?ref=${encodeURIComponent(o.ref)}`;

  const steps = [
    ["Order placed", fmtDate(o.paid_at ?? o.created_at)],
    ["Plates made", "Pressed and checked by hand"],
    ["Dispatched", fmtDate(new Date())],
  ]
    .map(
      ([label, sub]) => `<td width="33%" align="center" valign="top" style="padding:0 4px;">
        <div style="width:30px;height:30px;line-height:30px;margin:0 auto;border-radius:999px;background:${GOLD};color:#ffffff;font:700 15px Arial,sans-serif;">&#10003;</div>
        <p style="font:700 13px Arial,sans-serif;color:${INK};margin:8px 0 2px;">${label}</p>
        <p style="font:12px Arial,sans-serif;color:${MUTED};margin:0;">${esc(sub)}</p>
      </td>`,
    )
    .join("");

  const html = layout(
    `Your PlatedUp order ${o.ref} is on its way`,
    `Good news ${first}! Your plates have been dispatched.`,
    `
    <p style="margin:0 0 10px;"><span style="display:inline-block;background:#e7f6ec;color:#1f7a3d;font:700 13px Arial,sans-serif;padding:6px 12px;border-radius:999px;">&#128666; Dispatched</span></p>
    <p style="font:700 26px Arial,sans-serif;color:${INK};margin:0 0 6px;">Your plates are on their way, ${esc(first)}!</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${MUTED};margin:0 0 20px;">Good news: we've finished making your ${plates === 1 ? "plate" : `${plates} plates`} and ${plates === 1 ? "it's" : "they're"} been sent out. Order <strong style="color:${INK};">${o.ref}</strong></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:${CREAM};border:1px solid ${LINE};border-radius:12px;">
      <tr><td style="padding:18px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${steps}</tr></table></td></tr>
    </table>

    ${
      tracking
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 8px;background:#f1faf3;border:1px solid #cfe6d4;border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Track your parcel</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">${esc(tracking.carrier)} tracking number: <strong style="color:${INK};">${esc(tracking.number)}</strong></p>
        ${button(tracking.url, "Track my parcel", "#1f7a3d")}
      </td></tr>
    </table>`
        : ""
    }

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 544, images)}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:${CREAM};border:1px solid ${LINE};border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 14px Arial,sans-serif;color:${GOLD};letter-spacing:1px;text-transform:uppercase;margin:0 0 6px;">Sent to</p>
        <p style="font:15px/1.5 Arial,sans-serif;color:${INK};margin:0;">${esc(o.customer_name)}<br />${esc(o.address1)}${o.address2 ? `<br />${esc(o.address2)}` : ""}<br />${esc(o.town)} ${esc(o.postcode)}</p>
        <p style="font:14px Arial,sans-serif;color:${MUTED};margin:8px 0 0;">${esc(o.delivery_name)}</p>
      </td></tr>
    </table>

    <p style="font:700 18px Arial,sans-serif;color:${INK};margin:24px 0 8px;">When your plates arrive</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0 0 6px;">&#10003; Check the registration and style are exactly as you ordered.</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0 0 6px;">&#10003; Peel off the protective film after fitting for a perfect finish.</p>
    ${hasLegal ? `<p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0 0 6px;">&#10003; Fit them straight away: your plates are made to BS AU 145e and fully road legal.</p>` : ""}
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">&#10003; Not arrived after a few working days? <a href="${esc(trackHref)}" style="color:${GOLD};font-weight:700;">Check your order</a> or just message us.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;background:#f1faf3;border:1px solid #cfe6d4;border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Any questions or issues?</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">Message us on WhatsApp with your order number and a real person will help.</p>
        ${button(helpHref, "Chat on WhatsApp", "#25D366")}
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 8px;background:${CREAM};border:1px solid ${LINE};border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Love your plates?</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">Once they're on, we'd really appreciate a quick review. It takes a minute and helps other drivers find us.</p>
        ${button(`${site.url}/#reviews`, "Leave a review", GOLD)}
      </td></tr>
    </table>

    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:20px 0 0;">Thanks for choosing ${site.name}. Enjoy your new plates!</p>
    `,
    images,
  );

  const text = [
    `Your plates are on their way, ${first}!`,
    `Order ${o.ref} has been dispatched.`,
    "",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)}`),
    "",
    `Sent to: ${o.customer_name}, ${o.address1}${o.address2 ? `, ${o.address2}` : ""}, ${o.town} ${o.postcode}`,
    `Delivery: ${o.delivery_name}`,
    ...(tracking ? ["", `${tracking.carrier} tracking number: ${tracking.number}`, `Track your parcel: ${tracking.url}`] : []),
    "",
    `Check your order any time: ${trackHref}`,
    "Not arrived after a few working days? Just message us.",
    `Questions? WhatsApp us: ${helpHref}`,
    "",
    `Love your plates? Leave a quick review: ${site.url}/#reviews`,
  ].join("\n");

  return { subject: `Your order ${o.ref} has been dispatched 🚚`, html, text };
}

// Sent when the shop presses "Cancel order" in the admin. We don't give a
// reason here: the customer is asked to get in touch so we can explain.
export function customerCancelEmail(o: Order, images: ImageMode = "web") {
  const first = o.customer_name.split(" ")[0] || "there";
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`Hi PlatedUp, my order ${o.ref} has been cancelled. Can you tell me why?`),
  );
  const paid = o.amount_paid !== null;
  const refunded = o.status === "refunded";
  const card = cardLine(o);
  const refundLine = refunded
    ? `We've refunded ${money(o.amount_paid ?? o.total)} to the card you paid with${card ? ` (${card})` : ""}. It usually shows in your account within 5 to 10 working days, depending on your bank.`
    : `If a refund is due, it will go back to the card you paid with${card ? ` (${card})` : ""}. Refunds usually show in your account within 5 to 10 working days, depending on your bank.`;

  const html = layout(
    `Your PlatedUp order ${o.ref} has been cancelled`,
    `Order ${o.ref} has been cancelled. Please get in touch with us.`,
    `
    <p style="margin:0 0 10px;"><span style="display:inline-block;background:#fdecec;color:#b42318;font:700 13px Arial,sans-serif;padding:6px 12px;border-radius:999px;">Order cancelled</span></p>
    <p style="font:700 26px Arial,sans-serif;color:${INK};margin:0 0 6px;">Your order has been cancelled</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${MUTED};margin:0 0 20px;">Hi ${esc(first)}, we're sorry to let you know that your order <strong style="color:${INK};">${o.ref}</strong> has been cancelled and won't be made or sent out.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;background:#fff8e6;border:2px solid ${GOLD};border-radius:12px;">
      <tr><td style="padding:18px 20px;">
        <p style="font:700 18px Arial,sans-serif;color:${INK};margin:0 0 8px;">Please get in touch with us</p>
        <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0 0 14px;">Message us on WhatsApp with your order number <strong>${o.ref}</strong> and we'll explain what happened and help you put it right.</p>
        ${button(helpHref, "Chat on WhatsApp", "#25D366")}
        <p style="font:13px/1.5 Arial,sans-serif;color:${MUTED};margin:12px 0 0;">Or email us at <a href="mailto:${site.email}" style="color:${INK};">${site.email}</a></p>
      </td></tr>
    </table>

    ${
      paid
        ? `<p style="font:700 18px Arial,sans-serif;color:${INK};margin:24px 0 8px;">Your payment</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">${esc(refundLine)}</p>`
        : ""
    }

    <p style="font:700 14px Arial,sans-serif;color:${GOLD};letter-spacing:1px;text-transform:uppercase;margin:26px 0 0;">Cancelled order</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 544, images)}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row(paid ? "Amount paid" : "Order total", money(o.amount_paid ?? o.total), true)}
    </table>

    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:24px 0 0;">Sorry for any trouble. We hope to make your plates soon.</p>
    `,
    images,
  );

  const text = [
    `Hi ${first}, your order ${o.ref} has been cancelled and won't be made or sent out.`,
    "",
    `Please get in touch so we can explain what happened: ${helpHref}`,
    `Or email ${site.email}`,
    "",
    paid ? refundLine : "",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)}`),
  ].join("\n");

  return { subject: `Your order ${o.ref} has been cancelled${refunded ? " and refunded" : ""}`, html, text };
}

export function shopOrderEmail(o: Order, docCount: number, images: ImageMode = "web") {
  const paid = o.amount_paid !== null;
  const card = cardLine(o);
  const docs =
    o.docs_status === "not_needed"
      ? "Not needed (show plates only). Do NOT add the BS AU 145e mark."
      : o.docs_status === "received" && docCount > 0
        ? `Attached (${docCount}). Check them before making.`
        : "OUTSTANDING: don't make road-legal plates until the customer uploads them.";
  const regs = o.items.map((i) => i.reg).join(", ");

  const text = [
    paid ? `PAID: ${money(o.amount_paid!)}${card ? ` (${card})` : ""}` : "NOT PAID ONLINE: send the customer a payment link.",
    `Order ${o.ref} · ${fmtDate(o.paid_at ?? o.created_at)}`,
    `Documents: ${docs}`,
    "",
    "PLATES",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`),
    o.discount ? `Discount (${o.discount_code}): −${money(o.discount)}` : "",
    `Delivery: ${o.delivery_name} (${o.delivery_price ? money(o.delivery_price) : "FREE"})`,
    `TOTAL: ${money(o.total)}`,
    "",
    "CUSTOMER",
    o.customer_name,
    o.email,
    o.phone,
    o.address1,
    o.address2,
    `${o.town} ${o.postcode}`,
    "",
    `Open in admin: ${site.url}/admin/orders/${o.ref}`,
  ]
    .filter((l, idx, all) => !(l === "" && all[idx - 1] === ""))
    .join("\n");

  const html = layout(
    `Order ${o.ref}`,
    `${paid ? "PAID" : "NOT PAID"} ${money(o.amount_paid ?? o.total)} · ${regs}`,
    `
    <p style="margin:0 0 10px;"><span style="display:inline-block;background:${paid ? "#e7f6ec" : "#fff5ec"};color:${paid ? "#1f7a3d" : "#8a4a12"};font:700 14px Arial,sans-serif;padding:7px 14px;border-radius:999px;">${paid ? `✅ PAID ${money(o.amount_paid!)}` : "⚠️ NOT PAID ONLINE"}</span></p>
    <p style="font:700 24px Arial,sans-serif;color:${INK};margin:0 0 4px;">New order ${o.ref}</p>
    <p style="font:14px Arial,sans-serif;color:${MUTED};margin:0 0 4px;">${fmtDate(o.paid_at ?? o.created_at)}${card ? ` · ${esc(card)}` : ""}</p>
    <p style="font:14px Arial,sans-serif;color:${o.docs_status === "outstanding" ? "#b42318" : INK};margin:0 0 8px;"><strong>Documents:</strong> ${esc(docs)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 420, images)}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${o.discount ? row(`Discount (${esc(o.discount_code ?? "")})`, `−${money(o.discount)}`) : ""}
      ${row(esc(o.delivery_name), o.delivery_price ? money(o.delivery_price) : "FREE")}
      ${row("Total", money(o.total), true)}
    </table>
    <p style="font:700 16px Arial,sans-serif;color:${INK};margin:20px 0 6px;">Customer</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">${esc(o.customer_name)}<br /><a href="mailto:${esc(o.email)}" style="color:${GOLD};">${esc(o.email)}</a> · ${esc(o.phone)}<br />${esc(o.address1)}${o.address2 ? `, ${esc(o.address2)}` : ""}, ${esc(o.town)} ${esc(o.postcode)}</p>
    <p style="margin:20px 0 8px;">${button(`${site.url}/admin/orders/${o.ref}`, "Open in admin portal", INK)}</p>
    `,
    images,
  );

  return {
    subject: `${paid ? `✅ PAID ${money(o.amount_paid!)}` : "⚠️ NOT PAID"}: order ${o.ref} (${regs})`,
    text,
    html,
  };
}

// Sent once when someone reached payment but didn't finish (their Stripe
// checkout expired after an hour). The button starts a fresh payment for the
// same order; with freeDelivery, delivery is free if they finish within 24 hours.
export function customerReminderEmail(o: Order, resumeUrl: string, images: ImageMode = "web", freeDelivery = false) {
  const offerTotal = freeDelivery ? o.total - o.delivery_price : o.total;
  const first = o.customer_name.split(" ")[0] || "there";
  const plates = o.items.reduce((n, i) => n + i.qty, 0);
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`I started an order (${o.ref}) and have a question`),
  );

  const html = layout(
    "Your plates are still waiting",
    freeDelivery
      ? `${first}, finish your order in the next 24 hours and delivery is on us.`
      : `${first}, your ${plates === 1 ? "plate is" : "plates are"} saved and ready to order.`,
    `
    <p style="font:700 26px Arial,sans-serif;color:${INK};margin:0 0 6px;">Your plates are still waiting, ${esc(first)}</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${MUTED};margin:0 0 20px;">You started an order on ${site.name} but didn't get as far as paying. We've saved your ${plates === 1 ? "plate" : "plates"} exactly as you designed ${plates === 1 ? "it" : "them"}, so you can finish in one click.</p>

    ${
      freeDelivery
        ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:${GOLD};border-radius:12px;">
      <tr><td style="padding:16px 18px;text-align:center;">
        <p style="font:700 20px Arial,sans-serif;color:${INK};margin:0 0 4px;">🚚 FREE delivery if you check out now</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${INK};margin:0;">Complete your order in the next 24 hours and we'll take the ${money(o.delivery_price)} delivery off. Just use the button below.</p>
      </td></tr>
    </table>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 544, images)}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
      ${o.discount ? row(`Discount${o.discount_code ? ` (${esc(o.discount_code)})` : ""}`, `-${money(o.discount)}`) : ""}
      ${row(esc(o.delivery_name), freeDelivery ? `<s>${money(o.delivery_price)}</s> FREE` : o.delivery_price ? money(o.delivery_price) : "Free")}
      ${row("Total", money(offerTotal), true)}
    </table>

    <p style="margin:24px 0 8px;text-align:center;">${button(resumeUrl, freeDelivery ? "Claim my free delivery" : "Complete my order", GOLD)}</p>
    <p style="font:13px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 20px;text-align:center;">Secure payment by Stripe${freeDelivery ? ". Free delivery applies for 24 hours from this email" : ""}${o.discount_code ? `. Your ${esc(o.discount_code)} discount is still applied` : ""}. Orders before ${site.dispatchCutoff} on a working day are dispatched the same day.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;background:#f1faf3;border:1px solid #cfe6d4;border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Something not right, or a question?</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">Message us on WhatsApp and a real person will help.</p>
        ${button(helpHref, "Chat on WhatsApp", "#25D366")}
      </td></tr>
    </table>

    <p style="font:12px/1.5 Arial,sans-serif;color:${MUTED};margin:20px 0 0;">We've sent this one reminder because you started an order on our website. We won't email you about it again.</p>
    `,
    images,
  );

  const text = [
    `Your plates are still waiting, ${first}`,
    `You started an order on ${site.name} but didn't finish paying. We've saved it for you:`,
    "",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`),
    o.discount ? `Discount${o.discount_code ? ` (${o.discount_code})` : ""}: -${money(o.discount)}` : "",
    `${o.delivery_name}: ${freeDelivery ? `FREE (was ${money(o.delivery_price)})` : o.delivery_price ? money(o.delivery_price) : "Free"}`,
    `Total: ${money(offerTotal)}`,
    "",
    freeDelivery ? "Claim FREE delivery (for the next 24 hours):" : "",
    `Complete your order: ${resumeUrl}`,
    "",
    `Questions? WhatsApp us: ${helpHref}`,
    "We've sent this one reminder because you started an order on our website. We won't email you about it again.",
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  return {
    subject: freeDelivery ? `${first}, free delivery on your plates for 24 hours` : `${first}, your plates are still waiting`,
    html,
    text,
  };
}

// Asks for the V5C and ID: a friendly reminder when they haven't been sent
// (reason null), or a request for a new photo with the shop's reason.
export function customerDocsEmail(o: Order, reason: string | null) {
  const first = o.customer_name.split(" ")[0] || "there";
  const uploadUrl = `${site.url}/upload-documents?ref=${encodeURIComponent(o.ref)}`;
  const regs = o.items.filter((i) => i.type !== "show").map((i) => i.reg).join(", ");
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`I have a question about the documents for my order ${o.ref}`),
  );
  const retake = reason !== null;
  const title = retake ? "We need a new photo of your documents" : "Upload your documents and we'll make your plates";
  const intro = retake
    ? `Thanks for sending your documents for order ${o.ref}. We need a new photo before we can make your plates:`
    : `Your order ${o.ref} is paid and ready to make. We just need a photo of your V5C (or new keeper slip) and your ID, which the law requires before we can make road-legal plates.`;

  const html = layout(
    title,
    retake ? `${first}, we need a clearer photo for order ${o.ref}.` : `${first}, one quick step and we'll start making your plates.`,
    `
    <p style="font:700 24px Arial,sans-serif;color:${INK};margin:0 0 8px;">${esc(retake ? `${first}, we need a new photo` : `${first}, your plates are waiting`)}</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${MUTED};margin:0 0 14px;">${esc(intro)}</p>
    ${retake ? `<p style="font:700 15px/1.6 Arial,sans-serif;color:#b42318;background:#fdecec;border-radius:10px;padding:12px 14px;margin:0 0 14px;">${esc(reason)}</p>` : ""}
    ${regs ? `<p style="font:14px Arial,sans-serif;color:${INK};margin:0 0 14px;"><strong>Registration:</strong> ${esc(regs)}</p>` : ""}
    <p style="font:14px/1.6 Arial,sans-serif;color:${MUTED};margin:0 0 6px;">You'll need:</p>
    <ul style="font:14px/1.7 Arial,sans-serif;color:${INK};margin:0 0 16px;padding-left:20px;">
      <li>Proof you own the reg: V5C logbook, new keeper slip, V750 or V778</li>
      <li>ID in your name: driving licence, passport or a recent utility bill</li>
    </ul>
    <p style="margin:20px 0 8px;text-align:center;">${button(uploadUrl, retake ? "Upload a new photo" : "Upload my documents", GOLD)}</p>
    <p style="font:13px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 20px;text-align:center;">A clear photo from your phone is perfect. Use the email address you ordered with.</p>
    <p style="font:14px Arial,sans-serif;color:${MUTED};margin:0 0 4px;">Questions? <a href="${helpHref}" style="color:#1f7a3d;font-weight:700;">WhatsApp us</a> and a real person will help.</p>
    `,
    "web",
  );
  const text = [
    retake ? `${first}, we need a new photo` : `${first}, your plates are waiting`,
    "",
    intro,
    ...(retake ? ["", reason] : []),
    "",
    "You'll need:",
    "- Proof you own the reg: V5C logbook, new keeper slip, V750 or V778",
    "- ID in your name: driving licence, passport or a recent utility bill",
    "",
    `Upload them here: ${uploadUrl}`,
    "",
    `Questions? WhatsApp us: ${helpHref}`,
  ].join("\n");
  return {
    subject: retake ? `Order ${o.ref}: we need a new photo of your documents` : `Order ${o.ref}: upload your documents so we can make your plates`,
    html,
    text,
  };
}
