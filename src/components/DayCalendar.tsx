"use client";

import { useState } from "react";
import type { DayReport } from "@/lib/staff";

/**
 * A month of squares, one per day, and what happened on the one you press.
 *
 * Walid asked for a calendar he can press a date on to see what somebody
 * did and what they missed. The squares are shaded by how many calls
 * were made, because at a glance the question is "which days were
 * worked" and a grid of numbers does not answer that as fast as a grid
 * of shades does.
 *
 * Nothing here is a score. Every figure is a count of something that
 * happened, and whether a day was a good one depends on what it was
 * supposed to contain — which the person reading knows and this does not.
 */

function shade(calls: number): string {
  if (calls === 0) return "bg-border/40";
  if (calls < 5) return "bg-brand-pink/25";
  if (calls < 15) return "bg-brand-pink/50";
  if (calls < 30) return "bg-brand-pink/75";
  return "bg-brand-pink";
}

function hoursAndMinutes(minutes: number): string {
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function DayCalendar({ days }: { days: DayReport[] }) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const [picked, setPicked] = useState<string>(days[0]?.date ?? "");

  // The last thirty days including the quiet ones. A calendar that only
  // shows the days somebody worked makes a thin fortnight look busy.
  //
  // Worked out once when the grid first draws rather than on every
  // render: pressing a date must not be able to shift the dates.
  const [squares] = useState(() => {
    const out: string[] = [];
    const today = new Date();
    for (let back = 29; back >= 0; back -= 1) {
      const day = new Date(today);
      day.setDate(day.getDate() - back);
      out.push(day.toISOString().slice(0, 10));
    }
    return out;
  });

  const day = byDate.get(picked);

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {squares.map((date) => {
          const report = byDate.get(date);
          const here = picked === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => setPicked(date)}
              title={`${date} — ${report?.calls ?? 0} calls`}
              className={`h-7 w-7 rounded text-[9px] font-bold tabular-nums transition ${shade(
                report?.calls ?? 0,
              )} ${here ? "ring-2 ring-brand-pink ring-offset-1 ring-offset-surface" : ""} ${
                (report?.unwritten ?? 0) > 0 ? "border-2 border-red-500" : ""
              }`}
            >
              {date.slice(8)}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Darker is more calls. A red edge means calls from that day were never written up.
      </p>

      <div className="mt-4 rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-bold text-foreground">
          {new Date(`${picked}T12:00:00`).toDateString()}
        </p>

        {!day ? (
          <p className="mt-2 text-sm text-muted">Nothing recorded on this day.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Fact label="On the system" value={hoursAndMinutes(day.onFor)} />
              <Fact label="Calls made" value={String(day.calls)} />
              <Fact label="Actually spoke" value={String(day.spoke)} />
              <Fact
                label="Time talking"
                value={day.talkSeconds > 0 ? hoursAndMinutes(Math.round(day.talkSeconds / 60)) : "—"}
              />
              <Fact label="Marked interested" value={String(day.interested)} />
              <Fact label="Marked not interested" value={String(day.notInterested)} />
              <Fact label="Calls written up" value={String(day.notes)} />
              <Fact
                label="Never written up"
                value={String(day.unwritten)}
                warn={day.unwritten > 0}
              />
            </div>

            {day.firstAt && (
              <p className="mt-3 text-xs text-muted">
                First thing at {day.firstAt.slice(11, 16)}, last at {day.lastAt.slice(11, 16)}.
                {/* Said rather than implied. The gap between first and
                    last is not time worked, and presenting it as though
                    it were would be the page's opinion dressed as data. */}{" "}
                That is the gap between them, not time spent working.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <p
        className={`text-xl font-bold tabular-nums ${
          warn ? "text-red-500" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">{label}</p>
    </div>
  );
}
