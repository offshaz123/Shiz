import { REGIONS, type Region } from "./regions";

/**
 * When cold email may leave, in the hours of the country it is going to.
 *
 * The sending used to be one batch a day, fired whenever Hostinger's cron
 * happened to run, with the two countries interleaved in the same run. For
 * Britain that was fine by accident. For America it was not: a run at
 * British breakfast time lands in an American inbox in the middle of the
 * night, and a cold email timestamped 3am is read as a machine before a
 * word of it is read at all.
 *
 * So the day is split into two batches per country, each one opening at an
 * hour in that country's own time, and nothing new goes out before the
 * first batch opens or after the working day closes.
 *
 * Which clock
 * -----------
 * Britain is one time zone, so Europe/London is exactly right.
 *
 * America is four, which no single hour can satisfy. Central is the middle
 * of them, so a batch that opens at ten there opens at eleven on the east
 * coast and eight on the west. Both of those are somebody's working morning.
 * Anchoring on Eastern instead would put the first batch at seven in the
 * morning in California, and on Pacific it would be one in the afternoon in
 * New York, which wastes half their day.
 *
 * Why batches and not a trickle
 * -----------------------------
 * Because the scheduler is a cron on shared hosting, not a queue. It fires,
 * does what is owed, and exits. Two openings a day is something a cron can
 * be right about; "one every eleven minutes" is not.
 */

/** The clock each country's sending is set by. */
export const SENDING_ZONE: Record<Region, string> = {
  uk: "Europe/London",
  us: "America/Chicago",
};

/** The hours, local to that country, when a batch becomes due. */
export const SLOTS: readonly number[] = [10, 14];

/** How many brand-new first emails each batch may send, per country. */
export const PER_SLOT = 20;

/**
 * The hour the working day closes for this purpose, local to that country.
 *
 * Nothing new opens after it. Six in the evening rather than five, so a
 * cron that drifts or a run that fails and is retried an hour later still
 * gets the afternoon batch out, and never at the cost of somebody's dinner.
 */
export const DAY_ENDS = 18;

/**
 * The hour each country's own working day starts, for the admin page's
 * wording. Nothing is sent before the first batch anyway.
 */
export const DAY_OPENS = SLOTS[0];

/**
 * What time it is where the email is going.
 *
 * Intl rather than a table of offsets, because the table is the thing that
 * is wrong twice a year. The British clocks go forward in March and
 * America's go forward a fortnight earlier, so for those two weeks every
 * hand-written offset in the world is an hour out.
 */
export function localTime(region: Region, now: Date = new Date()): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SENDING_ZONE[region],
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  // Midnight comes back as 24 from some ICU builds. Treat it as zero: the
  // difference decides whether a batch counts as open, and 24 would read
  // as the end of the day rather than the start of it.
  const hour = get("hour") % 24;
  return { hour, minute: get("minute") };
}

/**
 * How long ago that country's day began, in minutes.
 *
 * Used to count what has already gone out "today", which has to mean their
 * today and not ours — the Pakistan office's day and the American one barely
 * overlap, so a count from midnight here would reset in the middle of their
 * afternoon.
 *
 * A length of time rather than an instant, because the count it feeds is
 * made by the database against its own clock. See countStepOneSentSince.
 */
export function minutesSinceDayStart(region: Region, now: Date = new Date()): number {
  const { hour, minute } = localTime(region, now);
  return hour * 60 + minute;
}

/**
 * How many batches have come due in that country today.
 *
 * Cumulative rather than "which batch are we in", and this is the part that
 * keeps a once-a-day cron working. A run at three in the afternoon finds
 * both batches due and sends both, so switching the scheduler to hourly
 * makes the sending gentler and better timed rather than being the thing
 * that makes it work at all.
 */
export function slotsDue(region: Region, now: Date = new Date()): number {
  const { hour } = localTime(region, now);
  if (hour >= DAY_ENDS) return 0;
  return SLOTS.filter((slot) => hour >= slot).length;
}

/** Is it an acceptable hour to put a cold email in front of this country? */
export function openNow(region: Region, now: Date = new Date()): boolean {
  return slotsDue(region, now) > 0;
}

/**
 * How many new openers this country may still have today.
 *
 * `sentToday` is what has already gone to that country since its own
 * midnight, so a second run in the same batch sends the remainder rather
 * than another twenty. Never negative: somebody sending a handful by hand
 * should eat into the automatic allowance, not earn extra.
 */
export function allowanceNow(region: Region, sentToday: number, now: Date = new Date()): number {
  const due = slotsDue(region, now) * PER_SLOT;
  return Math.max(0, due - Math.max(0, sentToday));
}

/** The next hour something will go out, local to that country, or null if
 *  their day is done. */
export function nextSlot(region: Region, now: Date = new Date()): number | null {
  const { hour } = localTime(region, now);
  if (hour >= DAY_ENDS) return null;
  return SLOTS.find((slot) => hour < slot) ?? null;
}

export function clockWords(hour: number): string {
  const suffix = hour < 12 ? "am" : "pm";
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return `${twelve}${suffix}`;
}

/** The two batch times written out, for the admin page. */
export function slotWords(): string {
  return SLOTS.map(clockWords).join(" and ");
}

/**
 * Where a country stands right now, in a sentence somebody can act on.
 *
 * Says the local time first, because the whole point is that it is not the
 * same as the time on the screen of whoever is reading this.
 */
export function sendingWords(region: Region, sentToday: number, now: Date = new Date()): string {
  const { hour, minute } = localTime(region, now);
  const there = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} there`;
  const left = allowanceNow(region, sentToday, now);
  if (left > 0) return `${there} — ${left} still to go out of today's ${slotsDue(region, now) * PER_SLOT}`;
  const next = nextSlot(region, now);
  if (next !== null) return `${there} — next batch at ${clockWords(next)}`;
  if (slotsDue(region, now) > 0) return `${there} — today's ${slotsDue(region, now) * PER_SLOT} have gone`;
  return `${there} — done for the day, next batch at ${clockWords(SLOTS[0])}`;
}

/** Every country's position at once, for the admin page. */
export function everyRegionNow(
  sentToday: Record<Region, number>,
  now: Date = new Date(),
): { region: Region; open: boolean; left: number; words: string }[] {
  return REGIONS.map((region) => ({
    region,
    open: openNow(region, now),
    left: allowanceNow(region, sentToday[region] ?? 0, now),
    words: sendingWords(region, sentToday[region] ?? 0, now),
  }));
}
