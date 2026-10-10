import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin, fmtDateTime } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { listCustomers, listOrders, refreshPendingPayments, statusLabels } from "@/lib/orders";
import { isStripeConfigured } from "@/lib/stripe";
import { listAccounts } from "@/lib/orders";
import { money } from "@/lib/plates";
import { cardLine } from "@/lib/emails";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const filters = [
  { id: "active", label: "All orders" },
  { id: "paid", label: "Paid · to make" },
  { id: "in_production", label: "In production" },
  { id: "dispatched", label: "Dispatched" },
  { id: "unpaid", label: "Not paid" },
  { id: "pending", label: "Awaiting payment" },
  { id: "expired", label: "Payment not completed" },
  { id: "all", label: "Everything" },
];

const PAID = ["paid", "in_production", "dispatched"];

export default async function AdminPage(props: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && filters.some((f) => f.id === sp.status) ? sp.status : "active";
  const search = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";

  // Catch any payment whose Stripe message didn't reach us before showing totals.
  if (isStripeConfigured()) await refreshPendingPayments(await listOrders({ status: "pending", limit: 5 }));

  const [orders, everything, customers, accounts] = await Promise.all([
    listOrders({ status: status === "all" ? undefined : status, search }),
    listOrders({ limit: 5000 }),
    listCustomers(),
    listAccounts(),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidOrders = everything.filter((o) => PAID.includes(o.status));
  const revenue = paidOrders.reduce((n, o) => n + (o.amount_paid ?? o.total), 0);
  const monthRevenue = paidOrders.filter((o) => new Date(o.paid_at ?? o.created_at) >= monthStart).reduce((n, o) => n + (o.amount_paid ?? o.total), 0);
  const toMake = everything.filter((o) => o.status === "paid").length;
  const docsOutstanding = everything.filter((o) => PAID.includes(o.status) && o.docs_status === "outstanding").length;
  const notPaid = everything.filter((o) => o.status === "unpaid" || o.status === "pending").length;

  const stats = [
    { label: "Total takings", value: money(revenue), note: `${paidOrders.length} paid orders` },
    { label: "This month", value: money(monthRevenue), note: now.toLocaleString("en-GB", { month: "long" }) },
    { label: "To make", value: String(toMake), note: "Paid, not started" },
    { label: "Documents missing", value: String(docsOutstanding), note: "On paid orders", warn: docsOutstanding > 0 },
    { label: "Not paid", value: String(notPaid), note: "Awaiting payment" },
    { label: "Customers", value: String(customers.length), note: `${accounts.length} with accounts` },
  ];

  return (
    <AdminShell active="orders">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border bg-white p-4 ${s.warn ? "border-[#f1b4a5]" : "border-line"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{s.label}</p>
            <p className={`mt-1 font-display text-3xl font-bold ${s.warn ? "text-[#b42318]" : ""}`}>{s.value}</p>
            <p className="text-xs text-muted">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <Link
              key={f.id}
              href={`/admin?status=${f.id}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                status === f.id ? "bg-ink text-white" : "border border-line bg-white hover:bg-surface-2"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <form className="flex gap-2" action="/admin">
          <input type="hidden" name="status" value={status} />
          <input
            className="field h-10 min-h-0 w-56 py-1 text-sm"
            name="q"
            defaultValue={search}
            placeholder="Search order, name, email, reg"
            aria-label="Search orders"
          />
          <button className="rounded-lg bg-ink px-4 text-sm font-semibold text-white">Search</button>
        </form>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Plates</th>
              <th className="p-3">Status</th>
              <th className="p-3">Documents</th>
              <th className="p-3">Payment</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="p-10 text-center text-muted">
                  No orders here yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.ref} className="hover:bg-surface">
                <td className="whitespace-nowrap p-3 text-muted">{fmtDateTime(o.created_at)}</td>
                <td className="p-3">
                  <Link href={`/admin/orders/${o.ref}`} className="font-bold text-gold underline">
                    {o.ref}
                  </Link>
                </td>
                <td className="p-3">
                  <p className="font-semibold">{o.customer_name}</p>
                  <p className="text-xs text-muted">{o.email}</p>
                </td>
                <td className="p-3">
                  {o.items.map((i, idx) => (
                    <p key={idx} className="whitespace-pre font-mono text-xs">
                      {i.reg}
                      {i.type === "show" ? " (show)" : ""}
                      {i.qty > 1 ? ` ×${i.qty}` : ""}
                    </p>
                  ))}
                </td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className={`p-3 text-xs font-semibold ${o.docs_status === "outstanding" ? "text-[#b42318]" : "text-muted"}`}>
                  {o.docs_status === "outstanding" ? "Missing" : o.docs_status === "received" ? "Received" : "Not needed"}
                </td>
                <td className="p-3 text-xs text-muted">
                  {o.paid_at ? (
                    <>
                      {fmtDateTime(o.paid_at)}
                      <br />
                      {cardLine(o)}
                    </>
                  ) : (
                    statusLabels[o.status]
                  )}
                </td>
                <td className="p-3 text-right font-bold">{money(o.amount_paid ?? o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
