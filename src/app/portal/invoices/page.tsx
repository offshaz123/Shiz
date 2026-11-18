import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { listInvoices, pounds } from "@/lib/invoices";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false, follow: false },
};

/**
 * Everything they have invoiced, and what has come back.
 *
 * A table on a wide screen and a card per row on a phone — the same rows
 * either way. A table squeezed onto a phone becomes four columns of two
 * characters each, and the column somebody needs is always the one that got
 * squeezed.
 *
 * Overdue is worked out here rather than stored. A date passing is not an
 * event anything fires on, so a stored "overdue" flag would be wrong from
 * the moment it was written until something came along to correct it.
 */

const STATUS_LOOK: Record<string, string> = {
  draft: "border-border text-muted",
  sent: "border-sky-500/50 text-sky-600 dark:text-sky-400",
  paid: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
  cancelled: "border-border text-muted line-through",
};

const STATUS_WORD: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  cancelled: "Cancelled",
};

function date(iso: string): string {
  if (!iso) return "—";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dueOn: string, status: string): boolean {
  if (status !== "sent" || !dueOn) return false;
  return new Date(`${dueOn}T23:59:59`).getTime() < Date.now();
}

export default async function InvoicesPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const invoices = (await listInvoices(client.id)) ?? [];

  const outstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + i.totalPence, 0);
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.totalPence, 0);
  const overdue = invoices
    .filter((i) => isOverdue(i.dueOn, i.status))
    .reduce((sum, i) => sum + i.totalPence, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Invoices
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Bill your customers, email it to them, and see what has come back.
          </p>
        </div>
        <Link
          href="/portal/invoices/new"
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          New invoice
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Waiting to be paid", value: outstanding, tone: "" },
          {
            label: "Overdue",
            value: overdue,
            tone: overdue > 0 ? "text-amber-600 dark:text-amber-400" : "",
          },
          { label: "Paid, all time", value: paid, tone: "" },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {tile.label}
            </p>
            <p
              className={`mt-2 text-xl font-bold leading-none tracking-tight sm:text-2xl ${
                tile.tone || "text-foreground"
              }`}
            >
              {pounds(tile.value)}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface">
        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No invoices yet.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
              Put your business details in first — your address and how you want to be paid — and
              every invoice after that is three boxes and a button.
            </p>
            <Link
              href="/portal/business"
              className="mt-4 inline-block rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
            >
              Your business details
            </Link>
          </div>
        ) : (
          <>
            {/* The table, from sm up. */}
            <table className="hidden w-full text-left text-sm sm:table">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th scope="col" className="px-5 py-3 font-semibold">No.</th>
                  <th scope="col" className="py-3 font-semibold">Customer</th>
                  <th scope="col" className="py-3 font-semibold">Issued</th>
                  <th scope="col" className="py-3 font-semibold">Due</th>
                  <th scope="col" className="py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((invoice) => {
                  const late = isOverdue(invoice.dueOn, invoice.status);
                  return (
                    <tr key={invoice.id} className="transition hover:bg-background">
                      <td className="px-5 py-3.5 tabular-nums text-muted">
                        <Link href={`/portal/invoices/${invoice.id}`} className="block">
                          {String(invoice.number).padStart(4, "0")}
                        </Link>
                      </td>
                      <td className="py-3.5 font-medium text-foreground">
                        <Link href={`/portal/invoices/${invoice.id}`} className="block">
                          {invoice.customerName}
                        </Link>
                      </td>
                      <td className="py-3.5 text-xs text-muted">{date(invoice.issuedOn)}</td>
                      <td
                        className={`py-3.5 text-xs ${
                          late ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted"
                        }`}
                      >
                        {date(invoice.dueOn)}
                        {late && " — overdue"}
                      </td>
                      <td className="py-3.5 text-right font-semibold tabular-nums text-foreground">
                        {pounds(invoice.totalPence)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                            STATUS_LOOK[invoice.status]
                          }`}
                        >
                          {STATUS_WORD[invoice.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* The same rows as cards, on a phone. */}
            <ul className="divide-y divide-border sm:hidden">
              {invoices.map((invoice) => {
                const late = isOverdue(invoice.dueOn, invoice.status);
                return (
                  <li key={invoice.id}>
                    <Link href={`/portal/invoices/${invoice.id}`} className="block px-5 py-4">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          {invoice.customerName}
                        </span>
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {pounds(invoice.totalPence)}
                        </span>
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            STATUS_LOOK[invoice.status]
                          }`}
                        >
                          {STATUS_WORD[invoice.status]}
                        </span>
                        <span
                          className={`text-xs ${
                            late ? "font-semibold text-amber-600 dark:text-amber-400" : "text-muted"
                          }`}
                        >
                          No. {String(invoice.number).padStart(4, "0")} ·{" "}
                          {late ? "overdue" : date(invoice.issuedOn)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
