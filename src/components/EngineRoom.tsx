import Link from "next/link";
import type { EngineRoom as Engine, Day, Station, Step } from "@/lib/engine-room";
import { EngineLive } from "./EngineLive";
import { StatTiles } from "./StatTiles";

/**
 * The overview dashboard: what the machinery is doing, and what it has done.
 *
 * This replaced a version with six cartoon robots on it, one per job, on
 * saturated gradient cards inside a dark navy panel that ignored the site's
 * own light and dark themes. Walid's word for it was "weird", and he was
 * right for a reason worth writing down: thick saturated blocks and six
 * competing hues read as loud and faintly childish, and every one of those
 * six hues was carrying a story that was actually a single number. A stat
 * tile shows one number better than a decorated card does.
 *
 * None of the data changed. Every figure here is still counted from the
 * database, nothing is estimated, and a part of the pipeline that cannot be
 * measured still shows no number rather than a plausible one.
 *
 * What changed is the presentation: site tokens so it follows the theme,
 * thin marks, hairline rules, two chart colours instead of six, and a table
 * under each chart so no value is reachable only by colour or only by hover.
 */

/**
 * One way of writing a number on this page.
 *
 * The stat tiles arrive pre-formatted from the lib and read "1,284" while
 * the jobs list and the funnel were printing the raw count as "1284". Two
 * spellings of the same figure on one screen makes a reader check whether
 * they are the same figure.
 */
const count = (n: number) => n.toLocaleString("en-GB");

/* ---------------------------------------------------------------- jobs --- */

/**
 * The six jobs, as a list rather than a row of characters.
 *
 * Status is a dot and a word, never the dot alone: colour on its own is not
 * a state anybody can read if they cannot see the colour.
 */
function Jobs({ stations }: { stations: Station[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">The jobs</h2>
        <p className="mt-0.5 text-xs text-muted">
          Six of them share the work. Every number is counted, not estimated.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {stations.map((station) => {
          const row = (
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      station.live ? "bg-emerald-500" : "bg-muted/50"
                    }`}
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {station.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      station.live ? "text-emerald-600 dark:text-emerald-400" : "text-muted"
                    }`}
                  >
                    {station.live ? "working" : "idle"}
                  </span>
                </div>
                <p className="mt-0.5 pl-4 text-xs leading-snug text-muted">{station.does}</p>
              </div>
              <div className="pl-4 text-right">
                <span className="text-base font-bold tabular-nums text-foreground">
                  {count(station.value)}
                </span>
                <span className="ml-1.5 text-xs text-muted">{station.unit}</span>
                <p className="mt-0.5 text-[11px] text-muted">{station.state}</p>
              </div>
            </div>
          );

          return (
            <li key={station.id}>
              {station.href ? (
                <Link href={station.href} className="block hover:bg-background">
                  {row}
                </Link>
              ) : (
                row
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* -------------------------------------------------------------- funnel --- */

/**
 * Where every business gets to.
 *
 * Ordered steps of one measure, so one series and therefore one colour for
 * every bar. Shading each bar by its own size would burn the only free
 * channel on information the bar's length already carries.
 *
 * The number and the percentage are written out beside each bar, so the
 * chart is readable with the colour ignored entirely.
 */
function Funnel({ funnel }: { funnel: Step[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Where every business gets to</h2>
      <p className="mt-0.5 text-xs text-muted">
        Each line counts businesses, not emails, as a share of everything ever found.
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {funnel.map((step) => {
          const pct = step.of > 0 ? (step.value / step.of) * 100 : 0;
          return (
            <li key={step.label} className="flex items-center gap-3" title={step.note}>
              <span className="w-32 shrink-0 text-xs text-muted sm:w-40">{step.label}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                <span
                  className="block h-full rounded-full bg-series-1"
                  style={{ width: `${Math.max(pct, step.value > 0 ? 1.5 : 0)}%` }}
                />
              </span>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted">
                <b className="font-semibold text-foreground">{count(step.value)}</b>
                {step.of > 0 && <span className="ml-1">{Math.round(pct * 10) / 10}%</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* --------------------------------------------------------- emails/day --- */

/**
 * Emails sent per day over the last fortnight.
 *
 * Two series stacked, so the pair needs to stay apart under colour-blindness
 * as well as for everybody else. Blue and orange, validated against both
 * surfaces rather than chosen by eye.
 *
 * Three things make it readable without the colour: a legend that is always
 * present, a 2px gap of surface between the two segments rather than a
 * border drawn round them, and the table underneath, which is the same data
 * in text. Only the busiest day is labelled directly — a number over every
 * bar is noise and goes unread.
 */
function EmailsPerDay({ days }: { days: Day[] }) {
  const busiest = Math.max(1, ...days.map((d) => d.first + d.followUp));
  const peak = days.reduce(
    (best, day) => (day.first + day.followUp > best.first + best.followUp ? day : best),
    days[0],
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-foreground">Emails sent per day</h2>
        <div className="flex items-center gap-3 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-sm bg-series-1" />
            First emails
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-sm bg-series-2" />
            Follow-ups
          </span>
        </div>
      </div>
      <p className="mt-0.5 text-xs text-muted">Last fourteen days.</p>

      {days.length === 0 ? (
        <p className="mt-6 text-xs text-muted">Nothing sent in the last fortnight.</p>
      ) : (
        <>
          {/* Height covers the plot and the date band under it, so the card
              never grows a tiny nested scrollbar to reach the labels. */}
          <div className="mt-4 flex items-end gap-1.5">
            {days.map((day) => {
              const total = day.first + day.followUp;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold tabular-nums text-foreground">
                    {day.date === peak?.date && total > 0 ? total : " "}
                  </span>
                  <div
                    className="flex h-24 w-full flex-col justify-end"
                    title={`${day.date}: ${day.first} first, ${day.followUp} follow-up`}
                  >
                    {day.followUp > 0 && (
                      <span
                        className="w-full rounded-t bg-series-2"
                        style={{ height: `${(day.followUp / busiest) * 100}%` }}
                      />
                    )}
                    {/* The gap is surface showing through, not a border drawn
                        around the marks. Only when both segments exist. */}
                    {day.followUp > 0 && day.first > 0 && <span className="h-0.5 w-full" />}
                    {day.first > 0 && (
                      <span
                        className={`w-full bg-series-1 ${day.followUp > 0 ? "" : "rounded-t"}`}
                        style={{ height: `${(day.first / busiest) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="text-[9px] tabular-nums text-muted">{day.date.slice(8)}</span>
                </div>
              );
            })}
          </div>

          {/* The table twin. Every value above is reachable as text, so
              nothing on this chart depends on seeing a colour or on
              managing to hover the right two-pixel bar. */}
          <details className="mt-4 border-t border-border pt-3">
            <summary className="cursor-pointer text-xs font-medium text-muted hover:text-foreground">
              Show as a table
            </summary>
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="text-muted">
                  <th scope="col" className="py-1 font-medium">Day</th>
                  <th scope="col" className="py-1 text-right font-medium">First</th>
                  <th scope="col" className="py-1 text-right font-medium">Follow-ups</th>
                  <th scope="col" className="py-1 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {days.map((day) => (
                  <tr key={day.date}>
                    <td className="py-1.5 tabular-nums text-foreground">{day.date}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted">{day.first}</td>
                    <td className="py-1.5 text-right tabular-nums text-muted">{day.followUp}</td>
                    <td className="py-1.5 text-right font-semibold tabular-nums text-foreground">
                      {day.first + day.followUp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------- all --- */

export function EngineRoom({ engine }: { engine: Engine }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            engine.running
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${
              engine.running ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          {engine.running ? "Running" : "Needs attention"}
        </span>
        <EngineLive />
      </div>

      {engine.halted && (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-2.5 text-xs font-medium text-foreground">
          {engine.halted}
        </p>
      )}

      <StatTiles tiles={engine.tiles} />

      <Jobs stations={engine.stations} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Funnel funnel={engine.funnel} />
        <EmailsPerDay days={engine.days} />
      </div>
    </div>
  );
}
