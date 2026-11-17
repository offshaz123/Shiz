import { industries } from "@/content/industries";
import { allAreas, cities } from "@/content/areas";
import { searchBusinesses, placesBudget } from "./google-business";
import { saveProspects } from "./prospects";

/**
 * Finding businesses without anybody typing a search.
 *
 * This was the last manual step holding the pipeline up, and it showed:
 * the first fully automatic run sent one email instead of three, because
 * only one business in the whole list still qualified. Everything
 * downstream was working and starving.
 *
 * One trade at a time, by Walid's instruction: a morning's calls should be
 * a set of businesses that do the same thing, not a jumble. So the industry
 * is chosen per day and every search that day sits inside it, starting with
 * automotive.
 *
 * No stored cursor. The rotation is derived from the date, which means it
 * cannot drift, cannot be reset by a deploy, and needs no table: day one is
 * automotive, day two the next industry, and after a full pass it comes
 * round again with different towns. Re-searching a town later is useful
 * rather than wasteful, because saveProspects keys on Google's place id, so
 * a business already on the list stays as it is and only genuinely new ones
 * are added.
 */

/** Automotive first, by instruction. The rest follow in a fixed order so
 *  the rotation is predictable from the date alone. */
const INDUSTRY_ORDER = [
  "automotive",
  "home-trades",
  "health-beauty",
  "hospitality",
  "fitness",
  "professional-services",
  "property",
  "retail-ecommerce",
];

/**
 * Searches per run.
 *
 * Started at six on the theory that six searches of up to twenty results
 * each would outrun the sending cap comfortably. The first real run settled
 * that: six searches of automotive in Barking returned nineteen businesses,
 * of which six had a website worth scanning. At that rate the list gains
 * roughly six emailable businesses a day against a cap that wants fifteen,
 * so the sending would stay starved and the call list would stay thin.
 *
 * Twenty is a third of the daily Places allowance of sixty, which still
 * leaves room for the register lookups and anything searched by hand. It
 * also spans more towns, which the cold-call list wants anyway: it takes
 * one trade at a time in turn, and that only produces variety if there is
 * variety to draw from.
 */
const SEARCHES_PER_RUN = 20;

/**
 * The review ceiling.
 *
 * The whole premise is businesses that are not being marketed well, and a
 * business with hundreds of reviews is already being found. Matches the
 * default on the search form.
 */
const MAX_REVIEWS = 50;

/** East London first, because it is closest to home and a short drive makes
 *  meeting in person possible, then the rest, then the bigger cities. */
const TOWNS = [...allAreas, ...cities];

function tradesFor(slug: string): string[] {
  const industry = industries.find((i) => i.slug === slug);
  return (industry?.examples ?? []).map((e) => e.replace(/\s*&\s*/g, " "));
}

/** Days since the epoch. The whole rotation hangs off this one number. */
export function dayIndex(now = new Date()): number {
  return Math.floor(now.getTime() / 86_400_000);
}

/**
 * The day the rotation starts, so day one is automotive rather than
 * whatever the epoch happens to land on.
 *
 * Counting straight from 1970 put the first live day on property, which is
 * a fine industry and not the one that was asked for. Anchoring costs one
 * constant and makes the instruction true: automotive first, then round.
 */
export const ANCHOR_DAY = dayIndex(new Date("2026-11-17T12:00:00Z"));

export function industryForDay(day: number): string {
  const n = day - ANCHOR_DAY;
  return INDUSTRY_ORDER[((n % INDUSTRY_ORDER.length) + INDUSTRY_ORDER.length) % INDUSTRY_ORDER.length];
}

/**
 * The searches to run today: trade and town pairs inside one industry.
 *
 * Pairs are walked in a fixed order and the starting point moves with each
 * full pass through the industries, so the second time automotive comes
 * round it is looking at different towns rather than repeating the first
 * day exactly.
 */
export function searchesForDay(
  day: number,
  count = SEARCHES_PER_RUN,
  /**
   * Skip this many pairs before taking any.
   *
   * The rotation is a function of the date, which is what keeps it honest,
   * and that means running the job twice in one day would otherwise repeat
   * the same searches and spend the allowance on results already saved.
   * The offset is how a run is nudged forward by hand when the list is low
   * and tomorrow is too late.
   */
  offset = 0,
): { query: string; industry: string; town: string }[] {
  const industry = industryForDay(day);
  const trades = tradesFor(industry);
  if (trades.length === 0 || TOWNS.length === 0) return [];

  // Trade varies fastest, so one day covers several trades in several towns
  // rather than one trade everywhere.
  const pairs: { trade: string; town: string }[] = [];
  for (const town of TOWNS) {
    for (const trade of trades) pairs.push({ trade, town });
  }

  const cycle = Math.floor((day - ANCHOR_DAY) / INDUSTRY_ORDER.length);
  const start = ((cycle * count + offset) % pairs.length + pairs.length) % pairs.length;

  const picked: { query: string; industry: string; town: string }[] = [];
  for (let i = 0; i < Math.min(count, pairs.length); i += 1) {
    const pair = pairs[(start + i) % pairs.length];
    picked.push({
      query: `${pair.trade} in ${pair.town}`,
      industry,
      town: pair.town,
    });
  }
  return picked;
}

export type AutoSearchResult = {
  industry: string;
  searches: number;
  found: number;
  stopped: string;
};

export async function runAutoSearch(
  now = new Date(),
  count = SEARCHES_PER_RUN,
  offset = 0,
): Promise<AutoSearchResult> {
  const day = dayIndex(now);
  const planned = searchesForDay(day, count, offset);
  const result: AutoSearchResult = {
    industry: industryForDay(day),
    searches: 0,
    found: 0,
    stopped: "",
  };

  const budget = placesBudget();
  if (!budget.hasKey) {
    result.stopped = "no Places key";
    return result;
  }

  for (const search of planned) {
    const found = await searchBusinesses(search.query, MAX_REVIEWS);
    if (found.status !== "ok") {
      // Budget is the expected stop, not a fault: it means the allowance for
      // the day is gone and tomorrow's run picks up where this one left off.
      result.stopped = found.reason === "budget" ? "daily Places allowance spent" : found.reason;
      break;
    }
    result.searches += 1;
    if (found.businesses.length === 0) continue;

    // Keyed on Google's place id, so a business already on the list keeps
    // its status, its notes and the fact it has been called. Only genuinely
    // new ones are added.
    await saveProspects(found.businesses, search.query, search.industry, search.town);
    result.found += found.businesses.length;
  }

  return result;
}
