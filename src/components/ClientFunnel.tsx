import type { FunnelStep } from "@/lib/clients";

/**
 * Where enquiries fall out.
 *
 * The board says where everything is; this says where it stops. They are
 * different questions and the second one is the one worth having on a
 * monthly call: a hundred enquiries becoming thirty answered is not an
 * advertising problem, it is a telephone problem, and no amount of extra
 * budget fixes it.
 *
 * The percentage between rungs is the whole point, so it is the thing set
 * in the reading colour while the bars stay recessive. A funnel drawn as
 * four pretty bars with no drop-off figures is decoration.
 *
 * Bars are widths of the first rung rather than of the widest, because the
 * first rung is the total and every later one is a share of it. Drawing
 * each against the biggest would make a bad month look identical to a good
 * one.
 */
export function ClientFunnel({ funnel }: { funnel: FunnelStep[] }) {
  const total = funnel[0]?.reached ?? 0;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Where enquiries get to</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-muted">
        How many made it to each stage, and how many fell away in between.
      </p>

      {total === 0 ? (
        <p className="mt-5 text-sm text-muted">No enquiries this month yet.</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-1">
          {funnel.map((step, i) => {
            const share = total > 0 ? (step.reached / total) * 100 : 0;
            // Both percentages on this card are rounded the same way. The
            // share of the total and the carried-on figure are the same
            // number on the second rung, and showing one as 88% beside the
            // other as 87.5% reads as an arithmetic mistake.
            const carried =
              step.fromPrevious === null ? null : Math.round(step.fromPrevious);
            // A big fall is the thing to notice, so it is said in words
            // rather than left to be worked out from two percentages. The
            // test is on the rounded figure so the words and the number
            // never disagree at the boundary.
            const poor = carried !== null && carried < 50;

            return (
              <li key={step.stage}>
                {i > 0 && (
                  <div className="flex items-center gap-2 py-1 pl-1">
                    <span className="text-muted" aria-hidden>
                      ↓
                    </span>
                    <span
                      className={`text-[11px] font-semibold tabular-nums ${
                        poor ? "text-amber-600 dark:text-amber-400" : "text-muted"
                      }`}
                    >
                      {carried}% carried on
                    </span>
                    {poor && (
                      <span className="text-[11px] text-muted">
                        — over half are lost here
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted">{step.label}</span>
                  <span className="h-7 flex-1 overflow-hidden rounded-lg bg-background">
                    <span
                      className="flex h-full items-center rounded-lg bg-series-1 px-2"
                      style={{ width: `${Math.max(share, step.reached > 0 ? 8 : 0)}%` }}
                    >
                      <span className="text-xs font-bold tabular-nums text-white">
                        {step.reached}
                      </span>
                    </span>
                  </span>
                  <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted">
                    {Math.round(share)}%
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
