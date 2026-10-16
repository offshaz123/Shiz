import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { fmtDateTime, requireAdmin } from "@/lib/admin";
import { isStripeConfigured } from "@/lib/stripe";
import { type Movement, type Payout, balance, payoutMovements, recentMovements, recentPayouts } from "@/lib/stripe-money";
import { type OrderMoney, dayString, orderMoney, parseDay } from "@/lib/order-money";
import { statusLabels } from "@/lib/orders";

const DAY = 24 * 60 * 60 * 1000;

export const metadata = { title: "Money" };

// Pence to "£1.23" or "−£1.23".
const gbp = (p: number) => `${p < 0 ? "−" : ""}£${(Math.abs(p) / 100).toFixed(2)}`;
const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

async function load(from: Date, to: Date) {
  const [bal, movements, payouts, perOrder] = await Promise.all([balance(), recentMovements(100), recentPayouts(6), orderMoney(from, to)]);
  const breakdowns = await Promise.all(payouts.map((p) => payoutMovements(p.id).catch(() => [] as Movement[])));
  // Refunds in a payout may refund a payment from an earlier one: match them to orders too.
  const orderOf = new Map(movements.filter((m) => m.orderRef).map((m) => [m.chargeId, m.orderRef]));
  const withOrders = (list: Movement[]) => list.map((m) => (m.orderRef ? m : { ...m, orderRef: orderOf.get(m.chargeId) ?? null }));
  return { bal, movements, perOrder, payouts: payouts.map((p, i) => ({ ...p, items: withOrders(breakdowns[i]) })) };
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted">{note}</p>
    </div>
  );
}

function Rows({ items, showStatus }: { items: Movement[]; showStatus: boolean }) {
  if (items.length === 0) return <p className="p-4 text-sm text-muted">Nothing here yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="p-3 font-semibold">Date</th>
            <th className="p-3 font-semibold">What and why</th>
            <th className="p-3 font-semibold">Order</th>
            <th className="p-3 text-right font-semibold">Amount</th>
            <th className="p-3 text-right font-semibold">Stripe fee</th>
            <th className="p-3 text-right font-semibold">You get</th>
            {showStatus && <th className="p-3 font-semibold">Reaches your bank</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.id} className="border-t border-line align-top">
              <td className="whitespace-nowrap p-3 text-muted">{fmtDateTime(m.created)}</td>
              <td className="p-3">
                <p className={`font-semibold ${m.kind === "refund" || m.kind === "dispute" ? "text-[#b42318]" : ""}`}>{m.title}</p>
                {m.why && <p className="mt-0.5 max-w-md text-xs text-muted">{m.why}</p>}
              </td>
              <td className="p-3">
                {m.orderRef ? (
                  <Link href={`/admin/orders/${m.orderRef}`} className="font-mono font-semibold text-gold underline">
                    {m.orderRef}
                  </Link>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="whitespace-nowrap p-3 text-right">{gbp(m.amount)}</td>
              <td className="whitespace-nowrap p-3 text-right">
                {m.fee ? (
                  <>
                    <span className="text-[#b42318]">{gbp(-m.fee)}</span>
                    {m.amount > 0 && m.kind === "payment" && (
                      <span className="block text-xs text-muted">{((m.fee / m.amount) * 100).toFixed(1)}% of the payment</span>
                    )}
                    {m.feeParts.length > 1 &&
                      m.feeParts.map((f) => (
                        <span key={f.label} className="block text-xs text-muted">
                          {f.label}: {gbp(f.amount)}
                        </span>
                      ))}
                  </>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className={`whitespace-nowrap p-3 text-right font-bold ${m.net < 0 ? "text-[#b42318]" : "text-[#1f7a3d]"}`}>{gbp(m.net)}</td>
              {showStatus && (
                <td className="whitespace-nowrap p-3 text-muted">
                  {m.kind === "payout" ? "-" : m.status === "pending" ? `Clears ${day(m.availableOn)}` : "Ready / paid out"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayoutCard({ p }: { p: Payout & { items: Movement[] } }) {
  const paid = p.items.filter((m) => m.kind === "payment").reduce((n, m) => n + m.amount, 0);
  const fees = p.items.reduce((n, m) => n + m.fee, 0) + p.items.filter((m) => m.kind === "fee").reduce((n, m) => n - m.net, 0);
  const refunds = p.items.filter((m) => m.kind === "refund" || m.kind === "dispute").reduce((n, m) => n + m.amount, 0);
  const statusText = p.status === "paid" ? `Paid into your bank ${day(p.arrival)}` : p.status === "in_transit" || p.status === "pending" ? `On its way, due ${day(p.arrival)}` : p.status;
  return (
    <details className="group rounded-2xl border border-line bg-white">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5">
        <span>
          <span className="block font-display text-2xl font-bold">{gbp(p.amount)}</span>
          <span className="text-sm text-muted">{statusText}</span>
        </span>
        <span className="text-sm text-muted">
          Payments {gbp(paid)} · Fees {gbp(-fees)} {refunds ? `· Refunds ${gbp(refunds)}` : ""}
          <span className="ml-2 font-semibold text-gold group-open:hidden">Show what&apos;s in it ›</span>
        </span>
      </summary>
      <div className="border-t border-line">
        <Rows items={p.items} showStatus={false} />
      </div>
    </details>
  );
}

function OrdersTable({ rows }: { rows: OrderMoney[] }) {
  if (rows.length === 0) return <p className="p-4 text-sm text-muted">No paid orders in these dates.</p>;
  const sum = (f: (o: OrderMoney) => number) => rows.reduce((n, o) => n + f(o), 0);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="p-3 font-semibold">Order</th>
            <th className="p-3 font-semibold">Customer</th>
            <th className="p-3 text-right font-semibold">Customer paid</th>
            <th className="p-3 text-right font-semibold">Stripe fee</th>
            <th className="p-3 text-right font-semibold">Refunded</th>
            <th className="p-3 text-right font-semibold">Packlink delivery</th>
            <th className="p-3 text-right font-semibold">You keep</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.ref} className="border-t border-line align-top">
              <td className="p-3">
                <Link href={`/admin/orders/${o.ref}`} className="font-mono font-semibold text-gold underline">
                  {o.ref}
                </Link>
                <span className="block text-xs text-muted">
                  {day(o.paidAt)} · {statusLabels[o.status]}
                </span>
              </td>
              <td className="p-3">{o.customer}</td>
              <td className="whitespace-nowrap p-3 text-right">{gbp(o.paid)}</td>
              <td className="whitespace-nowrap p-3 text-right text-[#b42318]">{o.stripeFee === null ? <span className="text-muted">-</span> : gbp(-o.stripeFee)}</td>
              <td className="whitespace-nowrap p-3 text-right text-[#b42318]">{o.refunded ? gbp(-o.refunded) : <span className="text-muted">-</span>}</td>
              <td className="whitespace-nowrap p-3 text-right">
                {o.delivery === null ? <span className="text-xs text-muted">{o.viaPacklink ? "Label not bought yet" : "Not sent via Packlink"}</span> : <span className="text-[#b42318]">{gbp(-o.delivery)}</span>}
              </td>
              <td className={`whitespace-nowrap p-3 text-right font-bold ${o.keep < 0 ? "text-[#b42318]" : "text-[#1f7a3d]"}`}>{gbp(o.keep)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-line bg-surface font-bold">
            <td className="p-3" colSpan={2}>
              Total · {rows.length} order{rows.length === 1 ? "" : "s"}
            </td>
            <td className="whitespace-nowrap p-3 text-right">{gbp(sum((o) => o.paid))}</td>
            <td className="whitespace-nowrap p-3 text-right text-[#b42318]">{gbp(-sum((o) => o.stripeFee ?? 0))}</td>
            <td className="whitespace-nowrap p-3 text-right text-[#b42318]">{gbp(-sum((o) => o.refunded))}</td>
            <td className="whitespace-nowrap p-3 text-right text-[#b42318]">{gbp(-sum((o) => o.delivery ?? 0))}</td>
            <td className="whitespace-nowrap p-3 text-right text-[#1f7a3d]">{gbp(sum((o) => o.keep))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DateRange({ from, to, label }: { from: string; to: string; label: string }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <label className="block text-sm font-semibold">
        From
        <input type="date" name="from" defaultValue={from} className="field mt-1" />
      </label>
      <label className="block text-sm font-semibold">
        To
        <input type="date" name="to" defaultValue={to} className="field mt-1" />
      </label>
      <button type="submit" className="btn btn-white">
        Show
      </button>
      <button type="submit" formAction="/api/admin/money/export" className="btn btn-gold">
        {label}
      </button>
    </form>
  );
}

export default async function MoneyPage(props: PageProps<"/admin/money">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const today = new Date();
  const from = parseDay(sp.from, new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const toDay = parseDay(sp.to, today);
  const fromText = dayString(from);
  const toText = dayString(toDay);
  if (!isStripeConfigured())
    return (
      <AdminShell active="money">
        <p className="rounded-2xl border border-line bg-white p-6">Stripe isn&apos;t connected, so there&apos;s nothing to show.</p>
      </AdminShell>
    );
  let data: Awaited<ReturnType<typeof load>>;
  try {
    data = await load(from, new Date(toDay.getTime() + DAY));
  } catch (err) {
    console.error("Loading Stripe money failed", err);
    return (
      <AdminShell active="money">
        <p className="rounded-2xl border border-line bg-white p-6 font-semibold text-[#b42318]">
          Couldn&apos;t load your Stripe figures just now ({err instanceof Error ? err.message : "unknown error"}). Try again in a minute.
        </p>
      </AdminShell>
    );
  }
  const { bal, movements, payouts, perOrder } = data;
  const now = new Date();
  const month = movements.filter((m) => m.created.getMonth() === now.getMonth() && m.created.getFullYear() === now.getFullYear() && m.kind !== "payout");
  const taken = month.filter((m) => m.kind === "payment").reduce((n, m) => n + m.amount, 0);
  const fees = month.reduce((n, m) => n + m.fee, 0) + month.filter((m) => m.kind === "fee").reduce((n, m) => n - m.net, 0);
  const refunds = month.filter((m) => m.kind === "refund" || m.kind === "dispute").reduce((n, m) => n - m.amount, 0);
  const kept = month.reduce((n, m) => n + m.net, 0);
  const monthName = now.toLocaleDateString("en-GB", { month: "long", timeZone: "Europe/London" });

  return (
    <AdminShell active="money">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Waiting to clear" value={gbp(bal.pending)} note="Recent payments Stripe is still holding" />
        <Stat label="Ready for your bank" value={gbp(bal.available)} note="Goes out in your next payout" />
        <Stat label={`Customers paid in ${monthName}`} value={gbp(taken)} note={`Stripe fees ${gbp(-fees)} · Refunds ${gbp(-refunds)}`} />
        <Stat label={`You keep from ${monthName}`} value={gbp(kept)} note="After Stripe's fees and refunds" />
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">What you keep from each order</h2>
      <p className="mt-1 text-sm text-muted">
        What the customer paid, minus Stripe&apos;s fee, any refund and what Packlink charged for the label. Live from Stripe and Packlink.
      </p>
      <div className="mt-4">
        <DateRange from={fromText} to={toText} label="Download Excel sheet" />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <OrdersTable rows={perOrder} />
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Payouts to your bank</h2>
      <p className="mt-1 text-sm text-muted">Click a payout to see exactly which payments, fees and refunds it&apos;s made of.</p>
      <div className="mt-4 space-y-3">
        {payouts.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">
            No payouts yet. Stripe holds your first payout for about 7 days, then pays out regularly.
          </p>
        ) : (
          payouts.map((p) => <PayoutCard key={p.id} p={p} />)
        )}
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Every payment, refund and fee</h2>
      <p className="mt-1 text-sm text-muted">
        The latest 100 movements in your Stripe account. &ldquo;You get&rdquo; is what&apos;s left after Stripe&apos;s fee. When you refund,
        the customer gets everything back but Stripe keeps its original fee.
      </p>
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <Rows items={movements} showStatus />
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-white p-5">
        <h2 className="font-display text-2xl font-bold">Download a spreadsheet</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Pick the dates and download every order (with Stripe fees, refunds, Packlink delivery and what you keep) and every Stripe movement.
          Opens in Excel, Numbers or Google Sheets.
        </p>
        <DateRange from={fromText} to={toText} label="Download Excel sheet" />
      </div>
    </AdminShell>
  );
}
