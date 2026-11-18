import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { listInvoices, pounds } from "@/lib/invoices";
import { QUOTE_WORD, quoteState } from "@/lib/document-kinds";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quotes",
  robots: { index: false, follow: false },
};

/**
 * Prices given out, and what came of them.
 *
 * The tiles are the only three numbers worth having here: what is still
 * sitting with somebody, what has been said yes to, and how often yes is
 * the answer. That last one is the figure that tells somebody whether
 * their prices are right, and nothing else on the site can answer it.
 */

const STATE_LOOK: Record<string, string> = {
  draft: "border-border text-muted",
  sent: "border-sky-500/50 text-sky-600 dark:text-sky-400",
  accepted: "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
  declined: "border-border text-muted",
  expired: "border-amber-500/50 text-amber-600 dark:text-amber-400",
};

function date(iso: string): string {
  if (!iso) return "—";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function QuotesPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const quotes = (await listInvoices(client.id, "quote")) ?? [];
  const states = quotes.map((q) => ({ quote: q, state: quoteState(q.status, q.validUntil) }));

  const waiting = states
    .filter((s) => s.state === "sent")
    .reduce((sum, s) => sum + s.quote.totalPence, 0);
  const won = states
    .filter((s) => s.state === "accepted")
    .reduce((sum, s) => sum + s.quote.totalPence, 0);

  // Only out of the ones that got an answer. Counting quotes still sitting
  // with somebody as losses would make every busy week look like a bad one.
  const answered = states.filter(
    (s) => s.state === "accepted" || s.state === "declined" || s.state === "expired",
  ).length;
  const accepted = states.filter((s) => s.state === "accepted").length;
  const winRate = answered > 0 ? Math.round((accepted / answered) * 100) : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Quotes</h1>
          <p className="mt-1.5 text-sm text-muted">
            Price a job up, send it over, and turn a yes into an invoice in one tap.
          </p>
        </div>
        <Link
          href="/portal/quotes/new"
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          New quote
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Out with customers
          </p>
          <p className="mt-2 text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
            {pounds(waiting)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Said yes</p>
          <p className="mt-2 text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
            {pounds(won)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            You win
          </p>
          <p className="mt-2 text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
            {winRate === null ? "—" : `${winRate}%`}
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-muted">
            {winRate === null ? "Nothing answered yet" : `of the ${answered} answered`}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-surface">
        {states.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No quotes yet.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
              Price a job up and email it over. It is the only thing in writing before the work
              starts, which is what stops the argument about what was agreed.
            </p>
          </div>
        ) : (
          <>
            <table className="hidden w-full text-left text-sm sm:table">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted">
                  <th scope="col" className="px-5 py-3 font-semibold">No.</th>
                  <th scope="col" className="py-3 font-semibold">Customer</th>
                  <th scope="col" className="py-3 font-semibold">Given</th>
                  <th scope="col" className="py-3 font-semibold">Holds until</th>
                  <th scope="col" className="py-3 text-right font-semibold">Total</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Where it is</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {states.map(({ quote, state }) => (
                  <tr key={quote.id} className="transition hover:bg-background">
                    <td className="px-5 py-3.5 tabular-nums text-muted">
                      <Link href={`/portal/quotes/${quote.id}`} className="block">
                        {String(quote.number).padStart(4, "0")}
                      </Link>
                    </td>
                    <td className="py-3.5 font-medium text-foreground">
                      <Link href={`/portal/quotes/${quote.id}`} className="block">
                        {quote.customerName}
                      </Link>
                    </td>
                    <td className="py-3.5 text-xs text-muted">{date(quote.issuedOn)}</td>
                    <td
                      className={`py-3.5 text-xs ${
                        state === "expired"
                          ? "font-semibold text-amber-600 dark:text-amber-400"
                          : "text-muted"
                      }`}
                    >
                      {date(quote.validUntil)}
                    </td>
                    <td className="py-3.5 text-right font-semibold tabular-nums text-foreground">
                      {pounds(quote.totalPence)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATE_LOOK[state]}`}
                      >
                        {QUOTE_WORD[state]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-border sm:hidden">
              {states.map(({ quote, state }) => (
                <li key={quote.id}>
                  <Link href={`/portal/quotes/${quote.id}`} className="block px-5 py-4">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {quote.customerName}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {pounds(quote.totalPence)}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATE_LOOK[state]}`}
                      >
                        {QUOTE_WORD[state]}
                      </span>
                      <span className="text-xs text-muted">
                        No. {String(quote.number).padStart(4, "0")} · {date(quote.issuedOn)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
