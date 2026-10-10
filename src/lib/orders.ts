import { after } from "next/server";
import type { Attachment } from "nodemailer/lib/mailer";
import { execute, query } from "./db";
import { type CartItem, sanitiseItem } from "./plates";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { LOGO_CID, customerCancelEmail, customerDispatchEmail, customerOrderEmail, plateCid, plateImageParams, shopOrderEmail } from "./emails";
import { renderPlatePng } from "./plate-image";
import { sendMail, sendToShop } from "./mail";
import { type PaidSession, getCheckoutSession } from "./stripe";

export type OrderStatus = "pending" | "unpaid" | "paid" | "in_production" | "dispatched" | "expired" | "cancelled" | "refunded";
export type DocsStatus = "not_needed" | "outstanding" | "received";

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
  received: "Received",
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
  total: number;
  amount_paid: number | null;
  card_brand: string | null;
  card_last4: string | null;
  stripe_session_id: string | null;
  docs_status: DocsStatus;
  created_at: Date;
  paid_at: Date | null;
};

type Row = Omit<Order, "items"> & { items: string };

function parse(row: Row): Order {
  let items: CartItem[] = [];
  try {
    const raw = JSON.parse(row.items);
    items = Array.isArray(raw) ? raw.map(sanitiseItem).filter((i): i is CartItem => i !== null) : [];
  } catch {}
  return { ...row, items };
}

const COLUMNS = `id, ref, user_id, status, customer_name, email, phone, address1, address2, town, postcode, items,
  delivery_name, delivery_price, subtotal, total, amount_paid, card_brand, card_last4, stripe_session_id,
  docs_status, created_at, paid_at`;

export async function createOrder(o: Omit<Order, "id" | "created_at" | "paid_at" | "amount_paid" | "card_brand" | "card_last4" | "stripe_session_id">) {
  const res = await execute(
    `INSERT INTO orders (ref, user_id, status, customer_name, email, phone, address1, address2, town, postcode,
      items, delivery_name, delivery_price, subtotal, total, docs_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      o.ref, o.user_id, o.status, o.customer_name, o.email, o.phone, o.address1, o.address2, o.town, o.postcode,
      JSON.stringify(o.items), o.delivery_name, o.delivery_price, o.subtotal, o.total, o.docs_status,
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

export async function listOrdersForUser(userId: number) {
  const rows = await query<Row>(
    `SELECT ${COLUMNS} FROM orders WHERE user_id = ? AND status NOT IN ('expired', 'cancelled') ORDER BY created_at DESC`,
    [userId],
  );
  return rows.map(parse);
}

export async function setStatus(ref: string, status: OrderStatus) {
  await execute("UPDATE orders SET status = ? WHERE ref = ?", [status, ref]);
}

export async function markDocsReceived(orderId: number) {
  await execute("UPDATE orders SET docs_status = 'received' WHERE id = ? AND docs_status = 'outstanding'", [orderId]);
}

export async function markExpired(ref: string) {
  await execute("UPDATE orders SET status = 'expired' WHERE ref = ? AND status = 'pending'", [ref]);
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
  } catch (err) {
    console.error(`Shop email for ${order.ref} failed`, err);
  }
  const customer = customerOrderEmail(order, mode);
  try {
    await sendMail({ to: order.email, subject: customer.subject, text: customer.text, html: customer.html, attachments: images ?? [] });
  } catch (err) {
    console.error(`Customer email for ${order.ref} failed`, err);
  }
}

// Tells the customer their order has been dispatched or cancelled. Returns
// false if the email couldn't be sent, so the admin can see it.
export async function sendStatusEmail(order: Order, kind: "dispatched" | "cancelled" | "refunded") {
  const images = await emailImages(order);
  const mode = images ? "inline" : "web";
  const email = kind === "dispatched" ? customerDispatchEmail(order, mode) : customerCancelEmail({ ...order, status: kind }, mode);
  try {
    await sendMail({ to: order.email, subject: email.subject, text: email.text, html: email.html, attachments: images ?? [] });
    return true;
  } catch (err) {
    console.error(`${kind} email for ${order.ref} failed`, err);
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
     WHERE ref = ? AND status IN ('pending', 'expired', 'unpaid')`,
    [s.amount, s.cardBrand, s.cardLast4, s.sessionId, s.ref],
  );
  const updated = await getOrder(s.ref);
  if (res.affectedRows === 1 && updated) after(() => sendOrderEmails(updated));
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
