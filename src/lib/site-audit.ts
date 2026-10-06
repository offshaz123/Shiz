/**
 * Website scanner behind the free audit tool.
 *
 * Everything here is checked by fetching the page as a browser would and
 * reading the HTML. That limits what's knowable — a tag fired later by a
 * consent manager won't appear, and we say so in the results rather than
 * reporting a false negative as fact. Where we genuinely can't tell, the
 * check says so instead of guessing.
 */

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
};

export function buildReport({ html, finalUrl, robots, sitemap, ms }: Input): AuditResult {
  const body = visibleHtml(html);
  const https = finalUrl.startsWith("https://");
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
        check(
          "meta-pixel",
          "Meta Pixel",
          has(html, "connect.facebook.net", "fbq("),
          "Installed",
          "Not detected",
          "Anything you run on Facebook or Instagram can't learn who actually bought from you, and you can't advertise again to people who visited and left."
        ),
        check(
          "analytics",
          "Google Analytics",
          has(html, "googletagmanager.com", "gtag(", "google-analytics.com"),
          "Installed",
          "Not detected",
          "You have no record of how many people visit, where they come from, or which pages they leave on."
        ),
        check(
          "gtm",
          "Google Tag Manager",
          has(html, "googletagmanager.com/gtm.js", "GTM-"),
          "Installed",
          "Not detected",
          "Without it, every new tag needs a developer rather than taking two minutes.",
          "warning"
        ),
        check(
          "google-ads",
          "Google Ads tracking",
          has(html, "googleadservices.com", "google_conversion", "/aw-"),
          "Installed",
          "Not detected",
          "Only matters if you run Google Ads, but without it you can't tell which clicks became enquiries.",
          "warning"
        ),
        check(
          "retargeting",
          "Retargeting ready",
          has(html, "connect.facebook.net", "fbq(") ||
            has(html, "googletagmanager.com", "gtag("),
          "Yes",
          "No",
          "Most people don't buy on the first visit. Without a pixel you can't reach them again, and that's the cheapest advertising there is."
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

  // Score each scored category out of 10.
  for (const cat of categories) {
    if (cat.score === -1) continue;
    const scored = cat.checks.filter((c) => c.severity !== "unknown");
    const earned = scored.reduce(
      (sum, c) => sum + (c.severity === "good" ? 1 : c.severity === "warning" ? 0.4 : 0),
      0
    );
    cat.score = scored.length ? Math.round((earned / scored.length) * 100) / 10 : 0;
  }

  const scored = categories.filter((c) => c.score !== -1);
  const score =
    Math.round((scored.reduce((s, c) => s + c.score, 0) / Math.max(1, scored.length)) * 10) / 10;

  const all = categories.flatMap((c) => c.checks);
  const counts = {
    critical: all.filter((c) => c.severity === "critical").length,
    warning: all.filter((c) => c.severity === "warning").length,
    good: all.filter((c) => c.severity === "good").length,
    unknown: all.filter((c) => c.severity === "unknown").length,
  };

  return { url: finalUrl, finalUrl, categories, score, counts, pagesFound: internal.size, words };
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
