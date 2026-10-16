import { type Order, listPaidOrdersBetween } from "./orders";
import { packlinkCost } from "./packlink";
import { movementsBetween } from "./stripe-money";

// What each order actually leaves you with: what the customer paid, minus
// Stripe's fee, any refund and the Packlink label. All read live from Stripe
// and Packlink.
export type OrderMoney = {
  ref: string;
  paidAt: Date;
  customer: string;
  status: Order["status"];
  // Pence. Null where it isn't known yet (no Stripe record found, or no label bought).
  paid: number;
  stripeFee: number | null;
  refunded: number;
  delivery: number | null;
  // What the customer paid us for delivery, and which option they chose.
  deliveryCharged: number;
  deliveryName: string;
  // False when the order was never sent to Packlink (e.g. posted another way).
  viaPacklink: boolean;
  keep: number;
};

const DAY = 24 * 60 * 60 * 1000;

// Runs `fn` on every item, a few at a time, giving up on any that take too long.
async function eachLimited<T, R>(items: T[], fn: (item: T) => Promise<R>, fallback: R, limit = 5, timeoutMs = 8000) {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await Promise.race([fn(items[i]).catch(() => fallback), new Promise<R>((r) => setTimeout(() => r(fallback), timeoutMs))]);
      }
    }),
  );
  return out;
}

export async function orderMoney(from: Date, to: Date): Promise<OrderMoney[]> {
  const orders = await listPaidOrdersBetween(from, to);
  if (orders.length === 0) return [];
  // Refunds can come days after the order, so look at Stripe up to today.
  const moves = await movementsBetween(new Date(from.getTime() - DAY), new Date(Date.now() + DAY));
  const fees = new Map<string, number>();
  const refunds = new Map<string, number>();
  for (const m of moves) {
    if (!m.orderRef) continue;
    if (m.kind === "payment") fees.set(m.orderRef, (fees.get(m.orderRef) ?? 0) + m.fee);
    if (m.kind === "refund" || m.kind === "dispute") refunds.set(m.orderRef, (refunds.get(m.orderRef) ?? 0) - m.amount);
  }
  const delivery = await eachLimited(orders, packlinkCost, null);
  return orders.map((o, i) => {
    const paid = o.amount_paid ?? o.total;
    const stripeFee = fees.get(o.ref) ?? null;
    const refunded = refunds.get(o.ref) ?? 0;
    return {
      ref: o.ref,
      paidAt: o.paid_at ?? o.created_at,
      customer: o.customer_name,
      status: o.status,
      paid,
      stripeFee,
      refunded,
      delivery: delivery[i],
      deliveryCharged: o.delivery_price,
      deliveryName: o.delivery_name,
      viaPacklink: Boolean(o.packlink_ref),
      keep: paid - (stripeFee ?? 0) - refunded - (delivery[i] ?? 0),
    };
  });
}

// "2026-10-01" → midnight UK time that day; falls back when missing or invalid.
export function parseDay(v: unknown, fallback: Date) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return fallback;
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

export const dayString = (d: Date) => d.toISOString().slice(0, 10);
