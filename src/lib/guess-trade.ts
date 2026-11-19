import { type Trade } from "./marketing-ideas";

/**
 * Working out what a business does from its own website.
 *
 * Its own module with no imports beyond the trade list, so it can be
 * tested against real wording without a browser or a database.
 *
 * It guesses and says so. A guess that is wrong is a page of advice
 * about somebody else's trade, which is worse than general advice, so
 * the admin side keeps the final say and a weak match becomes "general"
 * rather than a coin toss between two trades.
 *
 * Words are weighted by how much they give away. "Wheel" appears on a
 * gym's site as often as a garage's; "MOT" appears on exactly one kind.
 */

type Rule = { trade: Trade; weight: number; words: string[] };

/**
 * Strong words are ones that are nearly conclusive on their own. Weak
 * ones only count when several of them turn up together.
 */
const RULES: Rule[] = [
  {
    trade: "number-plates",
    weight: 5,
    words: [
      "private plate",
      "personalised registration",
      "personalised number plate",
      "cherished registration",
      "number plate",
      "reg transfer",
      "registration transfer",
      "dvla retention",
      "show plates",
      "4d plates",
    ],
  },
  {
    trade: "automotive",
    weight: 5,
    words: [
      "mot",
      "car detailing",
      "vehicle wrapping",
      "paint protection film",
      "window tinting",
      "alloy refurb",
      "ceramic coating",
      "bodyshop",
      "servicing and repairs",
      "valeting",
    ],
  },
  {
    trade: "automotive",
    weight: 2,
    words: ["garage", "vehicle", "car", "van", "tyres", "respray"],
  },
  {
    trade: "home-trades",
    weight: 5,
    words: [
      "gas safe",
      "niceic",
      "boiler install",
      "plastering",
      "bathroom fitting",
      "kitchen fitting",
      "roofing",
      "guttering",
      "landscaping",
      "driveway",
    ],
  },
  {
    trade: "home-trades",
    weight: 2,
    words: ["plumber", "electrician", "builder", "joiner", "decorator", "handyman"],
  },
  {
    trade: "health-beauty",
    weight: 5,
    words: [
      "lash extensions",
      "nail technician",
      "aesthetics clinic",
      "dermal filler",
      "massage therapy",
      "barbershop",
      "hair salon",
      "beauty salon",
      "waxing",
    ],
  },
  {
    trade: "health-beauty",
    weight: 2,
    words: ["salon", "clinic", "therapist", "treatment", "facial"],
  },
  {
    trade: "hospitality",
    weight: 5,
    words: [
      "book a table",
      "our menu",
      "takeaway",
      "restaurant",
      "catering",
      "bottomless brunch",
      "set menu",
      "dine in",
    ],
  },
  {
    trade: "hospitality",
    weight: 2,
    words: ["menu", "cafe", "kitchen", "bar", "food"],
  },
  {
    trade: "fitness",
    weight: 5,
    words: [
      "personal training",
      "gym membership",
      "class timetable",
      "strength and conditioning",
      "crossfit",
      "bootcamp",
      "pilates",
      "yoga studio",
    ],
  },
  { trade: "fitness", weight: 2, words: ["gym", "coach", "workout", "training"] },
  {
    trade: "professional-services",
    weight: 5,
    words: [
      "chartered accountant",
      "solicitor",
      "conveyancing",
      "tax return",
      "bookkeeping",
      "financial advice",
      "mortgage advice",
      "legal advice",
    ],
  },
  {
    trade: "property",
    weight: 5,
    words: [
      "estate agent",
      "lettings",
      "property management",
      "valuation",
      "landlord",
      "tenancy",
      "for sale by",
    ],
  },
  {
    trade: "retail-ecommerce",
    weight: 5,
    words: ["add to basket", "add to cart", "free delivery", "our shop", "checkout", "in stock"],
  },
];

/** Below this, the winner is not convincing enough to act on. */
const ENOUGH = 5;

/**
 * How far clear of second place the winner has to be.
 *
 * One strong word's worth. A gym with a cafe in it genuinely talks about
 * both, and a two-point lead is not a reason to hand them a page about
 * one of them — it is a reason to stay out of it and let somebody set it
 * by hand.
 */
const CLEAR_BY = 5;

export type TradeGuess = {
  trade: Trade;
  /** What it scored. Only useful for deciding whether to trust it. */
  score: number;
  /** The words that decided it, for showing somebody why. */
  because: string[];
};

/**
 * Reads a page and says what the business probably does.
 *
 * Counts each matching phrase once rather than per occurrence. A site
 * with "car" in a navigation bar repeated on every page would otherwise
 * beat one that says "chartered accountant" twice in the only place it
 * matters.
 */
export function guessTrade(text: string): TradeGuess {
  const hay = ` ${text.toLowerCase().replace(/\s+/g, " ")} `;

  const scores = new Map<Trade, number>();
  const hits = new Map<Trade, string[]>();

  for (const rule of RULES) {
    for (const word of rule.words) {
      if (!hay.includes(word)) continue;
      scores.set(rule.trade, (scores.get(rule.trade) ?? 0) + rule.weight);
      hits.set(rule.trade, [...(hits.get(rule.trade) ?? []), word]);
    }
  }

  let best: Trade = "general";
  let bestScore = 0;
  let runnerUp = 0;
  for (const [trade, score] of scores) {
    if (score > bestScore) {
      runnerUp = bestScore;
      bestScore = score;
      best = trade;
    } else if (score > runnerUp) {
      runnerUp = score;
    }
  }

  // A clear winner, or nothing. Two trades close together means the page
  // genuinely talks about both, and picking one is how a gym with a cafe
  // ends up being given a page about brunch.
  if (bestScore < ENOUGH || bestScore - runnerUp < CLEAR_BY) {
    return { trade: "general", score: bestScore, because: [] };
  }

  return { trade: best, score: bestScore, because: (hits.get(best) ?? []).slice(0, 4) };
}
