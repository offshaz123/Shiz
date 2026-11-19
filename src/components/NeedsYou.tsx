import Link from "next/link";
import { pounds } from "@/lib/invoice-maths";
import type { Column } from "@/lib/opportunities";

/**
 * The three things most worth doing, on the page they land on.
 *
 * All of this already exists on Money on the table, but that is a page
 * somebody has to think to open. This is the screen they get when they
 * sign in, so the thing worth doing turns up whether they went looking
 * for it or not — which is the entire difference between a dashboard
 * they glance at and one they act on.
 *
 * Three, not everything. A box with eleven jobs in it is a box that gets
 * scrolled past, and the full list is one tap away for anybody who wants
 * it. Ranked by money at stake, because that is the order somebody would
 * pick them up in anyway.
 *
 * It renders nothing at all when there is nothing to do. A panel that is
 * always there, saying "all clear" every day, teaches you to stop reading
 * it — and then it is still being ignored on the morning it matters.
 */

/** What to call it, and how urgently, per column. */
const WORDING: Record<
  string,
  { verb: string; tone: "urgent" | "warm" | "plain" }
> = {
  unanswered: { verb: "is waiting on a reply", tone: "urgent" },
  "not-invoiced": { verb: "has not been billed", tone: "warm" },
  "quote-expired": { verb: "— the price has run out", tone: "warm" },
  "gone-cold": { verb: "went quiet after a price", tone: "warm" },
  "quote-waiting": { verb: "has a quote sitting with them", tone: "plain" },
};

const TONE: Record<string, string> = {
  urgent: "text-red-600 dark:text-red-400",
  warm: "text-amber-600 dark:text-amber-400",
  plain: "text-muted",
};

function ago(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "since yesterday";
  if (days < 14) return `for ${days} days`;
  if (days < 60) return `for ${Math.floor(days / 7)} weeks`;
  return `for ${Math.floor(days / 30)} months`;
}

export function NeedsYou({ columns }: { columns: Column[] }) {
  const jobs = columns
    .flatMap((column) =>
      column.chances.map((chance) => ({ chance, column: column.key as string })),
    )
    // Money first, then whatever has been sitting longest. A £900 quote
    // from Tuesday is worth picking up before a £90 one from March.
    .sort(
      (a, b) =>
        b.chance.valuePence - a.chance.valuePence || b.chance.days - a.chance.days,
    )
    .slice(0, 3);

  if (jobs.length === 0) return null;

  const total = columns.reduce((sum, column) => sum + column.totalPence, 0);
  const count = columns.reduce((n, column) => n + column.chances.length, 0);

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-bold text-foreground">Worth doing today</h2>
        {total > 0 && (
          <p className="text-xs text-muted">
            {pounds(total)} sitting there across {count} thing{count === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-2.5">
        {jobs.map(({ chance, column }) => {
          const wording = WORDING[column] ?? { verb: "needs a look", tone: "plain" };
          return (
            <li key={chance.id}>
              <Link
                href={chance.href ?? "/portal/opportunities"}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-xl border border-border bg-background px-4 py-3 transition hover:border-border/60"
              >
                <span className="text-sm font-semibold text-foreground">{chance.who}</span>
                <span className={`text-xs ${TONE[wording.tone]}`}>
                  {wording.verb} {ago(chance.days)}
                </span>
                {chance.valuePence > 0 && (
                  <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
                    {pounds(chance.valuePence)}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {count > jobs.length && (
        <Link
          href="/portal/opportunities"
          className="mt-3 inline-block text-xs font-semibold text-brand-pink hover:underline"
        >
          See the other {count - jobs.length} →
        </Link>
      )}
    </section>
  );
}
