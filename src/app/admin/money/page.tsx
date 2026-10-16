import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { fmtDateTime, requireAdmin } from "@/lib/admin";
import { isStripeConfigured } from "@/lib/stripe";
import { type Movement, type Payout, balance, payoutMovements, recentMovements, recentPayouts } from "@/lib/stripe-money";

export const metadata = { title: "Money" };

// Pence to "£1.23" or "−£1.23".
const gbp = (p: number) => `${p < 0 ? "−" : ""}£${(Math.abs(p) / 100).toFixed(2)}`;
const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

async function load() {
  const [bal, movements, payouts] = await Promise.all([balance(), recentMovements(100), recentPayouts(6)]);
  const breakdowns = await Promise.all(payouts.map((p) => payoutMovements(p.id).catch(() => [] as Movement[])));
  // Refunds in a payout may refund a payment from an earlier one: match them to orders too.
  const orderOf = new Map(movements.filter((m) => m.orderRef).map((m) => [m.chargeId, m.orderRef]));
  const withOrders = (list: Movement[]) => list.map((m) => (m.orderRef ? m : { ...m, orderRef: orderOf.get(m.chargeId) ?? null }));
  return { bal, movements, payouts: payouts.map((p, i) => ({ ...p, items: withOrders(breakdowns[i]) })) };
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

export default async function MoneyPage() {
  await requireAdmin();
  if (!isStripeConfigured())
    return (
      <AdminShell active="money">
        <p className="rounded-2xl border border-line bg-white p-6">Stripe isn&apos;t connected, so there&apos;s nothing to show.</p>
      </AdminShell>
    );
  let data: Awaited<ReturnType<typeof load>>;
  try {
    data = await load();
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
  const { bal, movements, payouts } = data;
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
    </AdminShell>
  );
}
