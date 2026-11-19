import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { pounds } from "@/lib/invoices";
import { loadEverything } from "@/lib/portal-data";
import { buildCustomers } from "@/lib/customers";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

/**
 * Everyone they have ever dealt with, newest first.
 *
 * Gathered from the enquiries, the diary, the quotes and the invoices
 * rather than kept as a list of its own. A business that has to fill in
 * a customer record before it is allowed to book a job is a business
 * that stops using the diary.
 */

function ago(iso: string): string {
  if (!iso) return "nothing yet";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  const days = Math.floor((Date.now() - at.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return "over a year ago";
}

export default async function CustomersPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const { leads, bookings, quotes, invoices } = await loadEverything(client.id);
  const customers = buildCustomers(leads, bookings, quotes, invoices);

  const spent = customers.reduce((sum, customer) => sum + customer.spentPence, 0);
  const owed = customers.reduce((sum, customer) => sum + customer.owedPence, 0);
  const returning = customers.filter((customer) => customer.jobs > 1).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Customers</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Everyone who has been in touch, booked in, been quoted or been invoiced — and everything
        you have ever done with them.
      </p>

      {customers.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">People</p>
            <p className="mt-2 text-xl font-bold leading-none text-foreground sm:text-2xl">
              {customers.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Been back
            </p>
            <p className="mt-2 text-xl font-bold leading-none text-foreground sm:text-2xl">
              {returning}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              More than one job done
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Taken, all time
            </p>
            <p className="mt-2 text-xl font-bold leading-none text-foreground sm:text-2xl">
              {pounds(spent)}
            </p>
            {owed > 0 && (
              <p className="mt-1.5 text-[11px] leading-snug text-muted">
                {pounds(owed)} still owed
              </p>
            )}
          </div>
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-border bg-surface">
        {customers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            Nobody yet. Everyone who gets in touch, gets booked in, gets quoted or gets invoiced
            turns up here by themselves.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {customers.map((customer) => (
              <li key={customer.key}>
                <Link
                  href={`/portal/customers/${customer.key}`}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-background"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-sm font-bold text-muted">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {customer.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {customer.jobs > 0 && `${customer.jobs} job${customer.jobs === 1 ? "" : "s"} · `}
                      {customer.events.length} thing
                      {customer.events.length === 1 ? "" : "s"} · {ago(customer.lastOn)}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {customer.spentPence > 0 && (
                      <span className="block text-sm font-bold tabular-nums text-foreground">
                        {pounds(customer.spentPence)}
                      </span>
                    )}
                    {customer.owedPence > 0 && (
                      <span className="block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                        {pounds(customer.owedPence)} owed
                      </span>
                    )}
                  </span>
                  <span aria-hidden className="shrink-0 text-muted">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        People are filed by name, so “J Whitfield” and “Mrs Whitfield” count as two. That is
        deliberate — merging two people who are not the same person cannot be undone, and
        spelling a name the same way twice can.
      </p>
    </div>
  );
}
