import type { CallScript as Script } from "@/lib/call-script";

/**
 * The script, laid out to be read while a phone is ringing.
 *
 * Which is the whole design constraint. Nobody studies this page; they
 * glance at it with a handset against their ear, so the words to say are
 * large and in the reading colour, and the reasoning behind them is small
 * and grey and can be ignored entirely on the third call.
 *
 * The objections are a table rather than prose because that is how they
 * arrive: they say a thing, you need the answer to it, and hunting for it
 * in a paragraph while somebody waits is how you end up improvising.
 */
export function CallScript({ script }: { script: Script }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">What to say</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Why this one is on the list: {script.reason}
      </p>

      <ol className="mt-5 flex flex-col gap-5">
        {script.sections.map((section, i) => (
          <li key={section.heading} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-semibold tabular-nums text-muted">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                {section.heading}
              </h3>
              {section.say && (
                <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">
                  &ldquo;{section.say}&rdquo;
                </p>
              )}
              {section.note && (
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{section.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          When they push back
        </h3>
        <dl className="mt-3 flex flex-col gap-3.5">
          {script.objections.map((objection) => (
            <div key={objection.they}>
              <dt className="text-xs font-medium text-muted">
                They say: &ldquo;{objection.they}&rdquo;
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-foreground">
                &ldquo;{objection.you}&rdquo;
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="mt-5 rounded-xl border border-border bg-background px-4 py-3 text-xs leading-relaxed text-muted">
        The one rule underneath all of it: after you ask the question in step 3, stop talking.
        A call where only you speak is a presentation, and people hang up on presentations.
        Whatever they say back is the call.
      </p>
    </section>
  );
}
