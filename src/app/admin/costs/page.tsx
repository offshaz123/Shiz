import { AdminShell } from "@/components/AdminShell";
import { CostEditor } from "@/components/CostEditor";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_COSTS, costHistory, costLabels, costsOn, itemCost, plateCost, recipes } from "@/lib/costs";
import { type OrderMoney, dayString, orderMoney, parseDay } from "@/lib/order-money";
import { listPaidOrdersBetween, statusLabels } from "@/lib/orders";
import { defaultConfig, describe, money, styles } from "@/lib/plates";
import { loadPriceChanges } from "@/lib/prices";
import { isStripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Costs" };

const DAY = 24 * 60 * 60 * 1000;
const REAL = ["paid", "in_production", "dispatched"];
const day = (d: Date | number) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

export default async function CostsPage(props: PageProps<"/admin/costs">) {
  await requireAdmin();
  await loadPriceChanges();
  const sp = await props.searchParams;
  const today = new Date();
  const from = parseDay(sp.from, new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
  const toDay = parseDay(sp.to, today);
  const end = new Date(toDay.getTime() + DAY);

  const history = await costHistory();
  const current = costsOn(history, today);
  const orders = (await listPaidOrdersBetween(from, end)).reverse();
  // What each order kept after Stripe, refunds and Packlink (needs Stripe).
  let money_: Map<string, OrderMoney> | null = null;
  let moneyError = "";
  if (isStripeConfigured()) {
    try {
      money_ = new Map((await orderMoney(from, end)).map((m) => [m.ref, m]));
    } catch (err) {
      moneyError = err instanceof Error ? err.message : "Couldn't reach Stripe";
    }
  }
  const rows = orders.map((o) => {
    const c = costsOn(history, o.paid_at ?? o.created_at);
    // Cancelled or refunded orders weren't made, so they used no materials.
    const materials = REAL.includes(o.status) ? o.items.reduce((n, i) => n + itemCost(i, c), 0) : 0;
    const keep = money_?.get(o.ref)?.keep ?? null;
    return { o, materials, keep, profit: keep === null ? null : keep - materials };
  });
  const totalMaterials = rows.reduce((n, r) => n + r.materials, 0);
  const totalKeep = rows.every((r) => r.keep !== null) ? rows.reduce((n, r) => n + (r.keep ?? 0), 0) : null;

  // Cost to make each style with a 7-character reg.
  const sample = { ...defaultConfig, reg: "AB12 CDE" };

  return (
    <AdminShell active="costs">
      <h2 className="font-display text-2xl font-bold">What your plates cost to make</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Materials only, from your prices below. A pair is two plates. The flag sheet is only counted on plates where the customer chose a
        flag or green strip; every other plate uses the plain reflective. Your orders below are worked out from what was actually ordered.
        Hex plates cost the same as standard.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Style</th>
              <th className="p-3">Letters</th>
              <th className="p-3 text-right">1 plate, no flag (7 characters)</th>
              <th className="p-3 text-right">Pair, no flag</th>
              <th className="p-3 text-right">Pair if they add a flag</th>
              <th className="p-3 text-right">You sell a pair for</th>
              <th className="p-3 text-right">Left after materials</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {styles.map((s) => {
              const plate = plateCost({ ...sample, style: s.id }, current);
              const flag = plateCost({ ...sample, style: s.id, badge: "uk" }, current);
              return (
                <tr key={s.id}>
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3 text-muted">{recipes[s.id].text}</td>
                  <td className="p-3 text-right">{money(plate)}</td>
                  <td className="p-3 text-right font-semibold">{money(plate * 2)}</td>
                  <td className="p-3 text-right">{money(flag * 2)}</td>
                  <td className="p-3 text-right">{money(s.pair)}</td>
                  <td className="p-3 text-right font-semibold text-[#1f7a3d]">{money(s.pair - plate * 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Your orders</h2>
      <form method="get" className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block text-sm font-semibold">
          From
          <input type="date" name="from" defaultValue={dayString(from)} className="field mt-1" />
        </label>
        <label className="block text-sm font-semibold">
          To
          <input type="date" name="to" defaultValue={dayString(toDay)} className="field mt-1" />
        </label>
        <button type="submit" className="btn btn-white">
          Show
        </button>
      </form>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Materials</p>
          <p className="mt-1 font-display text-3xl font-bold">{money(totalMaterials)}</p>
          <p className="text-sm text-muted">{rows.filter((r) => r.materials > 0).length} orders made</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">You kept</p>
          <p className="mt-1 font-display text-3xl font-bold">{totalKeep === null ? "-" : money(totalKeep)}</p>
          <p className="text-sm text-muted">{moneyError || "After Stripe, refunds and Packlink"}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Profit after materials</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#1f7a3d]">{totalKeep === null ? "-" : money(totalKeep - totalMaterials)}</p>
          <p className="text-sm text-muted">Before ads (see Money)</p>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-muted">No paid orders in these dates.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Paid</th>
                <th className="p-3">Order</th>
                <th className="p-3">Plates</th>
                <th className="p-3 text-right">Materials</th>
                <th className="p-3 text-right">You kept</th>
                <th className="p-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map(({ o, materials, keep, profit }) => (
                <tr key={o.ref}>
                  <td className="p-3 whitespace-nowrap">{day(o.paid_at ?? o.created_at)}</td>
                  <td className="p-3">
                    <a href={`/admin/orders/${o.ref}`} className="font-semibold text-gold underline">
                      {o.ref}
                    </a>
                    <span className="block text-xs text-muted">
                      {o.customer_name}
                      {!REAL.includes(o.status) && ` · ${statusLabels[o.status]}`}
                    </span>
                  </td>
                  <td className="p-3">
                    {o.items.map((i) => (
                      <span key={i.id} className="block">
                        <strong className="whitespace-pre">{i.reg}</strong> {i.qty > 1 && `× ${i.qty}`}{" "}
                        <span className="text-xs text-muted">{describe(i)}</span>
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-right">{money(materials)}</td>
                  <td className="p-3 text-right">{keep === null ? "-" : money(keep)}</td>
                  <td className={`p-3 text-right font-semibold ${profit !== null && profit < 0 ? "text-[#b42318]" : "text-[#1f7a3d]"}`}>
                    {profit === null ? "-" : money(profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Material prices</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        What you pay your suppliers. Changing them only affects orders from the date you choose, so older orders keep the prices you paid
        then.
      </p>
      <div className="mt-4">
        <CostEditor costs={current} labels={costLabels} />
      </div>
      {history.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Price history: {history.map((h) => `from ${day(h.from)}`).join(" · ")}. Before that: the starting prices ({money(Math.round(DEFAULT_COSTS.letter4d * 100))} per 4D letter,{" "}
          {money(Math.round(DEFAULT_COSTS.letterGel * 100))} per gel letter).
        </p>
      )}
    </AdminShell>
  );
}
