/**
 * The team's diary, as a month you can look at.
 *
 * There was already a list of promised call-backs on the day page, and a
 * list is the right shape for "what do I do next". It is the wrong shape
 * for every other question somebody asks a diary: what does Thursday look
 * like, is next week full, did anything get missed while I was away. Those
 * are questions about a month, and a month has to be drawn as one.
 *
 * Everything here is pure and takes the time as an argument, so the grid
 * can be tested without waiting for a Tuesday. The database half is in
 * team-calendar.ts; this half knows nothing about where the entries came
 * from, which is what lets a call-back and an invoice sit on the same
 * square.
 */

export type DiaryKind = "call-back" | "invoice" | "follow-up";

export const KIND_LABEL: Record<DiaryKind, string> = {
  "call-back": "Ring back",
  invoice: "Invoice due",
  "follow-up": "Email goes out",
};

export type DiaryItem = {
  /** Unique across kinds, so a square can hold both and nothing collides. */
  id: string;
  kind: DiaryKind;
  /** YYYY-MM-DD. */
  day: string;
  /** "09:30", or empty for something with no particular time. */
  time: string;
  title: string;
  detail: string;
  /** Whose job it is. Empty means nobody in particular. */
  who: string;
  /** The staff row, where we know it. Null is the owner or unknown. */
  staffId: number | null;
  href: string;
};

/** Monday first, because the working week is not a Sunday one. */
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-11-25" → "2026-11". */
export function monthOf(day: string): string {
  return day.slice(0, 7);
}

/** "2026-11" → "November 2026". */
export function monthName(month: string): string {
  const [year, m] = month.split("-");
  const index = Number(m) - 1;
  if (!MONTHS[index]) return month;
  return `${MONTHS[index]} ${year}`;
}

/** The month before or after this one. `shiftMonth("2026-01", -1)` is 2025-12. */
export function shiftMonth(month: string, by: number): string {
  const [year, m] = month.split("-").map(Number);
  // Date does the wrapping, including over a year end, which is the part
  // hand-rolled month arithmetic always gets wrong in December.
  const when = new Date(Date.UTC(year, m - 1 + by, 1));
  return `${when.getUTCFullYear()}-${String(when.getUTCMonth() + 1).padStart(2, "0")}`;
}

function ymd(when: Date): string {
  return `${when.getUTCFullYear()}-${String(when.getUTCMonth() + 1).padStart(2, "0")}-${String(
    when.getUTCDate(),
  ).padStart(2, "0")}`;
}

/**
 * The squares of a month grid, Monday to Sunday, including the days
 * either side that fill the first and last rows.
 *
 * Always whole weeks. A grid that changes height between months makes
 * everything under it jump when you press next, which is the kind of
 * thing nobody reports and everybody notices.
 */
export function weeksOf(month: string): string[][] {
  const [year, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, m - 1, 1));
  // getUTCDay is 0 for Sunday; we want 0 for Monday.
  const lead = (first.getUTCDay() + 6) % 7;

  const start = new Date(first.getTime() - lead * 86_400_000);
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const squares = Math.ceil((lead + daysInMonth) / 7) * 7;

  const weeks: string[][] = [];
  for (let i = 0; i < squares; i += 1) {
    if (i % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1].push(ymd(new Date(start.getTime() + i * 86_400_000)));
  }
  return weeks;
}

/** Everything on one day, earliest first, with the timed ones before the
 *  ones that only have a date. */
export function onDay(items: DiaryItem[], day: string): DiaryItem[] {
  return items
    .filter((item) => item.day === day)
    .sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time) return -1;
      if (b.time) return 1;
      return a.title.localeCompare(b.title);
    });
}

/** Grouped once, for a grid that would otherwise filter the whole list
 *  forty-two times. */
export function byDay(items: DiaryItem[]): Map<string, DiaryItem[]> {
  const map = new Map<string, DiaryItem[]>();
  for (const item of items) {
    const list = map.get(item.day) ?? [];
    list.push(item);
    map.set(item.day, list);
  }
  for (const [day, list] of map) map.set(day, onDay(list, day));
  return map;
}

/** "2026-11-25 09:30" from a day and a time, for comparing against now. */
function moment(item: DiaryItem): string {
  return `${item.day} ${item.time || "23:59"}`;
}

/**
 * What is due right now: today, the time has come, and nobody has done
 * it. Anything from a day already gone counts as due too — a call-back
 * missed on Tuesday does not stop being owed on Wednesday.
 *
 * `now` is given as "YYYY-MM-DD HH:MM" so this can be tested at half
 * past nine on a Thursday without it being half past nine on a Thursday.
 */
export function dueNow(items: DiaryItem[], now: string): DiaryItem[] {
  return items.filter((item) => moment(item) <= now).sort((a, b) => moment(a).localeCompare(moment(b)));
}

/** Still to come today: the time has not arrived yet. This is the number
 *  on the banner, and it is the honest one — what is left of the day. */
export function leftToday(items: DiaryItem[], now: string): DiaryItem[] {
  const today = now.slice(0, 10);
  return items
    .filter((item) => item.day === today && moment(item) > now)
    .sort((a, b) => moment(a).localeCompare(moment(b)));
}

/** "Today", "Tomorrow", "Yesterday", or "Thu 27 Nov". */
export function dayLabel(day: string, today: string): string {
  if (day === today) return "Today";
  const gap = Math.round(
    (new Date(`${day}T12:00:00Z`).getTime() - new Date(`${today}T12:00:00Z`).getTime()) / 86_400_000,
  );
  if (gap === 1) return "Tomorrow";
  if (gap === -1) return "Yesterday";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** How a count of things left reads in a sentence. */
export function callsLeftWords(n: number): string {
  if (n === 0) return "Nothing else booked today";
  return n === 1 ? "1 call left today" : `${n} calls left today`;
}
