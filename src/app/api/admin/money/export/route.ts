import { isAdmin } from "@/lib/auth";
import { statusLabels } from "@/lib/orders";
import { dayString, orderMoney, parseDay } from "@/lib/order-money";
import { movementsBetween } from "@/lib/stripe-money";
import { adSpend, isMetaAdsConfigured } from "@/lib/meta-ads";

const DAY = 24 * 60 * 60 * 1000;
const pounds = (p: number | null) => (p === null ? "" : (p / 100).toFixed(2));
// One spreadsheet cell: quoted, and never starting with a formula character.
const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
const row = (cells: (string | number)[]) => cells.map((c) => (typeof c === "number" ? String(c) : cell(c))).join(",");

// A spreadsheet (CSV, opens in Excel) of every order between two dates, with
// what each one left after Stripe, refunds and Packlink, then every Stripe movement.
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Please log in again.", { status: 401 });
  const q = new URL(req.url).searchParams;
  const now = new Date();
  const from = parseDay(q.get("from"), new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  // "To" includes that whole day.
  const to = new Date(parseDay(q.get("to"), now).getTime() + DAY);
  try {
    const [orders, moves, ads] = await Promise.all([
      orderMoney(from, to),
      movementsBetween(from, to),
      isMetaAdsConfigured() ? adSpend(from, new Date(to.getTime() - DAY)).catch(() => null) : Promise.resolve(null),
    ]);
    const kept = orders.reduce((n, o) => n + o.keep, 0);
    const lines = [
      row([`PlatedUp money, ${dayString(from)} to ${dayString(new Date(to.getTime() - DAY))}`]),
      "",
      row(["ORDERS"]),
      row(["Date paid", "Order", "Customer", "Status", "Customer paid (£)", "Stripe fee (£)", "Refunded (£)", "Delivery option", "Customer paid for delivery (£)", "Packlink delivery (£)", "You keep (£)"]),
      ...orders.map((o) =>
        row([
          o.paidAt.toLocaleString("en-GB", { timeZone: "Europe/London" }),
          o.ref,
          o.customer,
          statusLabels[o.status],
          pounds(o.paid),
          pounds(o.stripeFee),
          pounds(o.refunded),
          o.deliveryName,
          pounds(o.deliveryCharged),
          o.delivery === null ? (o.viaPacklink ? "label not bought yet" : "not sent via Packlink") : pounds(o.delivery),
          pounds(o.keep),
        ]),
      ),
      row([
        "TOTAL",
        `${orders.length} orders`,
        "",
        "",
        pounds(orders.reduce((n, o) => n + o.paid, 0)),
        pounds(orders.reduce((n, o) => n + (o.stripeFee ?? 0), 0)),
        pounds(orders.reduce((n, o) => n + o.refunded, 0)),
        "",
        pounds(orders.reduce((n, o) => n + o.deliveryCharged, 0)),
        pounds(orders.reduce((n, o) => n + (o.delivery ?? 0), 0)),
        pounds(orders.reduce((n, o) => n + o.keep, 0)),
      ]),
      "",
      row(["Meta ad spend (£)", ads ? pounds(ads.spend) : "not connected"]),
      row(["Profit after ads (£)", ads ? pounds(kept - ads.spend) : ""]),
      "",
      row(["EVERY STRIPE MOVEMENT"]),
      row(["Date", "What", "Why", "Order", "Amount (£)", "Stripe fee (£)", "Net (£)", "Clears"]),
      ...moves.map((m) =>
        row([
          m.created.toLocaleString("en-GB", { timeZone: "Europe/London" }),
          m.title,
          m.why,
          m.orderRef ?? "",
          pounds(m.amount),
          pounds(m.fee),
          pounds(m.net),
          m.kind === "payout" ? "" : m.availableOn.toLocaleDateString("en-GB", { timeZone: "Europe/London" }),
        ]),
      ),
    ];
    // The byte-order mark makes Excel read £ signs and accents correctly.
    return new Response(`﻿${lines.join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="platedup-money-${dayString(from)}-to-${dayString(new Date(to.getTime() - DAY))}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Money export failed", err);
    return new Response(`Couldn't make the spreadsheet: ${err instanceof Error ? err.message : "unknown error"}`, { status: 502 });
  }
}
