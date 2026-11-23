/**
 * The two markets this prospects system works: the UK and the United States.
 *
 * Its own module with no imports, because the region is read everywhere —
 * the browser draws a switch for it, the database filters on it, the Places
 * call sends it, and the call list uses it to work out whether a business
 * is open right now.
 *
 * One list of businesses with a column on it rather than two of everything.
 * A second copy of the tables would mean every query, every page and every
 * cron job written twice, and the second copy is the one that quietly stops
 * being maintained.
 */

export const REGIONS = ["uk", "us"] as const;
export type Region = (typeof REGIONS)[number];

export const DEFAULT_REGION: Region = "uk";

export function isRegion(value: unknown): value is Region {
  return typeof value === "string" && (REGIONS as readonly string[]).includes(value);
}

export function toRegion(value: unknown): Region {
  return isRegion(value) ? value : DEFAULT_REGION;
}

export type RegionInfo = {
  key: Region;
  /** Short, for a tab. */
  label: string;
  /** Long, for a sentence. */
  name: string;
  /** What Google Places is told, so a search for "Dagenham" does not
   *  return the one in New Jersey, and vice versa. */
  placesRegionCode: string;
  /** What the areas on the search form are called in that country. */
  areaWord: string;
  /** The grouping above an area: a county here, a state there. */
  groupWord: string;
  /** UTC offset of the country's main business hours, in hours.
   *  Approximate on purpose — the US spans four of them, and the point is
   *  to stop somebody ringing Phoenix at four in the morning, not to be
   *  right to the minute. */
  businessHoursUtc: { open: number; close: number };
};

export const REGION_INFO: Record<Region, RegionInfo> = {
  uk: {
    key: "uk",
    label: "UK",
    name: "United Kingdom",
    placesRegionCode: "GB",
    areaWord: "town",
    groupWord: "county",
    // 9 to 5 in London, which is UTC in winter and UTC+1 in summer. The
    // hour of drift either way does not change any decision this makes.
    businessHoursUtc: { open: 9, close: 17 },
  },
  us: {
    key: "us",
    label: "US",
    name: "United States",
    placesRegionCode: "US",
    areaWord: "city",
    groupWord: "state",
    // Eastern opens at 14:00 UTC, Pacific closes at 01:00 UTC the next day.
    // Written as 14 to 25 so the arithmetic stays in one day.
    businessHoursUtc: { open: 14, close: 25 },
  },
};

export function regionInfo(region: Region): RegionInfo {
  return REGION_INFO[region];
}

/**
 * Is it a sensible hour to ring a business in that country right now?
 *
 * Here because the person doing the ringing is in Pakistan, five hours
 * ahead of London and ten or thirteen ahead of the United States. Their
 * afternoon is Britain's morning and the middle of America's night, and
 * their evening is America's morning. Nobody should have to hold that in
 * their head while working a list.
 */
export function callableNow(region: Region, now = new Date()): boolean {
  const hour = now.getUTCHours();
  const { open, close } = REGION_INFO[region].businessHoursUtc;
  // close can run past 24 for a country that spans into the next UTC day.
  return hour >= open && (close <= 24 ? hour < close : hour < 24 || hour < close - 24);
}

/**
 * When that country's working day opens and closes, in the caller's own
 * local time, written out.
 *
 * Takes the caller's UTC offset in hours — Pakistan is +5 — so the answer
 * is in the hours they actually live in rather than in UTC.
 */
export function callingWindow(region: Region, callerUtcOffset: number): string {
  const { open, close } = REGION_INFO[region].businessHoursUtc;
  const local = (utcHour: number) => {
    const h = ((utcHour + callerUtcOffset) % 24 + 24) % 24;
    const suffix = h < 12 ? "am" : "pm";
    const twelve = h % 12 === 0 ? 12 : h % 12;
    return `${twelve}${suffix}`;
  };
  return `${local(open)} to ${local(close)}`;
}
