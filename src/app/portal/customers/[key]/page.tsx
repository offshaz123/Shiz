import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentClient } from "@/lib/client-auth";
import { pounds } from "@/lib/invoices";
import { loadEverything } from "@/lib/portal-data";
import { buildCustomers, findCustomer, type CustomerEvent } from "@/lib/customers";
import { LoginForm } from "../../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer",
  robots: { index: false, follow: false },
};

/**
 * One person, and everything that has ever happened with them.
 *
 * The whole point is the single list down the middle. Before this, the
 * answer to "what have we done for the Whitfields" meant opening four
 * pages and holding the dates in your head.
 */

const KIND_WORD: Record<CustomerEvent["kind"], string> = {
  enquiry: "Got in touch",
  booking: "Booked in",
  quote: "Quoted",
  invoice: "Invoiced",
};

const KIND_LOOK: Record<CustomerEvent["kind"], string> = {
  enquiry: "border-sky-500/50 text-sky-600 dark:text-sky-400",
  booking: "border-border text-muted",
  quote: "border-amber-500/50 text-amber-600 dark:text-amber-400",
  invoice: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
};

function date(iso: string): string {
  if (!iso) return "No date";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function CustomerPage({ params }: { params: Promise<{ key: string }> }) {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const { key } = await params;
  const { leads, bookings, quotes, invoices } = await loadEverything(client.id);
  const customer = findCustomer(buildCustomers(leads, bookings, quotes, invoices), key);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <Link
        href="/portal/customers"
        className="text-xs font-semibold text-muted hover:text-foreground"
      >
        ‹ All customers
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-4 border-b border-border pb-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-lg font-bold text-muted">
          {customer.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {customer.name}
          </h1>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            {customer.phones.map((phone) => (
              <a key={phone} href={`tel:${phone}`} className="font-medium text-brand-pink">
                {phone}
              </a>
            ))}
            {customer.emails.map((email) => (
              <a key={email} href={`mailto:${email}`} className="font-medium text-brand-pink">
                {email}
              </a>
            ))}
            {customer.phones.length === 0 && customer.emails.length === 0 && (
              <span>No phone or email on file.</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            They have paid
          </p>
          <p className="mt-2 text-xl font-bold leading-none text-foreground sm:text-2xl">
            {pounds(customer.spentPence)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Still owed</p>
          <p
            className={`mt-2 text-xl font-bold leading-none sm:text-2xl ${
              customer.owedPence > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
            }`}
          >
            {pounds(customer.owedPence)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Jobs done</p>
          <p className="mt-2 text-xl font-bold leading-none text-foreground sm:text-2xl">
            {customer.jobs}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/portal/quotes/new"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
        >
          Quote them for something
        </Link>
        <Link
          href="/portal/invoices/new"
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
        >
          Invoice them
        </Link>
      </div>

      <section className="mt-7">
        <h2 className="text-sm font-bold text-foreground">Everything, newest first</h2>

        <ol className="mt-4 flex flex-col gap-2">
          {customer.events.map((event, i) => {
            const row = (
              <>
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      KIND_LOOK[event.kind]
                    }`}
                  >
                    {KIND_WORD[event.kind]}
                  </span>
                  <span className="text-xs text-muted">{date(event.on)}</span>
                  {event.valuePence > 0 && (
                    <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
                      {pounds(event.valuePence)}
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-sm leading-relaxed text-foreground">
                  {event.what}
                </span>
              </>
            );

            return (
              <li
                key={`${event.kind}-${event.on}-${i}`}
                className="rounded-2xl border border-border bg-surface"
              >
                {event.href ? (
                  <Link href={event.href} className="block px-5 py-4 hover:bg-background">
                    {row}
                  </Link>
                ) : (
                  <div className="px-5 py-4">{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
