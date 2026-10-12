import { randomBytes } from "node:crypto";
import { execute, query } from "./db";
import { site } from "./site";

// Keeps a record of every email sent about an order, and when the customer
// opened it, for the order timeline in the admin.

export type EmailKind = "receipt" | "shop" | "dispatched" | "cancelled" | "refunded";

export type EmailLog = {
  id: number;
  order_id: number;
  kind: EmailKind;
  recipient: string;
  status: "sent" | "failed";
  error: string | null;
  opened_at: Date | null;
  created_at: Date;
};

export function newToken() {
  return randomBytes(16).toString("hex");
}

// A tiny invisible picture: when the customer opens the email, their email
// app loads it and we note the time. Some apps (e.g. Apple Mail) load it
// automatically, and some block pictures, so treat "opened" as a good sign
// rather than a guarantee.
export function withOpenTracker(html: string, token: string) {
  const img = `<img src="${site.url}/api/e/${token}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0;" />`;
  return html.includes("</body>") ? html.replace("</body>", `${img}</body>`) : html + img;
}

// Turns common email errors into something the shop can act on.
function plainError(err: unknown) {
  const raw = err instanceof Error ? err.message : String(err ?? "Unknown error");
  const code = (err as { code?: string; responseCode?: number })?.code ?? "";
  const status = (err as { responseCode?: number })?.responseCode ?? 0;
  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ESOCKET|ECONNECTION|EDNS/.test(code + raw)) return "Couldn't reach the email server. Try Resend in a few minutes.";
  if (code === "EAUTH") return "The email server refused our login. Check SMTP_USER and SMTP_PASS in Hostinger.";
  if (code === "EENVELOPE" || (status >= 550 && status < 560))
    return `The customer's email address was rejected. Check it's typed correctly and contact them on WhatsApp. (${raw})`;
  return raw;
}

// Never lets a logging problem stop an email or an order.
export async function logEmail(e: { orderId: number; kind: EmailKind; recipient: string; ok: boolean; error?: unknown; token?: string }) {
  try {
    const error = e.ok ? null : plainError(e.error).slice(0, 300);
    await execute("INSERT INTO email_log (order_id, kind, recipient, status, error, token) VALUES (?, ?, ?, ?, ?, ?)", [
      e.orderId,
      e.kind,
      e.recipient,
      e.ok ? "sent" : "failed",
      error,
      e.ok ? (e.token ?? null) : null,
    ]);
  } catch (err) {
    console.error("Logging email failed", err);
  }
}

export async function markEmailOpened(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return;
  await execute("UPDATE email_log SET opened_at = NOW() WHERE token = ? AND opened_at IS NULL", [token]);
}

export async function listEmailLog(orderId: number) {
  return query<EmailLog>("SELECT * FROM email_log WHERE order_id = ? ORDER BY created_at, id", [orderId]);
}

// The latest receipt email for each order, for the orders list.
export async function receiptSummary(orderIds: number[]) {
  if (!orderIds.length) return new Map<number, Pick<EmailLog, "status" | "opened_at">>();
  const rows = await query<{ order_id: number; status: "sent" | "failed"; opened_at: Date | null }>(
    `SELECT l.order_id, l.status, l.opened_at FROM email_log l
     JOIN (SELECT order_id, MAX(id) AS id FROM email_log WHERE kind = 'receipt' AND order_id IN (?) GROUP BY order_id) last ON last.id = l.id`,
    [orderIds],
  );
  return new Map(rows.map((r) => [r.order_id, { status: r.status, opened_at: r.opened_at }]));
}

export async function logOrderEvent(ref: string, event: string) {
  try {
    await execute("INSERT INTO order_events (order_id, event) SELECT id, ? FROM orders WHERE ref = ?", [event, ref]);
  } catch (err) {
    console.error("Logging order event failed", err);
  }
}

export async function listOrderEvents(orderId: number) {
  return query<{ event: string; created_at: Date }>("SELECT event, created_at FROM order_events WHERE order_id = ? ORDER BY id", [orderId]);
}
