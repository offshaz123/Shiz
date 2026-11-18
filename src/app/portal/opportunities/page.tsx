import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { getAdminClient, getClientSummary, listClientLeads } from "@/lib/clients";
import { listBookingsBetween } from "@/lib/bookings";
import { listInvoices, pounds } from "@/lib/invoices";
import { chances, forecast, gaps, tips } from "@/lib/opportunities";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Money on the table",
  robots: { index: false, follow: false },
};

/**
 * What is sitting there waiting to be picked up, and what to do next.
 *
 * Every figure is counted from their own rows and priced at what they
 * themselves said a job is worth. Nothing on this page is an industry
 * average, a benchmark or an estimate, because the moment somebody
 * catches it inventing a number they stop believing the rest of the site.
 *
 * It does not show missed calls, which is the obvious thing to want here.
 * Nothing in this system touches a phone line, so nothing here pretends
 * to. The honest version of the same idea is the first column: people who
 * got in touch and are still waiting.
 */

const COLUMN_LOOK: Record<string, string> = {
  unanswered: "border-red-500/40",
  "quote-waiting": "border-sky-500/40",
  "gone-cold": "border-amber-500/40",
  "quote-expired": "border-amber-500/40",
  "not-invoiced": "border-emerald-500/40",
};

function ago(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days`;
  if (days < 60) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

export default async function OpportunitiesPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  // Two months back and a fortnight forward covers every job that could
  // plausibly be finished and unbilled, without reading the whole diary.
  const today = new Date();
  const day = (shift: number) =>
    new Date(today.getTime() + shift * 86_400_000).toISOString().slice(0, 10);

  const [summary, leads, quotes, invoices, bookings, admin] = await Promise.all([
    getClientSummary(client.id),
    listClientLeads(client.id),
    listInvoices(client.id, "quote"),
    listInvoices(client.id, "invoice"),
    listBookingsBetween(client.id, day(-60), day(14)),
    getAdminClient(client.slug),
  ]);

  const columns = chances(
    leads ?? [],
    quotes ?? [],
    bookings ?? [],
    invoices ?? [],
    admin?.defaultLeadValue ?? null,
  );

  const advice = summary
    ? tips(summary, columns, {
        autoReplyOn: admin?.autoReplyOn ?? false,
        reviewRequestsOn: admin?.reviewRequestsOn ?? false,
        hasReviewLink: Boolean(admin?.reviewLink),
        hasLogo: Boolean(admin?.logoUrl),
        hasAddress: true,
        quotesEverSent: quotes?.length ?? 0,
        defaultLeadValue: admin?.defaultLeadValue ?? null,
      })
    : [];

  const onTheTable = columns.reduce((sum, column) => sum + column.totalPence, 0);
  const waitingCount = columns.reduce((n, column) => n + column.chances.length, 0);
  const outlook = summary ? forecast(summary, columns, leads ?? []) : null;
  const missing = gaps(leads ?? [], bookings ?? [], quotes ?? [], admin?.defaultLeadValue ?? null);

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Money on the table
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Everything sitting there waiting to be picked up, priced at what you said a job is worth.
      </p>

      {waitingCount > 0 && outlook && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Sitting there right now
            </p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-foreground sm:text-3xl">
              {onTheTable > 0 ? pounds(onTheTable) : `${waitingCount} to chase`}
            </p>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              Across {waitingCount} {waitingCount === 1 ? "thing" : "things"}. Not a forecast —
              these are people who have already been in touch.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Likely to land
            </p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-foreground sm:text-3xl">
              {outlook.likelyPence === null ? "—" : pounds(outlook.likelyPence)}
            </p>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              {outlook.winRate === null
                ? `Needs a few more jobs won or lost before this means anything — ${outlook.decided} so far.`
                : `You win ${outlook.winRate}% of the ${outlook.decided} that got an answer, so that much of what is open above. A sum, not a promise.`}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Won this month
            </p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-tight text-foreground sm:text-3xl">
              {pounds(outlook.wonThisMonthPence)}
            </p>
            <p className="mt-2.5 text-[11px] leading-relaxed text-muted">
              Already in the bag. This is the one that is not a guess.
            </p>
          </div>
        </div>
      )}

      {advice.length > 0 && (
        <section className="mt-7">
          <h2 className="text-sm font-bold text-foreground">What to do next</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Worked out from your own figures. Every one says the number it came from.
          </p>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {advice.map((tip) => (
              <div
                key={tip.id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{tip.title}</h3>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      tip.cost === "free"
                        ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                        : "border-border text-muted"
                    }`}
                  >
                    {tip.cost === "free" ? "Free" : "Costs money"}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">{tip.body}</p>
                {tip.action && (
                  <Link
                    href={tip.action.href}
                    className="mt-3 self-start text-xs font-semibold text-brand-pink hover:underline"
                  >
                    {tip.action.label} →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-bold text-foreground">Where it is sitting</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Swipe across. Empty columns are a good sign.
        </p>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {columns.map((column) => (
            <div
              key={column.key}
              className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-surface ${
                column.chances.length > 0 ? COLUMN_LOOK[column.key] : "border-border"
              }`}
            >
              <div className="border-b border-border px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                  <span className="text-xs font-bold tabular-nums text-muted">
                    {column.chances.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{column.note}</p>
                {column.totalPence > 0 && (
                  <p className="mt-2 text-base font-bold tabular-nums text-foreground">
                    {pounds(column.totalPence)}
                  </p>
                )}
              </div>

              {column.chances.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted">Nothing here.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {column.chances.slice(0, 12).map((chance) => (
                    <li key={chance.id}>
                      {chance.href ? (
                        <Link href={chance.href} className="block px-4 py-3 hover:bg-background">
                          <Card chance={chance} />
                        </Link>
                      ) : (
                        <div className="px-4 py-3">
                          <Card chance={chance} />
                        </div>
                      )}
                    </li>
                  ))}
                  {column.chances.length > 12 && (
                    <li className="px-4 py-3 text-[11px] text-muted">
                      and {column.chances.length - 12} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {missing.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-foreground">Make these numbers better</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Each of these is dragging a figure on this page down right now.
          </p>

          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {missing.map((gap) => (
              <li key={gap.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{gap.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{gap.why}</p>
                </div>
                <Link
                  href={gap.href}
                  className="shrink-0 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
                >
                  Fix it
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-7 text-xs leading-relaxed text-muted">
        Missed calls are not on here. Nothing in this system touches your phone line, so it
        would only be guessing — the first column is the same idea for the enquiries that do
        come through us. If you want calls tracked properly, that needs a tracking number and
        it is worth a conversation.
      </p>
    </div>
  );
}

function Card({ chance }: { chance: { who: string; what: string; valuePence: number; days: number } }) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-semibold text-foreground">{chance.who}</span>
        {chance.valuePence > 0 && (
          <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">
            {pounds(chance.valuePence)}
          </span>
        )}
      </span>
      <span className="mt-0.5 block truncate text-[11px] text-muted">{chance.what}</span>
      <span className="mt-0.5 block text-[11px] text-muted">{ago(chance.days)}</span>
    </>
  );
}
