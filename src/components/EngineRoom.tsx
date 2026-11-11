import Link from "next/link";
import type { EngineRoom as Engine, Station } from "@/lib/engine-room";
import { EngineLive } from "./EngineLive";

/**
 * The board: what the machinery is doing, as a picture.
 *
 * It exists because the work is invisible. The scanner runs in a batch, the
 * follow-ups go out at six in the morning, the inbox is read by a cron job —
 * and from the admin page all of that looked like a list of businesses that
 * occasionally changed. Somebody new would have no idea anything was
 * happening at all.
 *
 * Every number on it is counted from the database. There are no estimates,
 * no targets dressed as results, and nothing is shown for a part of the
 * pipeline that cannot be measured. A board that flatters itself is worse
 * than no board, because you stop checking the thing it is lying about.
 */

/** One robot, drawn rather than fetched: a sprite per station would be six
 *  more requests for something that is six rounded rectangles. */
function Bot({ tone, asleep }: { tone: string; asleep: boolean }) {
  return (
    <svg viewBox="0 0 48 52" className="h-11 w-11" aria-hidden="true">
      <line x1="24" y1="2" x2="24" y2="9" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="3" r="3" fill={tone} />
      <rect x="6" y="9" width="36" height="26" rx="9" fill={tone} opacity={asleep ? 0.45 : 1} />
      <rect x="13" y="18" width="22" height="9" rx="4.5" fill="#0b1020" />
      <circle cx="19" cy="22.5" r="2.6" fill={asleep ? "#64748b" : "#e2e8f0"} />
      <circle cx="29" cy="22.5" r="2.6" fill={asleep ? "#64748b" : "#e2e8f0"} />
      <rect x="11" y="37" width="26" height="11" rx="4" fill={tone} opacity={asleep ? 0.3 : 0.75} />
      <rect x="2" y="15" width="4" height="13" rx="2" fill={tone} opacity={asleep ? 0.3 : 0.7} />
      <rect x="42" y="15" width="4" height="13" rx="2" fill={tone} opacity={asleep ? 0.3 : 0.7} />
    </svg>
  );
}

const TONE: Record<string, { bot: string; card: string }> = {
  finder: { bot: "#60a5fa", card: "from-sky-500/20 to-sky-500/5 border-sky-500/30" },
  scanner: { bot: "#818cf8", card: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/30" },
  writer: { bot: "#a78bfa", card: "from-violet-500/20 to-violet-500/5 border-violet-500/30" },
  postman: { bot: "#34d399", card: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30" },
  nudger: { bot: "#fbbf24", card: "from-amber-500/20 to-amber-500/5 border-amber-500/30" },
  listener: { bot: "#f472b6", card: "from-pink-500/20 to-pink-500/5 border-pink-500/30" },
};

function StationCard({ station }: { station: Station }) {
  const tone = TONE[station.id] ?? TONE.finder;
  const inner = (
    <div
      className={`relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl border bg-gradient-to-b p-4 transition hover:brightness-125 ${tone.card} ${
        station.live ? "engine-sweep" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Bot tone={tone.bot} asleep={!station.live} />
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            station.live ? "engine-dot bg-emerald-400" : "bg-slate-500"
          }`}
          title={station.live ? "working" : "not running"}
        />
      </div>
      <div>
        <div className="text-sm font-bold text-white">{station.name}</div>
        <div className="text-[11px] leading-snug text-slate-300">{station.does}</div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-bold tabular-nums text-white">{station.value}</div>
        <div className="text-[11px] text-slate-300">{station.unit}</div>
        <div className="mt-1 text-[11px] font-semibold text-slate-400">{station.state}</div>
      </div>
    </div>
  );

  return station.href ? (
    <Link href={station.href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function EngineRoom({ engine }: { engine: Engine }) {
  const busiest = Math.max(1, ...engine.days.map((d) => d.first + d.followUp));

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1020] p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-white">Engine room</h2>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            engine.running ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${engine.running ? "bg-emerald-400" : "bg-amber-400"}`}
          />
          {engine.running ? "RUNNING" : "ATTENTION"}
        </span>
        <p className="text-xs text-slate-400">
          Six jobs share the work. Every number here is counted, not estimated.
        </p>
      </div>

      {engine.halted && (
        <p className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-200">
          {engine.halted}
        </p>
      )}

      <div className="relative mt-5">
        {/* The work moving down the line, drawn behind the cards. Six
            stations in a row is a flow, and a flow with nothing travelling
            along it looks like a diagram of something switched off. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          {engine.stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>

        {/* The rail the work travels along, under the row rather than
            through it — drawn across the cards it cut straight through
            their text, because the cards are deliberately translucent. */}
        <svg className="mt-2 hidden h-2 w-full lg:block" aria-hidden="true">
          <line
            x1="4%"
            y1="4"
            x2="96%"
            y2="4"
            stroke={engine.running ? "#34d399" : "#64748b"}
            strokeOpacity="0.5"
            strokeWidth="2"
            className={engine.running ? "engine-line" : ""}
          />
        </svg>
      </div>

      <EngineLive running={engine.running} />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-bold text-white">Where every business gets to</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Each line counts businesses, not emails. Share of everything ever found.
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {engine.funnel.map((step) => {
              const pct = step.of > 0 ? (step.value / step.of) * 100 : 0;
              return (
                <li key={step.label} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-[11px] text-slate-300">{step.label}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                    <span
                      className="block h-full rounded-full bg-sky-400"
                      style={{ width: `${Math.max(pct, step.value > 0 ? 1.5 : 0)}%` }}
                    />
                  </span>
                  <span className="w-20 shrink-0 text-right text-[11px] tabular-nums text-slate-300">
                    <b className="text-white">{step.value}</b>{" "}
                    {step.of > 0 && <span>{Math.round(pct * 10) / 10}%</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h3 className="text-sm font-bold text-white">Emails sent per day</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">
            First emails and follow-ups, last fourteen days.
          </p>
          {engine.days.length === 0 ? (
            <p className="mt-6 text-xs text-slate-400">Nothing sent in the last fortnight.</p>
          ) : (
            <>
              <div className="mt-3 flex gap-1.5">
                {engine.days.map((day) => (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                    {/* Each bar is sized against the busiest day, from the
                        bottom of a box with a real height — a percentage
                        inside a flex item with no height of its own
                        collapses to nothing. */}
                    <div
                      className="flex h-20 w-full flex-col justify-end"
                      title={`${day.date}: ${day.first} first, ${day.followUp} follow-up`}
                    >
                      <span
                        className="w-full rounded-t-sm bg-emerald-400"
                        style={{ height: `${(day.followUp / busiest) * 100}%` }}
                      />
                      <span
                        className="w-full bg-sky-400"
                        style={{ height: `${(day.first / busiest) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500">{day.date.slice(8)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-sky-400" /> first emails
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400" /> follow-ups
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {engine.tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-slate-800 bg-slate-900/40 px-3.5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {tile.label}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-white">{tile.value}</div>
            <div className="mt-0.5 text-[11px] leading-snug text-slate-400">{tile.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
