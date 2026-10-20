import { after } from "next/server";
import type { Attachment } from "nodemailer/lib/mailer";
import { execute, query } from "./db";
import { type CartItem, describe, sanitiseSavedItem, unitPrice } from "./plates";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { site } from "./site";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOGO_CID, customerCancelEmail, customerCollectedEmail, customerDocsEmail, customerDispatchEmail, customerOrderEmail, customerReminderEmail, plateCid, plateImageParams, shopOrderEmail } from "./emails";
import { renderPlatePng } from "./plate-image";
import { countDiscountUse } from "./discounts";
import { sendMetaPurchase } from "./meta-capi";
import { packlinkDelivered, sendToPacklink } from "./packlink";
import { notifyNewOrder } from "./push";
import { sendMail, sendToShop, shopAddress } from "./mail";
import { logEmail, logOrderEvent, newToken, withOpenTracker } from "./email-log";
import { type PaidSession, getCheckoutSession } from "./stripe";

export type OrderStatus = "pending" | "unpaid" | "paid" | "in_production" | "dispatched" | "expired" | "cancelled" | "refunded";
export type DocsStatus = "not_needed" | "outstanding" | "received" | "approved";

export const statusLabels: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  unpaid: "Not paid (send payment link)",
  paid: "Paid",
  in_production: "In production",
  dispatched: "Dispatched",
  expired: "Payment not completed",
  cancelled: "Cancelled",
  refunded: "Cancelled & refunded",
};

export const docsLabels: Record<DocsStatus, string> = {
  not_needed: "Not needed",
  outstanding: "Outstanding",
  received: "Received, not checked yet",
  approved: "Checked ✓",
};

export type Order = {
  id: number;
  ref: string;
  user_id: number | null;
  status: OrderStatus;
  customer_name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  town: string;
  postcode: string;
  items: CartItem[];
  delivery_name: string;
  delivery_price: number;
  subtotal: number;
  // Discount code used and how much it took off the plates (pence).
  discount_code: string | null;
  discount: number;
  total: number;
  amount_paid: number | null;
  card_brand: string | null;
  card_last4: string | null;
  stripe_session_id: string | null;
  docs_status: DocsStatus;
  tracking_number: string | null;
  tracking_carrier: string | null;
  packlink_ref: string | null;
  packlink_error: string | null;
  packlink_cost: number | null;
  delivered_at: Date | null;
  created_at: Date;
  paid_at: Date | null;
};

type Row = Omit<Order, "items"> & { items: string };

function parse(row: Row): Order {
  let items: CartItem[] = [];
  try {
    const raw = JSON.parse(row.items);
    items = Array.isArray(raw) ? raw.map(sanitiseSavedItem).filter((i): i is CartItem => i !== null) : [];
  } catch {}
  return { ...row, items };
}

const COLUMNS = `id, ref, user_id, status, customer_name, email, phone, address1, address2, town, postcode, items,
  delivery_name, delivery_price, subtotal, discount_code, discount, total, amount_paid, card_brand, card_last4, stripe_session_id,
  docs_status, tracking_number, tracking_carrier, packlink_ref, packlink_error, packlink_cost, delivered_at, created_at, paid_at`;

export async function createOrder(
  o: Omit<Order, "id" | "created_at" | "paid_at" | "amount_paid" | "card_brand" | "card_last4" | "stripe_session_id" | "tracking_number" | "tracking_carrier" | "packlink_ref" | "packlink_error" | "packlink_cost" | "delivered_at">,
) {
  const res = await execute(
    `INSERT INTO orders (ref, user_id, status, customer_name, email, phone, address1, address2, town, postcode,
      items, delivery_name, delivery_price, subtotal, discount_code, discount, total, docs_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.ref, o.user_id, o.status, o.customer_name, o.email, o.phone, o.address1, o.address2, o.town, o.postcode,
      JSON.stringify(o.items), o.delivery_name, o.delivery_price, o.subtotal, o.discount_code, o.discount, o.total, o.docs_status,
    ],
  );
  return res.insertId;
}

export async function saveDocuments(orderId: number, files: Attachment[], kinds: string[]) {
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    await execute("INSERT INTO documents (order_id, kind, filename, mime, data) VALUES (?, ?, ?, ?, ?)", [
      orderId,
      kinds[i] ?? "document",
      String(f.filename ?? "document").slice(0, 200),
      String(f.contentType ?? "application/octet-stream").slice(0, 100),
      f.content as Buffer,
    ]);
  }
}

export async function getDocuments(orderId: number) {
  return query<{ id: number; kind: string; filename: string; mime: string; data: Buffer; created_at: Date }>(
    "SELECT id, kind, filename, mime, data, created_at FROM documents WHERE order_id = ? ORDER BY id",
    [orderId],
  );
}

export async function listDocuments(orderId: number) {
  return query<{ id: number; kind: string; filename: string; mime: string; created_at: Date }>(
    "SELECT id, kind, filename, mime, created_at FROM documents WHERE order_id = ? ORDER BY id",
    [orderId],
  );
}

export async function getOrder(ref: string) {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM orders WHERE ref = ?`, [ref]);
  return rows[0] ? parse(rows[0]) : null;
}

export async function setStripeSession(ref: string, sessionId: string) {
  await execute("UPDATE orders SET stripe_session_id = ? WHERE ref = ?", [sessionId, ref]);
}

export async function listOrders(opts: { status?: string; search?: string; limit?: number } = {}) {
  const where: string[] = [];
  const params: (string | number)[] = [];
  if (opts.status === "active") where.push("status NOT IN ('expired', 'cancelled', 'pending')");
  else if (opts.status && opts.status in statusLabels) {
    where.push("status = ?");
    params.push(opts.status);
  }
  if (opts.search) {
    where.push("(ref LIKE ? OR email LIKE ? OR customer_name LIKE ? OR items LIKE ?)");
    const like = `%${opts.search}%`;
    params.push(like, like, like, like);
  }
  params.push(opts.limit ?? 200);
  const rows = await query<Row>(
    `SELECT ${COLUMNS} FROM orders ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC LIMIT ?`,
    params,
  );
  return rows.map(parse);
}

// Every order started between two dates, whatever happened to it.
export async function listOrdersCreatedBetween(from: Date, to: Date) {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM orders WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC`, [from, to]);
  return rows.map(parse);
}

// Orders still waiting on the shop: paid but not dispatched yet.
export async function listOpenOrders() {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM orders WHERE status IN ('paid', 'in_production') ORDER BY paid_at ASC`);
  return rows.map(parse);
}

// Orders paid between two dates (including ones later refunded), oldest first.
export async function listPaidOrdersBetween(from: Date, to: Date) {
  const rows = await query<Row>(`SELECT ${COLUMNS} FROM orders WHERE paid_at >= ? AND paid_at < ? ORDER BY paid_at ASC`, [from, to]);
  return rows.map(parse);
}

export async function listOrdersForUser(userId: number) {
  const rows = await query<Row>(
    `SELECT ${COLUMNS} FROM orders WHERE user_id = ? AND status NOT IN ('expired', 'cancelled') ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(parse);
}

export async function setStatus(ref: string, status: OrderStatus) {
  await execute("UPDATE orders SET status = ? WHERE ref = ?", [status, ref]);
  await logOrderEvent(ref, status);
}

export async function setTracking(ref: string, number: string | null, carrier: string | null) {
  await execute("UPDATE orders SET tracking_number = ?, tracking_carrier = ? WHERE ref = ?", [number, number ? carrier : null, ref]);
}

export async function markDocsReceived(orderId: number) {
  await execute("UPDATE orders SET docs_status = 'received' WHERE id = ? AND docs_status = 'outstanding'", [orderId]);
}

// Returns true when this call changed it (so the reminder is sent only once).
export async function markExpired(ref: string) {
  const res = await execute("UPDATE orders SET status = 'expired' WHERE ref = ? AND status = 'pending'", [ref]);
  return res.affectedRows === 1;
}

// The Stripe checkout lines for an order already saved.
export function checkoutLines(o: Pick<Order, "items" | "delivery_name" | "delivery_price">) {
  const lines = o.items.map((i) => ({ name: `${i.reg}: ${describe(i)}`, amount: unitPrice(i), qty: i.qty }));
  if (o.delivery_price) lines.push({ name: o.delivery_name, amount: o.delivery_price, qty: 1 });
  return lines;
}

// One "your plates are still waiting" email when a checkout expires unpaid.
// Skipped if they've since paid for another order, or already had a
// reminder in the last day (several abandoned tries shouldn't mean several emails).
export async function sendCheckoutReminder(ref: string) {
  const order = await getOrder(ref);
  if (!order || order.status !== "expired" || order.items.length === 0) return;
  const recent = await query(
    `SELECT 1 FROM orders o WHERE LOWER(o.email) = ? AND (
        (o.status IN ('paid', 'in_production', 'dispatched') AND o.created_at >= ?)
        OR EXISTS (SELECT 1 FROM email_log e WHERE e.order_id = o.id AND e.kind = 'reminder' AND e.created_at > NOW() - INTERVAL 1 DAY)
      ) LIMIT 1`,
    [order.email.toLowerCase(), order.created_at],
  );
  if (recent.length) return;
  const token = randomBytes(16).toString("hex");
  // Free delivery if they finish within 24 hours (the resume link applies it).
  const freeDelivery = order.delivery_price > 0;
  await execute(
    `UPDATE orders SET resume_token = ?, free_delivery_until = ${freeDelivery ? "NOW() + INTERVAL 24 HOUR" : "NULL"} WHERE id = ?`,
    [token, order.id],
  );
  const resumeUrl = `${site.url}/complete-order?ref=${encodeURIComponent(order.ref)}&t=${token}`;
  const images = await emailImages(order);
  const email = customerReminderEmail(order, resumeUrl, images ? "inline" : "web", freeDelivery);
  const openToken = newToken();
  try {
    await sendMail({ to: order.email, subject: email.subject, text: email.text, html: withOpenTracker(email.html, openToken), attachments: images ?? [] });
    await logEmail({ orderId: order.id, kind: "reminder", recipient: order.email, ok: true, token: openToken });
  } catch (err) {
    console.error(`Checkout reminder for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind: "reminder", recipient: order.email, ok: false, error: err });
  }
}

// Takes the delivery charge off an unpaid order if the reminder email's
// free delivery offer hasn't run out yet. Says whether the order now has the
// offer ("claimed"), it ran out first ("ended"), or none was made.
export async function claimFreeDelivery(order: Order) {
  const rows = await query<{ until: Date | null }>("SELECT free_delivery_until AS until FROM orders WHERE id = ?", [order.id]);
  if (!rows[0]?.until) return { order, offer: "none" as const };
  const res = await execute(
    `UPDATE orders SET total = total - delivery_price, delivery_price = 0
     WHERE id = ? AND status IN ('pending', 'expired') AND delivery_price > 0 AND free_delivery_until > NOW()`,
    [order.id],
  );
  if (res.affectedRows === 1) await logOrderEvent(order.ref, "free_delivery");
  const now = res.affectedRows === 1 ? ((await getOrder(order.ref)) ?? order) : order;
  return { order: now, offer: now.delivery_price === 0 ? ("claimed" as const) : ("ended" as const) };
}

// The resume link's secret, checked without leaking timing.
export async function resumeTokenMatches(ref: string, token: string) {
  const rows = await query<{ resume_token: string | null }>("SELECT resume_token FROM orders WHERE ref = ?", [ref]);
  const saved = rows[0]?.resume_token;
  if (!saved || token.length !== saved.length) return false;
  return timingSafeEqual(Buffer.from(saved), Buffer.from(token));
}

// The parcel reached the customer. Only the first time counts.
export async function markDelivered(order: Order, when = new Date()) {
  const res = await execute("UPDATE orders SET delivered_at = ? WHERE id = ? AND delivered_at IS NULL", [when, order.id]);
  if (res.affectedRows === 1) await logOrderEvent(order.ref, "delivered");
  return res.affectedRows === 1;
}

// Asks Packlink about parcels still on their way (dispatched in the last
// three weeks). Checked by the half-hourly timer.
export async function checkDeliveries() {
  const rows = await query<{ ref: string }>(
    `SELECT ref FROM orders WHERE status = 'dispatched' AND delivered_at IS NULL AND packlink_ref IS NOT NULL
       AND COALESCE(paid_at, created_at) > NOW() - INTERVAL 21 DAY`,
  );
  for (const { ref } of rows) {
    const order = await getOrder(ref);
    if (!order?.packlink_ref) continue;
    const when = await packlinkDelivered(order.packlink_ref);
    if (when) await markDelivered(order, when);
  }
}

// Plates collected by the customer or delivered by hand: the order is done
// (dispatched and delivered, with no tracking) and the customer gets a short
// "you've received your plates" email instead of the "on its way" one.
export async function markHandedOver(order: Order) {
  await execute("UPDATE orders SET status = 'dispatched', delivered_at = NOW(), tracking_number = NULL, tracking_carrier = NULL WHERE id = ?", [order.id]);
  await logOrderEvent(order.ref, "dispatched");
  await logOrderEvent(order.ref, "collected");
  await logOrderEvent(order.ref, "delivered");
  return sendCollectedEmail(order);
}

// The "you've got your plates" email for an order handed over in person.
export async function sendCollectedEmail(order: Order) {
  const email = customerCollectedEmail(order);
  const token = newToken();
  try {
    await sendMail({ to: order.email, subject: email.subject, text: email.text, html: withOpenTracker(email.html, token) });
    await logEmail({ orderId: order.id, kind: "collected", recipient: order.email, ok: true, token });
    return true;
  } catch (err) {
    console.error(`Handed over email for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind: "collected", recipient: order.email, ok: false, error: err });
    return false;
  }
}

// The admin checked the documents: "approved", or back to "outstanding" when
// a new photo is needed.
export async function setDocsStatus(order: Order, status: "approved" | "outstanding") {
  await execute("UPDATE orders SET docs_status = ? WHERE id = ?", [status, order.id]);
  await logOrderEvent(order.ref, status === "approved" ? "docs_approved" : "docs_retake");
}

// Asks the customer for their documents: a reminder when they haven't sent
// them, or a request for a new photo with the reason. Returns true if sent.
export async function sendDocsEmail(order: Order, kind: "docs_reminder" | "docs_retake", reason = "") {
  const email = customerDocsEmail(order, kind === "docs_retake" ? reason : null);
  const token = newToken();
  try {
    await sendMail({ to: order.email, subject: email.subject, text: email.text, html: withOpenTracker(email.html, token) });
    await logEmail({ orderId: order.id, kind, recipient: order.email, ok: true, token });
    return true;
  } catch (err) {
    console.error(`${kind} email for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind, recipient: order.email, ok: false, error: err });
    return false;
  }
}

// Paid orders still waiting for documents get a reminder a day after paying,
// and one more after three days. Checked by the half-hourly timer.
export async function sendDueDocsReminders() {
  const due = await query<{ ref: string }>(
    `SELECT o.ref FROM orders o
     WHERE o.status IN ('paid', 'in_production') AND o.docs_status = 'outstanding' AND o.paid_at > NOW() - INTERVAL 14 DAY
       AND NOT EXISTS (SELECT 1 FROM email_log e WHERE e.order_id = o.id AND e.kind IN ('docs_reminder', 'docs_retake') AND e.created_at > NOW() - INTERVAL 1 DAY)
       AND (
         (o.paid_at < NOW() - INTERVAL 1 DAY AND NOT EXISTS (SELECT 1 FROM email_log e WHERE e.order_id = o.id AND e.kind = 'docs_reminder' AND e.status = 'sent'))
         OR (o.paid_at < NOW() - INTERVAL 3 DAY AND (SELECT COUNT(*) FROM email_log e WHERE e.order_id = o.id AND e.kind = 'docs_reminder' AND e.status = 'sent') = 1)
       )`,
  );
  for (const { ref } of due) {
    const order = await getOrder(ref);
    if (order) await sendDocsEmail(order, "docs_reminder");
  }
}

// Sends the "new paid order" email to the shop (with documents) and the
// receipt to the customer. Email problems are logged, never thrown: the
// payment is already taken and the order is safe in the database.
export async function sendOrderEmails(order: Order) {
  const docs = await getDocuments(order.id);
  const images = await emailImages(order);
  const mode = images ? "inline" : "web";
  const shop = shopOrderEmail(order, docs.length, mode);
  try {
    await sendToShop({
      subject: shop.subject,
      text: shop.text,
      html: shop.html,
      replyTo: order.email,
      attachments: [
        ...(images ?? []),
        ...docs.map((d) => ({ filename: d.filename, content: d.data, contentType: d.mime })),
      ],
    });
    await logEmail({ orderId: order.id, kind: "shop", recipient: shopAddress(), ok: true });
  } catch (err) {
    console.error(`Shop email for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind: "shop", recipient: shopAddress(), ok: false, error: err });
  }
  const customer = customerOrderEmail(order, mode);
  const token = newToken();
  try {
    await sendMail({ to: order.email, subject: customer.subject, text: customer.text, html: withOpenTracker(customer.html, token), attachments: images ?? [] });
    await logEmail({ orderId: order.id, kind: "receipt", recipient: order.email, ok: true, token });
  } catch (err) {
    console.error(`Customer email for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind: "receipt", recipient: order.email, ok: false, error: err });
  }
}

// Tells the customer their order has been dispatched or cancelled. Returns
// false if the email couldn't be sent, so the admin can see it.
export async function sendStatusEmail(order: Order, kind: "dispatched" | "cancelled" | "refunded") {
  const images = await emailImages(order);
  const mode = images ? "inline" : "web";
  const email = kind === "dispatched" ? customerDispatchEmail(order, mode) : customerCancelEmail({ ...order, status: kind }, mode);
  const token = newToken();
  try {
    await sendMail({ to: order.email, subject: email.subject, text: email.text, html: withOpenTracker(email.html, token), attachments: images ?? [] });
    await logEmail({ orderId: order.id, kind, recipient: order.email, ok: true, token });
    return true;
  } catch (err) {
    console.error(`${kind} email for ${order.ref} failed`, err);
    await logEmail({ orderId: order.id, kind, recipient: order.email, ok: false, error: err });
    return false;
  }
}

// The logo and a picture of each plate, attached to the email so they show
// even when the email app blocks pictures from websites. Null if they can't
// be made (the emails then link to the pictures on the website instead).
async function emailImages(order: Order): Promise<Attachment[] | null> {
  try {
    const logo = await readFile(join(process.cwd(), "src/assets/email-logo.png"));
    const plates = await Promise.all(order.items.map((i) => renderPlatePng(plateImageParams(i))));
    return [
      { filename: "platedup.png", content: logo, contentType: "image/png", cid: LOGO_CID },
      ...plates.map((png, index) => ({
        filename: `plate-${index + 1}.png`,
        content: png,
        contentType: "image/png",
        cid: plateCid(index),
      })),
    ];
  } catch (err) {
    console.error(`Making email pictures for ${order.ref} failed`, err);
    return null;
  }
}

// Marks an order paid once Stripe confirms it. Safe to call more than once
// (from the webhook, the thank-you page and the admin): only the first call
// changes the order and sends the emails. The emails go out after the
// response, so the customer's thank-you page loads straight away.
export async function markPaid(s: PaidSession) {
  if (!s.paid || !s.ref) return null;
  const order = await getOrder(s.ref);
  if (!order) return null;
  if (order.stripe_session_id && order.stripe_session_id !== s.sessionId) return null;
  const res = await execute(
    `UPDATE orders SET status = 'paid', paid_at = NOW(), amount_paid = ?, card_brand = ?, card_last4 = ?, stripe_session_id = ?
     WHERE ref = ? AND (status IN ('pending', 'expired', 'unpaid')
       OR (status IN ('paid', 'in_production', 'dispatched') AND amount_paid IS NULL))`,
    [s.amount, s.cardBrand, s.cardLast4, s.sessionId, s.ref],
  );
  const updated = await getOrder(s.ref);
  if (res.affectedRows === 1 && updated) {
    if (updated.discount_code) await countDiscountUse(updated.discount_code);
    after(() => sendOrderEmails(updated));
    after(() => sendMetaPurchase(updated));
    after(() => sendToPacklink(updated));
    after(() => notifyNewOrder(updated).catch((err) => console.error("New order notification failed", err)));
  }
  return updated;
}

// Asks Stripe about any of these orders still waiting for payment, in case
// Stripe's "payment received" message never reached us. Gives up after a few
// seconds so the page never hangs. Returns true if any order changed.
export async function refreshPendingPayments(orders: Order[]) {
  const pending = orders.filter((o) => o.status === "pending" && o.stripe_session_id).slice(0, 5);
  if (pending.length === 0) return false;
  const check = Promise.all(
    pending.map(async (o) => {
      try {
        const session = await getCheckoutSession(o.stripe_session_id!);
        return Boolean(session.paid && (await markPaid(session)));
      } catch (err) {
        console.error(`Checking payment for ${o.ref} failed`, err);
        return false;
      }
    }),
  ).then((r) => r.some(Boolean));
  return Promise.race([check, new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 4000))]);
}

export async function listCustomers() {
  return query<{
    email: string;
    name: string;
    phone: string;
    orders: number;
    paid_orders: number;
    spent: number;
    first_order: Date;
    last_order: Date;
    has_account: number;
  }>(
    `SELECT o.email,
            MAX(o.customer_name) AS name,
            MAX(o.phone) AS phone,
            COUNT(*) AS orders,
            SUM(o.status IN ('paid', 'in_production', 'dispatched')) AS paid_orders,
            COALESCE(SUM(CASE WHEN o.status IN ('paid', 'in_production', 'dispatched') THEN o.amount_paid ELSE 0 END), 0) AS spent,
            MIN(o.created_at) AS first_order,
            MAX(o.created_at) AS last_order,
            MAX(u.id IS NOT NULL) AS has_account
     FROM orders o LEFT JOIN users u ON u.email = o.email
     WHERE o.status NOT IN ('expired', 'cancelled')
     GROUP BY o.email
     ORDER BY last_order DESC
     LIMIT 500`,
  );
}

export async function listAccounts() {
  return query<{ id: number; email: string; name: string; phone: string; created_at: Date; orders: number }>(
    `SELECT u.id, u.email, u.name, u.phone, u.created_at,
            (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id AND o.status NOT IN ('expired', 'cancelled')) AS orders
     FROM users u ORDER BY u.created_at DESC LIMIT 500`,
  );
}
