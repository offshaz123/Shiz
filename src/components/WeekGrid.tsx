"use client";

import type { Booking } from "@/lib/bookings";
import { DAY_MS, isoDay, minutesOf } from "@/lib/week";

/**
 * A working week with the hours down the side.
 *
 * The month grid answers "what is on this month". This answers the question
 * somebody actually has with a customer on the phone: "when am I free on
 * Thursday". A list of three jobs cannot answer that, because the thing
 * being looked for is the gaps, and a list has no gaps in it — only a grid
 * where an empty hour takes up as much room as a full one does.
 *
 * Hours run from the earliest job to the latest, never narrower than a
 * normal working day. A fixed 9-to-5 would hide a 7am MOT drop-off, and a
 * fixed midnight-to-midnight would be two screens of nothing either side of
 * the working day.
 *
 * Jobs that overlap are placed side by side rather than stacked on top of
 * one another, because two jobs at 2pm is exactly the thing this view
 * exists to show and hiding one behind the other would be worse than the
 * list it replaced.
 */

const ROW = 52;
const DEFAULT_FIRST_HOUR = 8;
const DEFAULT_LAST_HOUR = 18;

const STATUS_LOOK: Record<string, string> = {
  booked: "bg-series-1 text-white",
  done: "bg-emerald-600 text-white",
  cancelled: "bg-background text-muted line-through border border-border",
  "no-show": "bg-amber-600 text-white",
};

/**
 * Places overlapping jobs beside each other.
 *
 * Walks the day in order and gives each job the first lane whose last job
 * has already finished. The number of lanes in use is how many ways the
 * column has to be split, so two jobs at the same time are each half a
 * column wide and a day with no clashes stays full width.
 */
function lanes(jobs: { start: number; end: number }[]): { lane: number; of: number }[] {
  const ends: number[] = [];
  const placed = jobs.map((job) => {
    let lane = ends.findIndex((end) => end <= job.start);
    if (lane === -1) {
      lane = ends.length;
      ends.push(job.end);
    } else {
      ends[lane] = job.end;
    }
    return lane;
  });
  const of = Math.max(1, ends.length);
  return placed.map((lane) => ({ lane, of }));
}

export function WeekGrid({
  start,
  bookings,
  onPickDay,
}: {
  start: Date;
  bookings: Booking[];
  onPickDay: (day: string) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY_MS));
  const todayKey = isoDay(new Date());

  const timed = bookings.filter((b) => minutesOf(b.startsAt) !== null);
  const allDay = bookings.filter((b) => minutesOf(b.startsAt) === null);

  // Stretched to fit anything outside the usual day, never shrunk inside it.
  let firstHour = DEFAULT_FIRST_HOUR;
  let lastHour = DEFAULT_LAST_HOUR;
  for (const job of timed) {
    const from = minutesOf(job.startsAt) ?? 0;
    const to = from + (job.durationMinutes ?? 60);
    firstHour = Math.min(firstHour, Math.floor(from / 60));
    lastHour = Math.max(lastHour, Math.ceil(to / 60));
  }
  firstHour = Math.max(0, firstHour);
  lastHour = Math.min(24, Math.max(lastHour, firstHour + 1));

  const hours = Array.from({ length: lastHour - firstHour }, (_, i) => firstHour + i);
  const height = hours.length * ROW;

  const now = new Date();
  const nowKey = isoDay(now);
  const inThisWeek = days.some((d) => isoDay(d) === nowKey);
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - firstHour * 60) / 60) * ROW;
  const showNow = inThisWeek && nowTop >= 0 && nowTop <= height;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      {/* Wide enough that a column is still readable; swiped sideways on a
          phone, where seven usable columns do not fit however they are cut. */}
      <div className="min-w-[760px]">
        <div className="flex border-b border-border">
          <div className="w-14 shrink-0" />
          {days.map((day) => {
            const key = isoDay(day);
            const isToday = key === todayKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPickDay(key)}
                className={`flex-1 border-l border-border py-2.5 text-center transition hover:bg-background ${
                  isToday ? "bg-background" : ""
                }`}
              >
                <span className="block text-[11px] font-medium text-muted">
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span
                  className={`mt-0.5 block text-sm font-bold tabular-nums ${
                    isToday ? "text-brand-pink" : "text-foreground"
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Jobs with no time on them. Hidden entirely when there are none,
            rather than left as an empty strip across every week. */}
        {allDay.length > 0 && (
          <div className="flex border-b border-border">
            <div className="flex w-14 shrink-0 items-center justify-end pr-2 text-[10px] text-muted">
              All day
            </div>
            {days.map((day) => {
              const key = isoDay(day);
              return (
                <div key={key} className="flex-1 border-l border-border p-1">
                  {allDay
                    .filter((job) => job.bookedOn === key)
                    .map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => onPickDay(key)}
                        className={`mb-1 block w-full truncate rounded px-1.5 py-1 text-left text-[11px] font-semibold ${
                          STATUS_LOOK[job.status] ?? STATUS_LOOK.booked
                        }`}
                      >
                        {job.customerName}
                      </button>
                    ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="relative flex">
          <div className="w-14 shrink-0">
            {hours.map((hour) => (
              <div
                key={hour}
                style={{ height: ROW }}
                className="relative border-t border-border/60 pr-2 text-right"
              >
                <span className="absolute right-2 -top-2 text-[10px] tabular-nums text-muted">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const key = isoDay(day);
            const jobs = timed
              .filter((job) => job.bookedOn === key)
              .map((job) => {
                const from = minutesOf(job.startsAt) ?? 0;
                return { job, start: from, end: from + (job.durationMinutes ?? 60) };
              })
              .sort((a, b) => a.start - b.start);
            const placed = lanes(jobs);

            return (
              <div
                key={key}
                className="relative flex-1 border-l border-border"
                style={{ height }}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: ROW }}
                    className="border-t border-border/60"
                  />
                ))}

                {jobs.map(({ job, start: from, end }, i) => {
                  const top = ((from - firstHour * 60) / 60) * ROW;
                  // A fifteen-minute job still has to be readable, so a
                  // block is never shorter than its own text.
                  const tall = Math.max(((end - from) / 60) * ROW - 2, 26);
                  const { lane, of } = placed[i];
                  return (
                    <button
                      key={job.id}
                      type="button"
                      onClick={() => onPickDay(key)}
                      style={{
                        top,
                        height: tall,
                        left: `calc(${(lane / of) * 100}% + 2px)`,
                        width: `calc(${100 / of}% - 4px)`,
                      }}
                      className={`absolute overflow-hidden rounded-md px-1.5 py-1 text-left ${
                        STATUS_LOOK[job.status] ?? STATUS_LOOK.booked
                      }`}
                    >
                      <span className="block truncate text-[11px] font-bold leading-tight">
                        {job.customerName}
                      </span>
                      <span className="block truncate text-[10px] leading-tight opacity-90">
                        {job.startsAt}
                        {job.job ? ` · ${job.job}` : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {showNow && (
            <div
              aria-hidden
              style={{ top: nowTop }}
              className="pointer-events-none absolute inset-x-0 left-14 z-10 border-t-2 border-red-500"
            >
              <span className="absolute -left-1 -top-[5px] block h-2 w-2 rounded-full bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
