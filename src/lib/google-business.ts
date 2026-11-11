/**
 * Looks up the Google Business Profile behind a website.
 *
 * Why this is in the scanner at all: a local business can have a perfectly
 * decent website and still lose the job, because almost nobody types a domain
 * in — they search "car detailing near me" and pick from the map. The listing
 * is doing more selling than the site is. Reading the HTML can't see any of
 * that, so the scan was only ever telling half the story.
 *
 * Two rules this file sticks to, because getting either wrong turns the
 * scanner into a liar:
 *
 * 1. We only report a listing when we are sure it is theirs. "Sure" means the
 *    listing's own website field points at the domain we just scanned. A text
 *    search for "Elite Detailing" will cheerfully return an Elite Detailing in
 *    another county, and telling someone their rating is 3.1 when it is a
 *    stranger's is worse than saying nothing.
 *
 * 2. When we can't match one, we say we couldn't match one — not that they
 *    haven't got one. No listing and a listing that doesn't link their site
 *    are different problems with different fixes, and we can't tell them
 *    apart from out here.
 *
 * Source: Google Places API (New), Text Search. The official API, used within
 * its terms — deliberately not scraping Google Maps, which isn't allowed and
 * would put the account at risk.
 *
 * Setup: enable "Places API (New)" in Google Cloud, create an API key, then
 * set GOOGLE_PLACES_KEY. Without the key every lookup returns "unavailable"
 * and the scanner carries on exactly as it did before — no errors, no empty
 * section, nothing for a visitor to notice.
 */

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
/** Per-request timeout, and a ceiling on both tries together. */
const TIMEOUT_MS = 4_000;
const TOTAL_BUDGET_MS = 6_000;

/**
 * Google bills a request at the dearest tier any field in this mask belongs
 * to, so the list is kept tight: every field here has a check that depends on
 * it, and nothing is asked for out of curiosity.
 *
 * rating, userRatingCount, websiteUri, nationalPhoneNumber and
 * regularOpeningHours are Enterprise fields; reviews is dearer still. Dropping
 * reviews would save a little per thousand but the free monthly allowance is
 * the same either way, and "your newest review is eighteen months old" is the
 * single most useful thing this lookup produces. So it stays.
 *
 * websiteUri isn't optional whatever it costs — it is the only thing that
 * proves a listing belongs to the site we scanned.
 */
const FIELD_MASK = [
  // The place ID is an Essentials field — it costs nothing extra and it is
  // the only identifier that stays put when a business renames itself or
  // moves, which is what the prospects list keys on.
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "places.rating",
  "places.userRatingCount",
  "places.regularOpeningHours",
  "places.photos",
  "places.reviews",
].join(",");

export type GoogleBusiness = {
  /** Google's own stable identifier for this place. */
  id: string;
  name: string;
  address: string;
  mapsUri: string;
  websiteUri: string;
  phone: string;
  /** Google's own primary category, e.g. "Car detailing service". */
  category: string;
  rating: number | null;
  reviews: number;
  hasHours: boolean;
  photos: number;
  /** When the most recent review Google returned was written, if any. */
  latestReviewAt: string | null;
  /** Temporarily or permanently closed on Google. */
  closed: boolean;
};

export type GoogleBusinessLookup =
  /** Matched a listing to this exact domain. */
  | { status: "ok"; business: GoogleBusiness }
  /** Searched, got results, none of them linked this domain. */
  | { status: "no_match" }
  /** We didn't get to ask. No key, out of budget, or Google errored. */
  | { status: "unavailable"; reason: "no_key" | "budget" | "error" };

/** Shape of the bits of a Places result we read. Google sends more. */
type Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  businessStatus?: string;
  primaryTypeDisplayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { periods?: unknown[] };
  photos?: unknown[];
  reviews?: { publishTime?: string }[];
};

/* ------------------------------------------------------------------ */
/* Cost control                                                        */
/* ------------------------------------------------------------------ */

/**
 * The free audit form is open to the public and has no rate limit, so without
 * these two guards one person with a loop could run up a Google bill on our
 * card. The cache also does the honest thing for repeat visitors: a listing
 * doesn't change between two scans five minutes apart.
 *
 * Both live in memory. On the single Node process this site runs on that is
 * enough, and a restart only costs us a cold cache and a reset counter — it
 * can't double-charge anything already answered.
 */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: GoogleBusinessLookup }>();

/**
 * What a lookup actually costs, as of Google's published pricing in November
 * 2026, and why the defaults below are what they are.
 *
 * Google bills a Text Search request at the dearest tier any field in the
 * field mask belongs to. Asking for the review count, rating, phone or hours
 * puts us in Enterprise; asking for reviews themselves puts us in Enterprise +
 * Atmosphere. That tier allows 1,000 free calls a month and charges per
 * thousand after it.
 *
 * There is no longer a standing monthly dollar credit — Google replaced it
 * with these per-SKU allowances — so "free" means 1,000 calls, not £200 of
 * them. A scan spends one call, or two when the first search doesn't find a
 * match, which is why the monthly default sits a little under 1,000 rather
 * than on it.
 *
 * Belt and braces: this is the application's own limit. The hard stop is a
 * daily quota set on the key in Google Cloud, which Google enforces whatever
 * this code does.
 */
const MONTHLY_BUDGET = Number(process.env.GOOGLE_PLACES_MONTHLY_BUDGET ?? 900);

/** A second limit, so one bad day can't spend the whole month by teatime. */
const DAILY_BUDGET = Number(process.env.GOOGLE_PLACES_DAILY_BUDGET ?? 60);

let spend = { day: "", month: "", today: 0, thisMonth: 0 };

function withinBudget(): boolean {
  const now = new Date().toISOString();
  const day = now.slice(0, 10);
  const month = now.slice(0, 7);

  if (spend.month !== month) spend = { day, month, today: 0, thisMonth: 0 };
  if (spend.day !== day) spend = { ...spend, day, today: 0 };

  return spend.today < DAILY_BUDGET && spend.thisMonth < MONTHLY_BUDGET;
}

function recordSpend(): void {
  spend.today += 1;
  spend.thisMonth += 1;
}

/* ------------------------------------------------------------------ */
/* Working out what to search for                                      */
/* ------------------------------------------------------------------ */

const UK_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i;

/** Trailing boilerplate that makes a title a worse search term. */
const TITLE_NOISE =
  /\b(home|homepage|welcome|official site|official website|est\.?\s*\d{4})\b/gi;

/**
 * The business name as the page itself gives it.
 *
 * In order of how much we trust it: a LocalBusiness name in structured data
 * (which the business typed deliberately), then og:site_name, then the title
 * tag up to its first separator, since "Elite Detailing | Ceramic Coating in
 * Essex" searches far better as the first part alone.
 */
function nameFromPage(html: string): string {
  const jsonLd = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  for (const block of jsonLd) {
    const inner = block.replace(/^[^>]+>/, "").replace(/<\/script>$/i, "");
    try {
      const parsed: unknown = JSON.parse(inner);
      const found = findBusinessName(parsed);
      if (found) return found;
    } catch {
      // Hand-written JSON-LD is very often invalid. Not worth a word to the
      // user — it just means we fall through to the next source.
    }
  }

  const siteName = html.match(
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
  );
  if (siteName?.[1]) return clean(siteName[1]);

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title?.[1]) return clean(title[1].split(/[|–—·•]|\s-\s/)[0]);

  return "";
}

/** Properties only a real-world premises bothers to publish. */
const PREMISES_KEYS = [
  "address",
  "telephone",
  "openingHours",
  "openingHoursSpecification",
  "geo",
  "priceRange",
  "areaServed",
];

/**
 * Walks structured data for a name on anything that looks like a business.
 *
 * Goes by what the node publishes rather than only by its @type, because
 * schema.org has dozens of trade-specific business types — AutoRepair,
 * AutoWash, Plumber, HairSalon — whose names contain none of the words you'd
 * think to look for. Something carrying an address and a phone number is a
 * premises whatever it calls itself.
 */
function findBusinessName(node: unknown, depth = 0): string {
  if (depth > 6 || node === null || typeof node !== "object") return "";
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findBusinessName(item, depth + 1);
      if (found) return found;
    }
    return "";
  }
  const obj = node as Record<string, unknown>;
  const type = obj["@type"];
  const types = (Array.isArray(type) ? type : [type]).filter(
    (t): t is string => typeof t === "string"
  );
  const namedType = types.some((t) =>
    /business|organization|store|service|company|shop|dealer|repair|wash|auto|restaurant|salon/i.test(t)
  );
  const hasPremises = PREMISES_KEYS.some((k) => obj[k] !== undefined);
  if ((namedType || hasPremises) && typeof obj.name === "string" && obj.name.trim()) {
    return clean(obj.name);
  }

  for (const value of Object.values(obj)) {
    const found = findBusinessName(value, depth + 1);
    if (found) return found;
  }
  return "";
}

function clean(input: string): string {
  return input
    .replace(/&amp;/gi, "&")
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(TITLE_NOISE, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

/**
 * The search terms to try, best first.
 *
 * The name with a postcode is far and away the most reliable: it pins the
 * search to one town, which is what stops us matching a same-named business
 * two hundred miles away. The bare domain is the fallback, because Google does
 * index website addresses against listings and it costs nothing to ask.
 */
export function searchTermsFor(html: string, host: string): string[] {
  const name = nameFromPage(html);
  const postcode = html.match(UK_POSTCODE)?.[1];
  const terms: string[] = [];

  if (name && postcode) terms.push(`${name} ${postcode}`);
  if (name) terms.push(`${name} UK`);
  if (host) terms.push(host);

  return [...new Set(terms)].slice(0, 2);
}

/* ------------------------------------------------------------------ */
/* Finding businesses in an area                                       */
/* ------------------------------------------------------------------ */

export type ProspectSearch =
  | { status: "ok"; businesses: GoogleBusiness[]; found: number; dropped: number }
  | { status: "unavailable"; reason: "no_key" | "budget" | "error"; message?: string };

/**
 * Businesses in an area, smallest first.
 *
 * The opposite direction to the lookup above: that one starts from a website
 * and finds its listing, this one starts from "car detailing in Romford" and
 * finds the businesses. It exists because the useful question when deciding
 * who to ring is not "is this site bad" but "is this business small enough to
 * still want the work" — and review count is the only honest proxy for that
 * we can read.
 *
 * Sorted fewest reviews first, because that is the order you should call in.
 * Businesses with no website at all come out of this too; they are the better
 * prospect and the caller shows them first.
 */
export async function searchBusinesses(
  query: string,
  maxReviews: number,
): Promise<ProspectSearch> {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return { status: "unavailable", reason: "no_key" };
  if (!withinBudget()) return { status: "unavailable", reason: "budget" };

  recordSpend();

  let places: Place[];
  try {
    places = await searchOnce(query, key);
  } catch (err) {
    return {
      status: "unavailable",
      reason: "error",
      message: err instanceof Error ? err.message : undefined,
    };
  }

  const open = places.filter((p) => !p.businessStatus || p.businessStatus === "OPERATIONAL");
  const businesses = open
    .map(toBusiness)
    .filter((b) => b.reviews <= maxReviews)
    .sort((a, b) => a.reviews - b.reviews);

  return {
    status: "ok",
    businesses,
    found: places.length,
    dropped: places.length - businesses.length,
  };
}

/* ------------------------------------------------------------------ */
/* Matching                                                           */
/* ------------------------------------------------------------------ */

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Whether a listing's website is the site we scanned.
 *
 * Exact host, or one a level under the other, so shop.example.co.uk and
 * example.co.uk count as the same business. Anything looser starts matching
 * unrelated sites that happen to share a word.
 */
function sameBusiness(listingUrl: string, scannedHost: string): boolean {
  const a = hostOf(listingUrl);
  const b = scannedHost.replace(/^www\./, "").toLowerCase();
  if (!a || !b) return false;
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

function toBusiness(p: Place): GoogleBusiness {
  const latest = (p.reviews ?? [])
    .map((r) => r.publishTime)
    .filter((t): t is string => typeof t === "string")
    .sort()
    .pop();

  return {
    id: p.id ?? "",
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? "",
    mapsUri: p.googleMapsUri ?? "",
    websiteUri: p.websiteUri ?? "",
    phone: p.nationalPhoneNumber ?? "",
    category: p.primaryTypeDisplayName?.text ?? "",
    rating: typeof p.rating === "number" ? p.rating : null,
    reviews: typeof p.userRatingCount === "number" ? p.userRatingCount : 0,
    hasHours: Array.isArray(p.regularOpeningHours?.periods)
      ? p.regularOpeningHours.periods.length > 0
      : false,
    photos: Array.isArray(p.photos) ? p.photos.length : 0,
    latestReviewAt: latest ?? null,
    closed: Boolean(p.businessStatus) && p.businessStatus !== "OPERATIONAL",
  };
}

/* ------------------------------------------------------------------ */
/* The lookup                                                         */
/* ------------------------------------------------------------------ */

async function searchOnce(query: string, key: string): Promise<Place[]> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 10,
      regionCode: "GB",
      languageCode: "en",
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`places_${res.status}`);
  const data = (await res.json()) as { places?: Place[] };
  return data.places ?? [];
}

/**
 * Finds the Google listing for a scanned site, or says why it couldn't.
 *
 * Never throws and never rejects: the website scan has to finish whatever
 * Google does, so every failure comes back as "unavailable" and the report
 * simply leaves the section out.
 */
export async function lookupGoogleBusiness(
  html: string,
  finalUrl: string
): Promise<GoogleBusinessLookup> {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return { status: "unavailable", reason: "no_key" };

  const scannedHost = hostOf(finalUrl);
  if (!scannedHost) return { status: "unavailable", reason: "error" };

  const cached = cache.get(scannedHost);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const terms = searchTermsFor(html, scannedHost);
  if (terms.length === 0) return { status: "unavailable", reason: "error" };

  let result: GoogleBusinessLookup = { status: "unavailable", reason: "error" };
  /** Did any term get a real answer out of Google? */
  let answered = false;
  const startedAt = Date.now();

  for (const [i, term] of terms.entries()) {
    // Somebody is sitting watching a progress bar. A second try is worth a
    // couple of seconds, not another four on top of a slow first one.
    if (i > 0 && Date.now() - startedAt > TOTAL_BUDGET_MS) break;

    if (!withinBudget()) {
      // If an earlier term already came back clean, "no match" stands — the
      // budget only decides whether we got to ask, not what the answer was.
      if (!answered) result = { status: "unavailable", reason: "budget" };
      break;
    }

    recordSpend();

    let places: Place[];
    try {
      places = await searchOnce(term, key);
    } catch {
      // Keep whatever a successful earlier term told us; otherwise this is
      // still a failure to ask, not a finding about them.
      continue;
    }

    answered = true;
    const match = places.find((p) => p.websiteUri && sameBusiness(p.websiteUri, scannedHost));
    if (match) {
      result = { status: "ok", business: toBusiness(match) };
      break;
    }
    // Google answered and nothing linked this domain. A genuine miss, though
    // we'll still try the next term before settling on it.
    result = { status: "no_match" };
  }

  // Don't cache a transient failure — the next scan should try again. A miss
  // is worth caching; it won't change in the next day either way.
  if (result.status !== "unavailable") cache.set(scannedHost, { at: Date.now(), value: result });
  return result;
}

/**
 * What the Places allowance has been spent on, for the health page.
 *
 * Counted in memory, so it resets whenever the app restarts — a deploy, or
 * Hostinger recycling the process. It is a guard against one runaway
 * afternoon, not an accounting record, and the page says so rather than
 * presenting it as the month's true total.
 */
export function placesBudget(): {
  hasKey: boolean;
  today: number;
  thisMonth: number;
  dailyBudget: number;
  monthlyBudget: number;
} {
  return {
    hasKey: Boolean(process.env.GOOGLE_PLACES_KEY),
    today: spend.today,
    thisMonth: spend.thisMonth,
    dailyBudget: DAILY_BUDGET,
    monthlyBudget: MONTHLY_BUDGET,
  };
}

/**
 * One business, by name and area.
 *
 * For the companies that come off the register, which arrive with a name and
 * a registered address and nothing to ring. Google knows the phone number and
 * the website; the register does not, because it lists legal entities rather
 * than shop fronts.
 *
 * Returns the closest match or null. Deliberately strict about what counts as
 * a match: attaching the wrong phone number to a business is worse than
 * attaching none, because somebody then rings a stranger and opens with the
 * name of a company they have never heard of.
 */
export async function findBusiness(
  name: string,
  area: string,
): Promise<GoogleBusiness | null | "no_key" | "budget"> {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) return "no_key";
  if (!withinBudget()) return "budget";

  const clean = name.replace(/\b(ltd|limited|llp|plc)\b\.?/gi, "").trim();
  if (clean.length < 3) return null;

  recordSpend();

  let places: Place[];
  try {
    places = await searchOnce(`${clean} ${area}`.trim(), key);
  } catch {
    return null;
  }

  const open = places.filter((p) => !p.businessStatus || p.businessStatus === "OPERATIONAL");
  if (open.length === 0) return null;

  // The register's name and Google's rarely match character for character —
  // "J & S MOTORS LTD" against "J&S Motors". Compare on letters and digits
  // only, and require one to contain the other rather than merely overlap.
  const key1 = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
  const match = open
    .map(toBusiness)
    .find((b) => {
      const key2 = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return key1.length > 4 && key2.length > 4 && (key1.includes(key2) || key2.includes(key1));
    });

  return match ?? null;
}
