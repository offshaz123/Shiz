"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  KIND_LABEL,
  WEEKDAYS,
  byDay,
  callsLeftWords,
  dayLabel,
  dueNow,
  leftToday,
  monthName,
  monthOf,
  onDay,
  shiftMonth,
  weeksOf,
  type DiaryItem,
  type DiaryKind,
} from "@/lib/calendar";

/**
 * The month, and whatever day you pressed.
 *
 * A grid on its own is a wall chart: you can see that Thursday is busy
 * and not what it is busy with. A list on its own is what the day page
 * already had. So both — the month to see the shape of the work, and
 * the day beside it to actually do it.
 *
 * Everything is handed in from the server already worked out. The month
 * moves without asking for anything, because three months of a small
 * team's diary is a few hundred rows and a round trip per press is a
 * calendar that feels broken on a train.
 */

const KIND_STYLE: Record<DiaryKind, string> = {
  "call-back": "border-brand-pink/50 bg-brand-pink/10 text-foreground",
  invoice: "border-amber-500/50 bg-amber-500/10 text-foreground",
  "follow-up": "border-border bg-surface text-muted",
};

const KIND_DOT: Record<DiaryKind, string> = {
  "call-back": "bg-brand-pink",
  invoice: "bg-amber-500",
  "follow-up": "bg-muted",
};

function Item({ item, today }: { item: DiaryItem; today: string }) {
  const missed = item.kind === "call-back" && item.day < today;
  return (
    <li className={`rounded-xl border px-3 py-2 ${KIND_STYLE[item.kind]}`}>
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="w-11 shrink-0 text-xs font-bold tabular-nums">
          {item.time || "—"}
        </span>
        <Link href={item.href} className="text-sm font-bold underline-offset-2 hover:underline">
          {item.title}
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {KIND_LABEL[item.kind]}
        </span>
        {item.who && <span className="text-[11px] text-muted">· {item.who}</span>}
        {missed && (
          <span className="rounded-md border border-red-500/50 px-1.5 text-[11px] font-bold text-red-400">
            missed
          </span>
        )}
      </div>
      {item.detail && (
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>
      )}
    </li>
  );
}

export function CalendarMonth({
  items,
  today,
  now,
  everyone,
}: {
  items: DiaryItem[];
  /** The day the server thinks it is, so the grid and the page agree. */
  today: string;
  /** "YYYY-MM-DD HH:MM", for what is due and what is left. */
  now: string;
  /** True when this person sees the whole team's diary rather than
   *  their own, which changes what the page should say about it. */
  everyone: boolean;
}) {
  const [month, setMonth] = useState(() => monthOf(today));
  const [chosen, setChosen] = useState(today);

  const grouped = useMemo(() => byDay(items), [items]);
  const weeks = useMemo(() => weeksOf(month), [month]);
  const chosenItems = useMemo(() => onDay(items, chosen), [items, chosen]);

  const owed = useMemo(() => dueNow(items.filter((i) => i.kind === "call-back"), now), [items, now]);
  const left = useMemo(() => leftToday(items.filter((i) => i.kind === "call-back"), now), [items, now]);

  return (
    <div className="mt-6">
      {/* The banner. What is owed right now first, because that is the
          only part of a diary that is urgent. */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
        <span className="text-sm font-bold text-foreground">{callsLeftWords(left.length)}</span>
        {owed.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMonth(monthOf(owed[0].day));
              setChosen(owed[0].day);
            }}
            className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-1 text-xs font-bold text-foreground"
          >
            {owed.length} call{owed.length === 1 ? "" : "s"} owed now — oldest is {owed[0].title}
          </button>
        )}
        <span className="ml-auto text-[11px] text-muted">
          {everyone ? "Everybody's diary" : "Your own calls"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-5 lg:flex-row">
        {/* The month. */}
        <div className="lg:flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted hover:border-brand-pink hover:text-foreground"
              aria-label="The month before"
            >
              ←
            </button>
            <span className="text-sm font-bold text-foreground">{monthName(month)}</span>
            <button
              type="button"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
              className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted hover:border-brand-pink hover:text-foreground"
              aria-label="The month after"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => {
                setMonth(monthOf(today));
                setChosen(today);
              }}
              className="ml-auto rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted hover:border-brand-pink hover:text-foreground"
            >
              Today
            </button>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((name) => (
              <div
                key={name}
                className="px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                {name}
              </div>
            ))}
            {weeks.flat().map((day) => {
              const dayItems = grouped.get(day) ?? [];
              const outside = !day.startsWith(month);
              const isToday = day === today;
              const picked = day === chosen;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setChosen(day)}
                  className={`flex min-h-[4.5rem] flex-col items-start gap-1 rounded-xl border px-1.5 py-1 text-left ${
                    picked
                      ? "border-brand-pink bg-brand-pink/10"
                      : isToday
                        ? "border-foreground/40 bg-surface"
                        : "border-border bg-surface hover:border-brand-pink/60"
                  } ${outside ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      isToday ? "text-brand-pink" : "text-muted"
                    }`}
                  >
                    {Number(day.slice(8, 10))}
                  </span>
                  {/* Three at most. A square that lists nine things is a
                      square nobody can read at a glance, which is the
                      only thing a month view is for. */}
                  {dayItems.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="flex w-full items-center gap-1 text-[10px] leading-tight text-foreground"
                      title={`${item.time ? `${item.time} ` : ""}${item.title} — ${KIND_LABEL[item.kind]}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[item.kind]}`} />
                      <span className="truncate">
                        {item.time ? `${item.time} ${item.title}` : item.title}
                      </span>
                    </span>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[10px] font-semibold text-muted">
                      +{dayItems.length - 3} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
            {/* Only the kinds this person actually has. A key listing
                invoices to somebody who never sees one is a key that
                describes a different screen. */}
            {(Object.keys(KIND_LABEL) as DiaryKind[])
              .filter((kind) => items.some((item) => item.kind === kind))
              .map((kind) => (
                <span key={kind} className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${KIND_DOT[kind]}`} />
                  {KIND_LABEL[kind]}
                </span>
              ))}
          </div>
        </div>

        {/* The day. */}
        <div className="lg:w-[23rem] lg:shrink-0">
          <h2 className="text-sm font-bold text-foreground">
            {dayLabel(chosen, today)}
            <span className="ml-2 font-normal text-muted">
              {chosenItems.length === 0
                ? "nothing booked"
                : `${chosenItems.length} thing${chosenItems.length === 1 ? "" : "s"}`}
            </span>
          </h2>

          {chosenItems.length === 0 ? (
            <p className="mt-2 rounded-2xl border border-border bg-surface px-4 py-3.5 text-xs leading-relaxed text-muted">
              Nothing on this day. A call-back lands here the moment somebody asks to be rung at a
              particular time — there is nothing extra to fill in.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {chosenItems.map((item) => (
                <Item key={item.id} item={item} today={today} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
