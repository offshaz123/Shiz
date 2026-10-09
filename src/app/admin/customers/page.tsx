import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin, fmtDateTime } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { listAccounts, listCustomers } from "@/lib/orders";
import { money } from "@/lib/plates";

export const metadata: Metadata = { title: "Customers", robots: { index: false } };

export default async function AdminCustomersPage() {
  await requireAdmin();
  const [customers, accounts] = await Promise.all([listCustomers(), listAccounts()]);

  return (
    <AdminShell active="customers">
      <h2 className="font-display text-2xl font-bold">Customers who ordered ({customers.length})</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Paid orders</th>
              <th className="p-3">Total spent</th>
              <th className="p-3">First order</th>
              <th className="p-3">Last order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.email}>
                <td className="p-3">
                  <Link href={`/admin?status=all&q=${encodeURIComponent(c.email)}`} className="font-semibold text-gold underline">
                    {c.name}
                  </Link>
                  <p className="text-xs text-muted">
                    {c.email}
                    {Number(c.has_account) ? " · has account" : ""}
                  </p>
                </td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{Number(c.orders)}</td>
                <td className="p-3">{Number(c.paid_orders)}</td>
                <td className="p-3 font-bold">{money(Number(c.spent))}</td>
                <td className="p-3 text-muted">{fmtDateTime(c.first_order)}</td>
                <td className="p-3 text-muted">{fmtDateTime(c.last_order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl font-bold">Registered accounts ({accounts.length})</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2/60 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {accounts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted">
                  Nobody has signed up yet.
                </td>
              </tr>
            )}
            {accounts.map((a) => (
              <tr key={a.id}>
                <td className="p-3 font-semibold">{a.name}</td>
                <td className="p-3">{a.email}</td>
                <td className="p-3">{a.phone}</td>
                <td className="p-3">{Number(a.orders)}</td>
                <td className="p-3 text-muted">{fmtDateTime(a.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
