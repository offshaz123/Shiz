/**
 * Things a client can do this week to get more customers.
 *
 * Its own module with no imports, so it can be tested and so the page can
 * use it without dragging the database in.
 *
 * Two rules, and the whole thing is worthless without them.
 *
 * Nothing here claims a result. "Post a before-and-after" is advice
 * anybody can give and nobody can be wrong about. "Posting before-and-
 * afters gets you 40% more enquiries" is a number somebody made up, and
 * the first client who asks where it came from stops believing the rest
 * of the page. So every idea says what to do and why it tends to work in
 * plain terms, and not one of them carries a percentage.
 *
 * And the ones that end in "or we can do it for you" are marked as such.
 * A page of advice from an agency is a page of advertising wearing a hat,
 * and the honest version is to say which is which rather than hide the
 * selling inside the helping.
 */

export type Trade =
  | "automotive"
  | "home-trades"
  | "health-beauty"
  | "hospitality"
  | "fitness"
  | "professional-services"
  | "property"
  | "retail-ecommerce"
  | "general";

export const TRADES: readonly Trade[] = [
  "automotive",
  "home-trades",
  "health-beauty",
  "hospitality",
  "fitness",
  "professional-services",
  "property",
  "retail-ecommerce",
  "general",
];

export const TRADE_WORD: Record<Trade, string> = {
  automotive: "Motor trade",
  "home-trades": "Home and trade services",
  "health-beauty": "Health and beauty",
  hospitality: "Food and hospitality",
  fitness: "Gyms and fitness",
  "professional-services": "Professional services",
  property: "Property",
  "retail-ecommerce": "Retail and online",
  general: "Any business",
};

export function asTrade(value: string): Trade {
  return (TRADES as readonly string[]).includes(value) ? (value as Trade) : "general";
}

export type Idea = {
  id: string;
  /** Written as an instruction, because that is what it is. */
  title: string;
  body: string;
  /** Roughly what it will take out of their day. */
  effort: "ten minutes" | "an hour" | "an afternoon";
  /** Whether it ends with them asking us to do it. */
  cost: "free" | "ask-us";
  trade: Trade;
};

/**
 * The bank.
 *
 * Deliberately specific. "Engage with your audience" is the kind of
 * advice that gets read and never acted on; "photograph the worst car you
 * get in this week before you touch it" is one somebody can do on
 * Thursday.
 */
const IDEAS: Idea[] = [
  // ---- Anybody ----
  {
    id: "before-after",
    title: "Photograph one job before you start and after you finish",
    body: "Same angle, same spot, both pictures. Put the pair up as one post. People cannot picture what you do from a price list, and a pair of photos does it in two seconds without you writing anything clever.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "ask-reviews",
    title: "Ask your last five customers for a review",
    body: "Message them one at a time, by name, saying what you did for them. People answer a message that is obviously about them and ignore one that is obviously about everybody.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "google-photos",
    title: "Put ten new photos on your Google listing",
    body: "Your Google Business Profile is what somebody sees when they search your name, and an empty one tells them nothing. Your phone already has the photos on it.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "old-customers",
    title: "Ring ten customers you have not heard from in six months",
    body: "Not a sales call — ask how the work held up. Some of them will book something while you have got them on the phone, and the calls cost you nothing but the hour.",
    effort: "an hour",
    cost: "free",
    trade: "general",
  },
  {
    id: "quiet-day-offer",
    title: "Put an offer on your quietest day of the week",
    body: "Look at your diary, find the day that is always half empty, and knock something off that day only. A slot you did not fill earns nothing, so filling it at a discount is all upside.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "answer-faster",
    title: "Answer every enquiry the same day, even if the answer is “tomorrow”",
    body: "Most people asking you for a price are asking two or three others at the same time. A two-line holding message keeps you in it while you work out the real answer.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "tiktok-video",
    title: "Film thirty seconds of you actually working",
    body: "No talking needed, no script, no editing. One a week is a habit you can keep; one a day is a second job you will give up on.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },
  {
    id: "ask-us-video",
    title: "Have us film and edit a month of videos in one go",
    body: "We come out once, film a day's work, and cut it into a month of posts for TikTok, Instagram and your ads. If filming is the bit you never get round to, this is the bit to hand over.",
    effort: "an hour",
    cost: "ask-us",
    trade: "general",
  },
  {
    id: "ask-us-photos",
    title: "Get a proper set of photos taken of your work",
    body: "Phone photos are fine for a post and wrong for a website or an ad. A set of good ones gets used for years, on every page and every campaign.",
    effort: "an hour",
    cost: "ask-us",
    trade: "general",
  },
  {
    id: "referral-ask",
    title: "Tell every customer this week that you take recommendations",
    body: "Say it out loud as you finish: “if you know anyone who needs the same doing, send them my way.” Most people would recommend you and simply never think to.",
    effort: "ten minutes",
    cost: "free",
    trade: "general",
  },

  // ---- Motor trade ----
  {
    id: "auto-worst-car",
    title: "Photograph the worst car you get in this week before you touch it",
    body: "The muddier and more tired it starts, the bigger the difference at the end. You get one like that through the door most weeks and it costs you nothing but the thirty seconds to photograph it twice.",
    effort: "ten minutes",
    cost: "free",
    trade: "automotive",
  },
  {
    id: "auto-plate-blur",
    title: "Post the car, not the number plate",
    body: "Blur or crop every plate before anything goes up. Customers notice when you do and it makes them more willing to let you photograph theirs.",
    effort: "ten minutes",
    cost: "free",
    trade: "automotive",
  },
  {
    id: "auto-winter",
    title: "Offer a winter check on the quiet weeks",
    body: "Lights, tyres, battery, screenwash — twenty minutes of work for a fixed small price. It fills dead days and half of them turn into something bigger once the car is on the ramp.",
    effort: "an hour",
    cost: "free",
    trade: "automotive",
  },

  // ---- Home and trade services ----
  {
    id: "trade-van",
    title: "Park where your next customer lives",
    body: "A signwritten van sat outside a job for two days is an advert to the whole street. Leaflet the six houses either side while you are there — they have just watched you work.",
    effort: "ten minutes",
    cost: "free",
    trade: "home-trades",
  },
  {
    id: "trade-finished",
    title: "Photograph every finished job, even the boring ones",
    body: "A tidy job in somebody's house is what people are buying. Build a folder of them and you will never be stuck for something to post or to show a customer who is wavering.",
    effort: "ten minutes",
    cost: "free",
    trade: "home-trades",
  },

  // ---- Health and beauty ----
  {
    id: "beauty-rebook",
    title: "Rebook them before they leave the chair",
    body: "Ask for the next appointment while they are still sat there and happy. It is the easiest booking you will ever take and it stops them drifting somewhere else in six weeks.",
    effort: "ten minutes",
    cost: "free",
    trade: "health-beauty",
  },
  {
    id: "beauty-quiet",
    title: "Fill your quiet hours with a midweek price",
    body: "Tuesday morning at a lower price is money you were not going to make. Keep the weekend rate exactly where it is.",
    effort: "ten minutes",
    cost: "free",
    trade: "health-beauty",
  },

  // ---- Food and hospitality ----
  {
    id: "food-dish",
    title: "Film one dish being plated, close up",
    body: "Overhead, good light, no talking. You make it twenty times a night anyway, so the filming costs you nothing you were not already doing.",
    effort: "ten minutes",
    cost: "free",
    trade: "hospitality",
  },
  {
    id: "food-quiet-night",
    title: "Build something around your quietest night",
    body: "A set menu or a deal that only exists on a Tuesday. An empty table earns nothing, and people will change which night they come out for a reason to.",
    effort: "an hour",
    cost: "free",
    trade: "hospitality",
  },

  // ---- Gyms and fitness ----
  {
    id: "fitness-member",
    title: "Film a member, not the equipment",
    body: "With their say-so. Every gym has much the same kit, so the thing that is yours and nobody else's is who is in it.",
    effort: "ten minutes",
    cost: "free",
    trade: "fitness",
  },
  {
    id: "fitness-bring-friend",
    title: "Give every member a free week to hand to a friend",
    body: "Something physical or a code with their name on it. It gives a member a reason to bring somebody, which is a conversation you are not part of and could not buy.",
    effort: "an hour",
    cost: "free",
    trade: "fitness",
  },

  // ---- Professional services ----
  {
    id: "pro-question",
    title: "Answer the question you get asked every week, in writing",
    body: "The one you explain on the phone over and over. Put it on your website in plain words. It saves you the call and it is exactly what people are searching for.",
    effort: "an hour",
    cost: "free",
    trade: "professional-services",
  },

  // ---- Property ----
  {
    id: "property-walkthrough",
    title: "Walk through one property on video, talking",
    body: "Phone held steady, say what you would say if somebody were stood next to you. It answers the questions a listing leaves open, which is why half of them ring you anyway.",
    effort: "ten minutes",
    cost: "free",
    trade: "property",
  },

  // ---- Retail and online ----
  {
    id: "retail-bestseller",
    title: "Post your best seller again",
    body: "The thing that already sells is the thing to show. Most of the people following you now were not following you the last time you posted it.",
    effort: "ten minutes",
    cost: "free",
    trade: "retail-ecommerce",
  },
];

/** Days since the epoch, in local time. */
function dayNumber(date: Date): number {
  return Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86_400_000,
  );
}

/**
 * What a business is shown, and in what order.
 *
 * Their own trade first, then the ones anybody can use, rotated on the
 * date so the top of the page is different on Thursday from how it was
 * on Monday. Rotated rather than random: the same business opening the
 * page twice in an afternoon should see the same thing, or the page
 * looks broken.
 *
 * The ones that end in asking us are held back to one. A list where
 * every other item is "pay us to do it" is a brochure.
 */
export function ideasFor(trade: Trade, on: Date = new Date(), count = 5): Idea[] {
  const mine = IDEAS.filter((idea) => idea.trade === trade && idea.cost === "free");
  const anyone = IDEAS.filter((idea) => idea.trade === "general" && idea.cost === "free");
  const askUs = IDEAS.filter((idea) => idea.cost === "ask-us");

  const turn = (list: Idea[], by: number) =>
    list.length === 0 ? [] : list.map((_, i) => list[(i + by) % list.length]);

  const day = dayNumber(on);
  const free = [...turn(mine, day), ...turn(anyone, day)];
  const one = askUs.length > 0 ? [askUs[day % askUs.length]] : [];

  // The paid one sits third rather than first or last: first reads as a
  // sales pitch, last never gets seen.
  const picked = free.slice(0, Math.max(0, count - one.length));
  return [...picked.slice(0, 2), ...one, ...picked.slice(2)];
}
