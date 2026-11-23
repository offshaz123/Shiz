import type { Region } from "./regions";

/**
 * The same trade, in the words the other country uses for it.
 *
 * Its own module with no imports beyond the type, so it can be tested
 * against the real list of trades without a browser or a database.
 *
 * The site's trade names are written for British customers, and several of
 * them mean nothing in America or mean something else. A Places search for
 * "Garages & MOT in Katy" returns almost nothing, because the MOT is a
 * British test that does not exist there — so that search spends an API
 * call and a slot in the day's rotation to find no one.
 *
 * Only the words that genuinely differ are here. Plumbers are plumbers,
 * barbers are barbers, and a translation table that restates those is a
 * table that gets out of step with the list it is translating.
 */

const US_WORDS: Record<string, string> = {
  // The MOT is a UK roadworthiness test with no American equivalent.
  "Garages & MOT": "Auto repair shops",
  "Garages and MOT": "Auto repair shops",
  // A solicitor is a lawyer, and nobody there searches the other word.
  Solicitors: "Attorneys",
  // Estate agent is the British term; the American one is a trademark of
  // the National Association of Realtors but is also the ordinary word
  // people and Google use, so it is the one that finds the businesses.
  "Estate agents": "Real estate agents",
  "Letting agents": "Property management companies",
  // Takeaway is British; takeout is the American word for the same shop.
  Takeaways: "Takeout restaurants",
  // Chartered-style titles do not travel. "Accountants" works in both,
  // but the bookkeeping one is usually written as a service there.
  Bookkeepers: "Bookkeeping services",
  // A British "financial adviser" is a "financial advisor" there, and the
  // spelling genuinely changes what a text search matches.
  "Financial advisers": "Financial advisors",
  // Recruiters are more often staffing or employment agencies.
  Recruiters: "Staffing agencies",
  // "Trackers" means vehicle trackers here; alone it matches nothing.
  Trackers: "Car alarm and tracking installers",
  // Both are understood, but this is the sign over the door there.
  "Class franchises": "Fitness studios",
  "Sports clubs": "Athletic clubs",
  // A British "installer" is a fitter; the word is too vague there.
  Installers: "Home improvement contractors",
  // Lash & brow reads as a salon service rather than a business type.
  "Lash & brow": "Eyelash extension salons",
  "Function venues": "Event venues",
};

/**
 * What to actually type into Google for this trade in this country.
 *
 * Falls through to the British name, which is the right default: most
 * trades are called the same thing, and a missing entry costs nothing
 * beyond the search being worded the way it always was.
 */
export function tradeName(trade: string, region: Region): string {
  if (region !== "us") return trade;
  return US_WORDS[trade] ?? trade;
}

/** True when that trade is called something else over there, for showing
 *  somebody why the button says what it says. */
export function isTranslated(trade: string, region: Region): boolean {
  return region === "us" && trade in US_WORDS;
}
