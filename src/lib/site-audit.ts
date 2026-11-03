/**
 * Website scanner behind the free audit tool.
 *
 * Everything here is checked by fetching the page as a browser would and
 * reading the HTML. That limits what's knowable — a tag fired later by a
 * consent manager won't appear, and we say so in the results rather than
 * reporting a false negative as fact. Where we genuinely can't tell, the
 * check says so instead of guessing.
 *
 * The one exception is the Google Business Profile section, which comes from
 * the Places API rather than the page. It is only included when a listing
 * could be matched to the domain with certainty — see google-business.ts.
 */

import type { GoogleBusiness, GoogleBusinessLookup } from "./google-business";

export type Severity = "critical" | "warning" | "good" | "unknown";

export type AuditCheck = {
  id: string;
  label: string;
  value: string;
  severity: Severity;
  /** What it costs them, in plain words. Omitted when nothing is wrong. */
  why?: string;
};

export type AuditCategory = {
  id: string;
  name: string;
  score: number;
  checks: AuditCheck[];
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  categories: AuditCategory[];
  score: number;
  counts: { critical: number; warning: number; good: number; unknown: number };
  pagesFound: number;
  words: number;
  /**
   * The Google listing's own score, when there is one. Deliberately kept out
   * of `score` above: see the note where the headline is worked out.
   */
  googleScore?: number;
  /**
   * The Google listing we matched to this domain, when we matched one. Kept
   * alongside the checks because the facts on it — the name Google shows, the
   * phone number, the link to the listing itself — are worth reading straight
   * rather than only as pass-or-fail rows.
   */
  googleBusiness?: GoogleBusiness;
};

const has = (html: string, ...needles: string[]) =>
  needles.some((n) => html.toLowerCase().includes(n.toLowerCase()));

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "\u2013", mdash: "\u2014", hellip: "\u2026",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d",
  pound: "\u00a3", eacute: "\u00e9",
};

function decode(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED[name.toLowerCase()] ?? m);
}

function text(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? decode(m[1]).replace(/\s+/g, " ").trim() : null;
}

/** Strips script and style blocks so we don't read copy out of code. */
function visibleHtml(html: string) {
  return html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

type Input = {
  html: string;
  finalUrl: string;
  robots: boolean;
  sitemap: boolean;
  ms: number;
  /** Omitted when the Places lookup isn't configured or didn't get to run. */
  google?: GoogleBusinessLookup;
};

export function buildReport({ html, finalUrl, robots, sitemap, ms, google }: Input): AuditResult {
  const body = visibleHtml(html);
  const https = finalUrl.startsWith("https://");
  const consentGated = has(html, ...CONSENT_SIGNALS);
  const host = (() => {
    try {
      return new URL(finalUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const words = body
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1).length;

  const internal = new Set(
    (html.match(/href="([^"]+)"/g) ?? [])
      .map((h) => h.slice(6, -1))
      .filter((h) => h.startsWith("/") || (host && h.includes(host)))
      .map((h) => h.split("#")[0].split("?")[0].replace(/\/$/, ""))
      .filter((h) => h && !/\.(jpg|jpeg|png|gif|svg|webp|css|js|pdf|ico|xml)$/i.test(h))
  );

  const imgs = body.match(/<img[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((i) => !/\salt\s*=/i.test(i)).length;
  const title = text(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = text(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const h1s = body.match(/<h1[\s>]/gi)?.length ?? 0;

  /**
   * Google Ads conversion tracking. The conversion ID is matched case-sensitively
   * as a whole word, because "aw-" on its own appears inside ordinary English —
   * "law-firm", "raw-data" — and was quietly passing sites that run no ads.
   */
  const googleAds =
    has(html, "googleadservices.com", "googleads.g.doubleclick.net", "google_conversion") ||
    /\bAW-\d{6,}\b/.test(html);

  const cms = has(html, "wp-content", "wp-includes")
    ? "WordPress"
    : has(html, "cdn.shopify.com", "shopify")
      ? "Shopify"
      : has(html, "wixstatic", "wix.com")
        ? "Wix"
        : has(html, "squarespace")
          ? "Squarespace"
          : has(html, "_next/static")
            ? "Next.js"
            : "Not detected";

  const categories: AuditCategory[] = [
    {
      id: "tracking",
      name: "Tracking & Advertising",
      score: 0,
      checks: [
        trackingCheck(
          "meta-pixel",
          "Meta Pixel",
          has(html, "connect.facebook.net", "fbq("),
          "Installed",
          "Not detected",
          "Anything you run on Facebook or Instagram can't learn who actually bought from you, and you can't advertise again to people who visited and left.",
          consentGated
        ),
        trackingCheck(
          "analytics",
          "Google Analytics",
          has(html, "googletagmanager.com", "gtag(", "google-analytics.com"),
          "Installed",
          "Not detected",
          "You have no record of how many people visit, where they come from, or which pages they leave on.",
          consentGated
        ),
        trackingCheck(
          "gtm",
          "Google Tag Manager",
          has(html, "googletagmanager.com/gtm.js", "GTM-"),
          "Installed",
          "Not detected",
          "Without it, every new tag needs a developer rather than taking two minutes.",
          consentGated,
          "warning"
        ),
        trackingCheck(
          "google-ads",
          "Google Ads tracking",
          googleAds,
          "Installed",
          "Not detected",
          "Only matters if you run Google Ads, but without it you can't tell which clicks became enquiries.",
          consentGated,
          "warning"
        ),
        trackingCheck(
          "retargeting",
          "Retargeting ready",
          has(html, "connect.facebook.net", "fbq(") ||
            has(html, "googletagmanager.com", "gtag("),
          "Yes",
          "No",
          "Most people don't buy on the first visit. Without a pixel you can't reach them again, and that's the cheapest advertising there is.",
          consentGated
        ),
      ],
    },
    {
      id: "seo",
      name: "On-Page SEO",
      score: 0,
      checks: [
        check(
          "title",
          "Page title",
          !!title && title.length >= 15 && title.length <= 60,
          title ? `"${title.slice(0, 70)}" (${title.length} chars)` : "Missing",
          title ? `"${title.slice(0, 70)}" (${title.length} chars)` : "Missing",
          !title
            ? "This is the line Google shows in search results. Without it Google writes its own."
            : title.length > 60
              ? "Over 60 characters gets cut off in search results, so the end is lost."
              : "Short enough that it's probably not saying what you do or where you are.",
          title ? "warning" : "critical"
        ),
        check(
          "description",
          "Meta description",
          !!desc && desc.length >= 70 && desc.length <= 170,
          desc ? `${desc.length} characters` : "Missing",
          desc ? `${desc.length} characters` : "Missing",
          !desc
            ? "This is the paragraph under your link in search results. Without it Google picks a sentence at random."
            : desc.length > 170
              ? "Too long, so it gets cut off before the end."
              : "Short enough that it isn't doing much persuading.",
          "warning"
        ),
        check(
          "h1",
          "Main heading",
          h1s === 1,
          "One, as it should be",
          h1s === 0 ? "None found" : `${h1s} found`,
          h1s === 0
            ? "Search engines use the main heading to work out what the page is about."
            : "More than one main heading muddies what the page is about.",
          "warning"
        ),
        check("canonical", "Canonical tag", has(html, 'rel="canonical"', "rel='canonical'"),
          "Present", "Missing",
          "Helps stop Google treating several versions of the same page as duplicates.", "warning"),
        check("schema", "Structured data", has(html, "application/ld+json"),
          "Found", "None found",
          "This tells Google your business name, address, phone and hours in a form it can read. It also feeds AI answers."),
        check("alt", "Image descriptions",
          imgs.length === 0 || noAlt <= imgs.length / 2,
          imgs.length === 0 ? "No images on this page" : `${imgs.length - noAlt} of ${imgs.length} described`,
          `${noAlt} of ${imgs.length} missing`,
          "Search engines can't read pictures and screen readers can't describe them.", "warning"),
        check("content", "Amount of content", words >= 300,
          `${words.toLocaleString()} words on this page`,
          `${words.toLocaleString()} words on this page`,
          "Thin pages give Google very little to rank you for.", "warning"),
      ],
    },
    {
      id: "contact",
      name: "Getting In Touch",
      score: 0,
      checks: [
        check("phone", "Tappable phone number", /href=(?:["'\\]*)tel:/i.test(html),
          "Found", "Not found",
          "On a phone, a number people can tap is the difference between an enquiry and a lost one."),
        check("whatsapp", "WhatsApp link",
          has(html, "wa.me", "api.whatsapp.com", "web.whatsapp.com", "whatsapp://send"),
          "Found", "Not found",
          "Plenty of people will message who would never fill in a form or ring.", "warning"),
        check("email", "Email address", /href=(?:["'\\]*)mailto:/i.test(html),
          "Found", "Not found",
          "Some people want to email rather than ring or fill anything in.", "warning"),
        check("form", "Enquiry form", /<form[\s>]/i.test(body),
          "Found on this page", "None on this page",
          "Nothing here captures somebody who isn't ready to ring you yet."),
        check("chat", "Live chat or chatbot",
          has(html, "tawk.to", "intercom", "crisp.chat", "livechat", "tidio", "drift.com", "hubspot-messages"),
          "Found", "Not detected",
          "A chat widget catches people who have one question and won't ring to ask it.", "warning"),
        check("booking", "Online booking",
          has(html, "calendly", "acuityscheduling", "booksy", "fresha", "setmore", "simplybook", "squareup.com/appointments"),
          "Found", "Not detected",
          "If people can book themselves in, you stop losing the ones who ring outside working hours.", "warning"),
      ],
    },
    {
      id: "presence",
      name: "Online Presence",
      score: 0,
      checks: [
        check("facebook", "Facebook page linked", has(html, "facebook.com/"),
          "Linked", "Not linked",
          "People check social profiles before enquiring, and a missing link means they go looking elsewhere.", "warning"),
        check("instagram", "Instagram linked", has(html, "instagram.com/"),
          "Linked", "Not linked",
          "Your profile is where people check whether the business looks alive.", "warning"),
        check("og", "Social sharing preview",
          has(html, 'property="og:image"', "property='og:image'"),
          "Image and title set", "Not set up",
          "When someone shares your link on WhatsApp or Facebook it appears as a plain grey box with no picture.", "warning"),
        check("reviews", "Reviews shown on site",
          has(html, "trustpilot", "reviews.io", "feefo", "google review", "yotpo", "trustindex"),
          "Found", "Not detected",
          "Reviews on your own site do the convincing while you're asleep.", "warning"),
        check("blog", "Blog or news section",
          internalHas(internal, "blog", "news", "articles"),
          "Found", "Not detected",
          "Regular content is what gets you found for the questions people search before they buy.", "warning"),
      ],
    },
    {
      id: "fundamentals",
      name: "Website Fundamentals",
      score: 0,
      checks: [
        check("https", "Secure connection", https, "HTTPS enabled", "Not secure",
          "Browsers show a 'Not secure' warning, which costs you enquiries and hurts your ranking."),
        check("viewport", "Mobile friendly",
          has(html, 'name="viewport"', "name='viewport'"),
          "Optimised", "Not set up",
          "The page won't resize properly on a phone, which is where most of your visitors are."),
        check("speed", "Server response", ms < 800,
          `${(ms / 1000).toFixed(1)} seconds`, `${(ms / 1000).toFixed(1)} seconds`,
          "Slow pages lose visitors before they've seen anything, and Google counts it against you.",
          ms < 2000 ? "warning" : "critical"),
        check("favicon", "Favicon",
          has(html, 'rel="icon"', "rel='icon'", "shortcut icon", "apple-touch-icon"),
          "Detected", "Missing",
          "The little icon on the browser tab. Missing one looks unfinished.", "warning"),
        check("mixed", "Secure content",
          !(https && /<(?:img|script|link)[^>]+(?:src|href)=["']http:\/\//i.test(html)),
          "All secure", "Some insecure files",
          "Browsers may block images or scripts loading insecurely, which can break how the page looks.",
          "warning"),
        check("sitemap", "Sitemap", sitemap, "Found", "Not found",
          "A sitemap tells Google which pages you have. Without one it has to find them on its own.", "warning"),
        check("robots", "Robots file", robots, "Found", "Not found",
          "This tells search engines what they can and can't look at.", "warning"),
      ],
    },
    {
      id: "info",
      name: "Website Information",
      score: -1,
      checks: [
        unknownCheck("cms", "Platform", cms),
        unknownCheck("pages", "Pages discovered", `${internal.size || 1}+ pages found`),
        unknownCheck("words-info", "Content on this page", `${words.toLocaleString()} words`),
        unknownCheck("response", "Checked", "Just now"),
      ],
    },
  ];

  // The Google listing section, when there is one to show. Slotted in before
  // the information panel so the scored sections stay together.
  const googleCat = googleCategory(google);
  if (googleCat) categories.splice(categories.length - 1, 0, googleCat);

  // Score each scored category out of 10.
  for (const cat of categories) {
    if (cat.score === -1) continue;
    const scored = cat.checks.filter((c) => c.severity !== "unknown");
    const earned = scored.reduce(
      (sum, c) => sum + (c.severity === "good" ? 1 : c.severity === "warning" ? 0.4 : 0),
      0
    );
    // Nothing scoreable means nothing to score — not nought out of ten. A
    // site that gates every tag behind a cookie banner leaves the whole
    // tracking category unknown, and marking that zero would punish it for
    // something we were simply not allowed to see. -1 drops the category from
    // the overall average and hides its ring, the same as the info panel.
    cat.score = scored.length ? Math.round((earned / scored.length) * 100) / 10 : -1;
  }

  // The headline score is the WEBSITE, and only the website.
  //
  // Averaging the Google listing into it hides the thing we were asked to
  // look at: a valeting firm we scanned has a 6.2 website and a 10/10
  // listing, and blended that reads 6.8 — their good listing quietly
  // covering for the site. The listing gets its own number instead, so both
  // are visible and neither flatters the other.
  const scored = categories.filter((c) => c.score !== -1 && c.id !== "google");
  const score =
    Math.round((scored.reduce((s, c) => s + c.score, 0) / Math.max(1, scored.length)) * 10) / 10;

  const googleCategoryScore = categories.find((c) => c.id === "google")?.score ?? -1;

  const all = categories.flatMap((c) => c.checks);
  const counts = {
    critical: all.filter((c) => c.severity === "critical").length,
    warning: all.filter((c) => c.severity === "warning").length,
    good: all.filter((c) => c.severity === "good").length,
    unknown: all.filter((c) => c.severity === "unknown").length,
  };

  return {
    url: finalUrl,
    finalUrl,
    categories,
    score,
    counts,
    pagesFound: internal.size,
    words,
    ...(googleCategoryScore >= 0 ? { googleScore: googleCategoryScore } : {}),
    ...(google?.status === "ok" ? { googleBusiness: google.business } : {}),
  };
}

/**
 * The Google Business Profile section.
 *
 * Returns null when there is nothing honest to put in it — no API key, no
 * budget left, or a Google error — because an empty section with an apology in
 * it tells a visitor nothing and makes the report look broken.
 *
 * When we searched and found no listing linking this domain, we do show a
 * section, but it holds a single row that says exactly that and the whole
 * section is left unscored. Two very different things produce that result —
 * having no listing at all, and having one that doesn't link the site — and
 * from out here we cannot tell which, so we don't pretend to.
 */
function googleCategory(google?: GoogleBusinessLookup): AuditCategory | null {
  if (!google || google.status === "unavailable") return null;

  if (google.status === "no_match") {
    return {
      id: "google",
      name: "Google Business Profile",
      score: -1,
      checks: [
        unknownCheck(
          "g-listing",
          "Google listing",
          "Couldn't match one to this website"
        ),
        unknownCheck(
          "g-listing-why",
          "What that means",
          "Either there isn't a listing, or there is one and it doesn't link this site. Both are worth sorting — the map results are where most local searches end up."
        ),
      ],
    };
  }

  const b = google.business;
  const months = monthsSince(b.latestReviewAt);
  const checks: AuditCheck[] = [];

  if (b.closed) {
    checks.push({
      id: "g-closed",
      label: "Listing status",
      value: "Marked closed on Google",
      severity: "critical",
      why: "Google is telling everyone who searches that this business has shut. Nothing else on the listing matters until that's corrected.",
    });
  }

  checks.push({
    id: "g-reviews",
    label: "Google reviews",
    value: b.reviews === 1 ? "1 review" : `${b.reviews} reviews`,
    severity: b.reviews >= 25 ? "good" : b.reviews >= 5 ? "warning" : "critical",
    ...(b.reviews >= 25
      ? {}
      : {
          why:
            b.reviews === 0
              ? "With no reviews at all, anyone comparing you to a competitor on the map has nothing to go on but the competitor's."
              : "Review count is one of the things people sort by and one of the things Google weighs. Fewer than a rival nearby means being skipped before being read.",
        }),
  });

  checks.push(
    b.rating === null
      ? unknownCheck("g-rating", "Star rating", "No rating yet")
      : {
          id: "g-rating",
          label: "Star rating",
          value: `${b.rating.toFixed(1)} out of 5`,
          severity: b.rating >= 4.5 ? "good" : b.rating >= 4 ? "warning" : "critical",
          ...(b.rating >= 4.5
            ? {}
            : {
                why: "Below about four and a half stars, people start reading the bad reviews instead of ringing. Replying to them publicly is usually the quickest fix.",
              }),
        }
  );

  checks.push(
    months === null
      ? unknownCheck("g-review-age", "Most recent review", "Nothing to read yet")
      : {
          id: "g-review-age",
          label: "Most recent review",
          value: months === 0 ? "Within the last month" : months === 1 ? "A month ago" : `About ${months} months ago`,
          severity: months <= 3 ? "good" : months <= 9 ? "warning" : "critical",
          ...(months <= 3
            ? {}
            : {
                why: "A listing whose newest review is old reads as a business that has gone quiet, whatever the star rating says.",
              }),
        }
  );

  checks.push({
    id: "g-photos",
    label: "Photos on the listing",
    value: b.photos === 0 ? "None" : `${b.photos}${b.photos >= 10 ? "+" : ""}`,
    severity: b.photos >= 5 ? "good" : b.photos >= 1 ? "warning" : "critical",
    ...(b.photos >= 5
      ? {}
      : {
          why: "Photos are the first thing anyone looks at in the map results, and for this kind of work the before-and-afters are the sell.",
        }),
  });

  checks.push({
    id: "g-phone",
    label: "Phone number on the listing",
    value: b.phone || "Not on the listing",
    severity: b.phone ? "good" : "critical",
    ...(b.phone ? {} : { why: "The call button is the whole point of the listing on a phone. Without a number there isn't one." }),
  });

  checks.push({
    id: "g-hours",
    label: "Opening hours",
    value: b.hasHours ? "Published" : "Not published",
    severity: b.hasHours ? "good" : "warning",
    ...(b.hasHours
      ? {}
      : {
          why: "Google shows \"Hours not available\", and it stops the listing appearing for anyone filtering by open now.",
        }),
  });

  if (b.category) {
    checks.push(unknownCheck("g-category", "Google's category for you", b.category));
  }
  if (b.name) {
    checks.push(unknownCheck("g-name", "Listed as", b.name));
  }

  return { id: "google", name: "Google Business Profile", score: 0, checks };
}

/** Whole months between a timestamp and now, or null if there isn't one. */
function monthsSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const days = (Date.now() - then) / 86_400_000;
  if (days < 0) return 0;
  return Math.floor(days / 30.44);
}

function internalHas(links: Set<string>, ...words: string[]) {
  return [...links].some((l) => words.some((w) => l.toLowerCase().includes(w)));
}

function check(
  id: string,
  label: string,
  pass: boolean,
  goodValue: string,
  badValue: string,
  why: string,
  failSeverity: Severity = "critical"
): AuditCheck {
  return pass
    ? { id, label, value: goodValue, severity: "good" }
    : { id, label, value: badValue, severity: failSeverity, why };
}

function unknownCheck(id: string, label: string, value: string): AuditCheck {
  return { id, label, value, severity: "unknown" };
}

/**
 * Signs that a site asks for cookie consent before it loads anything.
 *
 * Either a named consent platform, one of the standard consent APIs, or the
 * plain-HTML controls a hand-built banner leaves behind. A cookie policy link
 * on its own is deliberately not in here: plenty of sites link one and still
 * fire every tag on arrival, so it proves nothing.
 */
const CONSENT_SIGNALS = [
  // Consent platforms
  "cookiebot",
  "onetrust",
  "optanon",
  "usercentrics",
  "iubenda",
  "termly",
  "cookieyes",
  "osano",
  "klaro",
  "complianz",
  "borlabs",
  "cookie-script",
  "civicuk",
  // IAB's Transparency and Consent Framework, and Google's consent mode
  "__tcfapi",
  "gtag('consent'",
  'gtag("consent"',
  // A banner or preferences control written by hand
  "cookie settings",
  "cookie preferences",
  "manage cookies",
  "accept all cookies",
  "we use cookies",
];

/**
 * A tracking check that knows the difference between "not there" and
 * "not there yet".
 *
 * We read the page the way a browser first loads it. On a site that gates its
 * tags behind a cookie banner, nothing has been allowed to run at that point,
 * so a missing pixel means we cannot see it rather than that it is absent.
 * Reporting that as a failure would mark a site down for doing the right
 * thing, and would tell its owner to fix something that is not broken.
 *
 * So when consent is in use and the tag is not visible, the check says it
 * cannot tell. Unknown checks are left out of the score entirely, which is
 * the honest treatment: we neither reward nor punish what we could not see.
 */
function trackingCheck(
  id: string,
  label: string,
  pass: boolean,
  goodValue: string,
  badValue: string,
  why: string,
  consentGated: boolean,
  failSeverity: Severity = "critical"
): AuditCheck {
  if (pass) return { id, label, value: goodValue, severity: "good" };
  if (consentGated) {
    return {
      id,
      label,
      value: "Can't tell \u2014 cookie consent in use",
      severity: "unknown",
      why: "Your cookie banner holds tags back until someone accepts, so we can't see this one from outside. Worth confirming it fires once consent is given.",
    };
  }
  return { id, label, value: badValue, severity: failSeverity, why };
}

/** How much a check contributes, out of 1. Unknown checks are not scored. */
function weightOf(severity: Severity): number {
  return severity === "good" ? 1 : severity === "warning" ? 0.4 : 0;
}

/**
 * Rescores a finished report as though the named checks had passed.
 *
 * This is what the admin's comparison tool uses to answer "and if we fixed
 * these?". It is deliberately the same arithmetic as the real scoring above
 * rather than a second copy of it, so the projected figure is the score the
 * site would genuinely get on a re-scan.
 *
 * Worth being clear about what it does and does not claim. It projects a
 * score, which is arithmetic we control and can show our working for. It
 * says nothing about enquiries, rankings or revenue, because nobody can
 * know those from a page scan and a made-up number in front of a customer
 * is worse than no number at all.
 */
export function projectedScore(categories: AuditCategory[], fixedIds: Set<string>): number {
  const scores = categories
    // The Google listing is scored separately and isn't in the headline, so
    // it mustn't be in the projection of the headline either.
    .filter((cat) => cat.id !== "google")
    .map((cat) => {
      const scored = cat.checks.filter((c) => c.severity !== "unknown");
      if (scored.length === 0) return -1;
      const earned = scored.reduce(
        (sum, c) => sum + (fixedIds.has(c.id) ? 1 : weightOf(c.severity)),
        0,
      );
      return Math.round((earned / scored.length) * 100) / 10;
    })
    .filter((n) => n !== -1);

  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}
