/**
 * Working out which seven days a week is.
 *
 * Its own module with no imports, because both a server page and a client
 * component need these, and a function exported from a "use client" file
 * cannot be called from the server at all — only rendered. It is also the
 * sort of date arithmetic that is quietly wrong for one week in the year
 * and easier to be sure of when it can be tested on its own.
 *
 * Everything here works in local time on purpose. A diary is read by
 * somebody standing next to a van, and their Monday is the Monday where
 * they are standing, not the one UTC happens to be having.
 */

export const DAY_MS = 86_400_000;

/**
 * The Monday of whatever week this date falls in.
 *
 * Monday-first because that is how a working week is read in the UK, and
 * getDay() counts from Sunday, which is where the +6 comes from. The time
 * is thrown away so that two dates in the same week always give back the
 * identical Monday rather than two Mondays at different times of day.
 */
export function weekStart(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/**
 * YYYY-MM-DD in local time.
 *
 * Built by hand rather than with toISOString, which converts to UTC first:
 * anywhere east of Greenwich, a job at 9am would be filed under the day
 * before for half the year.
 */
export function isoDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

/** "16 – 22 Nov 2026", with the month said once when it is the same. */
export function weekLabel(start: Date): string {
  const end = new Date(start.getTime() + 6 * DAY_MS);
  const sameMonth = start.getMonth() === end.getMonth();
  const left = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: sameMonth ? undefined : "short",
  });
  const right = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${left} – ${right}`;
}

/** "14:30" to 870 minutes past midnight. Null for a job with no time on it. */
export function minutesOf(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}
