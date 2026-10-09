import { describe, money, unitPrice, type CartItem } from "./plates";
import { site, whatsappHref } from "./site";
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
export function plateImageUrl(i: CartItem, side: "front" | "rear" = i.which === "front" ? "front" : "rear") {
  const q = new URLSearchParams({
    text: i.reg,
    type: i.type,
    style: i.style,
    badge: i.badge,
    border: i.border,
    side,
  });
  return `${site.url}/api/plate-image?${q}`;
}

function itemsHtml(o: Order, imgWidth: number) {
  return o.items
    .map((i) => {
      return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid ${LINE};">
          <img src="${esc(plateImageUrl(i))}" width="${imgWidth}" alt="${esc(i.reg)} number plate" style="display:block;width:${imgWidth}px;max-width:100%;height:auto;border-radius:6px;" />
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

function layout(title: string, preheader: string, body: string) {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${CREAM};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
      <tr><td align="center" style="background:${INK};padding:22px;">
        <img src="${site.url}/email/logo.png" width="180" alt="PlatedUp" style="display:block;width:180px;height:auto;" />
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

export function customerOrderEmail(o: Order) {
  const first = o.customer_name.split(" ")[0] || "there";
  const paid = o.status === "paid" || o.amount_paid !== null;
  const card = cardLine(o);
  const uploadUrl = `${site.url}/upload-documents?ref=${encodeURIComponent(o.ref)}`;
  const helpHref = whatsappHref.replace(
    encodeURIComponent("I'm a customer and I need some help"),
    encodeURIComponent(`I need some help with my order ${o.ref}`),
  );

  const next =
    o.docs_status === "outstanding"
      ? `<p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0 0 14px;"><strong>One more step:</strong> by law we must see your V5C (or other proof you own the registration) and photo ID before we can make road-legal plates. A photo from your phone is perfect.</p>
         <p style="margin:0 0 8px;">${button(uploadUrl, "Upload my documents", INK)}</p>`
      : `<p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">We're making your plates now. Orders placed before ${site.dispatchCutoff} on a working day are dispatched the same day, and we'll let you know when they're on the way.</p>`;

  const html = layout(
    `Your PlatedUp order ${o.ref}`,
    `Thanks ${first}! Order ${o.ref}${paid ? ` · ${money(o.amount_paid ?? o.total)} paid` : ""}.`,
    `
    <p style="font:700 26px Arial,sans-serif;color:${INK};margin:0 0 6px;">Thanks for your order, ${esc(first)}!</p>
    <p style="font:15px Arial,sans-serif;color:${MUTED};margin:0 0 18px;">Order <strong style="color:${INK};">${o.ref}</strong> · ${fmtDate(o.paid_at ?? o.created_at)}</p>
    <p style="margin:0 0 6px;"><span style="display:inline-block;background:${paid ? "#e7f6ec" : "#fff5ec"};color:${paid ? "#1f7a3d" : "#8a4a12"};font:700 13px Arial,sans-serif;padding:6px 12px;border-radius:999px;">${paid ? "✓ Payment received" : "Order received · awaiting payment"}</span></p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 544)}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row("Subtotal", money(o.subtotal))}
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

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px;background:#f1faf3;border:1px solid #cfe6d4;border-radius:12px;">
      <tr><td style="padding:16px 18px;">
        <p style="font:700 16px Arial,sans-serif;color:${INK};margin:0 0 4px;">Any questions or issues?</p>
        <p style="font:14px/1.5 Arial,sans-serif;color:${MUTED};margin:0 0 12px;">Message us on WhatsApp with your order number and a real person will help.</p>
        ${button(helpHref, "Chat on WhatsApp", "#25D366")}
      </td></tr>
    </table>
    `,
  );

  const text = [
    `Thanks for your order, ${first}!`,
    `Order ${o.ref} · ${paid ? `Payment received (${money(o.amount_paid ?? o.total)})` : "Awaiting payment"}`,
    card && `Paid with ${card}`,
    "",
    ...o.items.map((i) => `- "${i.reg}" × ${i.qty}: ${describe(i)} (${money(unitPrice(i) * i.qty)})`),
    `Delivery: ${o.delivery_name} (${o.delivery_price ? money(o.delivery_price) : "FREE"})`,
    `Total: ${money(o.amount_paid ?? o.total)}`,
    "",
    o.docs_status === "outstanding" ? `Please upload your V5C and photo ID: ${uploadUrl}` : "We're making your plates now.",
    "",
    `Questions? WhatsApp us: ${helpHref}`,
  ]
    .filter((l): l is string => typeof l === "string")
    .join("\n");

  return {
    subject: paid ? `Order confirmed: ${o.ref} (${money(o.amount_paid ?? o.total)} paid)` : `Order received: ${o.ref}`,
    html,
    text,
  };
}

export function shopOrderEmail(o: Order, docCount: number) {
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
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${itemsHtml(o, 420)}</table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
      ${row(esc(o.delivery_name), o.delivery_price ? money(o.delivery_price) : "FREE")}
      ${row("Total", money(o.total), true)}
    </table>
    <p style="font:700 16px Arial,sans-serif;color:${INK};margin:20px 0 6px;">Customer</p>
    <p style="font:15px/1.6 Arial,sans-serif;color:${INK};margin:0;">${esc(o.customer_name)}<br /><a href="mailto:${esc(o.email)}" style="color:${GOLD};">${esc(o.email)}</a> · ${esc(o.phone)}<br />${esc(o.address1)}${o.address2 ? `, ${esc(o.address2)}` : ""}, ${esc(o.town)} ${esc(o.postcode)}</p>
    <p style="margin:20px 0 8px;">${button(`${site.url}/admin/orders/${o.ref}`, "Open in admin portal", INK)}</p>
    `,
  );

  return {
    subject: `${paid ? `✅ PAID ${money(o.amount_paid!)}` : "⚠️ NOT PAID"}: order ${o.ref} (${regs})`,
    text,
    html,
  };
}
