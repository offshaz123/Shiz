/**
 * Website scanner behind the free audit tool.
 *
 * Everything here is checked by fetching the page as a browser would and
 * reading the HTML. That limits what's knowable — a tag fired later by a
 * consent manager won't appear, and we say so in the results rather than
 * reporting a false negative as fact.
 */

export type Severity = "critical" | "warning" | "good";

export type AuditCheck = {
  id: string;
  label: string;
  severity: Severity;
  detail: string;
  /** What it costs them, in plain words. Omitted when the check passed. */
  why?: string;
};

export type AuditResult = {
  url: string;
  finalUrl: string;
  checks: AuditCheck[];
  score: number;
  counts: { critical: number; warning: number; good: number };
};

const has = (html: string, ...needles: string[]) =>
  needles.some((n) => html.toLowerCase().includes(n.toLowerCase()));

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "\u2013", mdash: "\u2014", hellip: "\u2026",
  lsquo: "\u2018", rsquo: "\u2019", ldquo: "\u201c", rdquo: "\u201d",
  pound: "\u00a3", eacute: "\u00e9",
};

/** Titles and descriptions get shown back to the person, so decode entities. */
function decode(input: string): string {
  return input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED[name.toLowerCase()] ?? match);
}

function text(html: string, pattern: RegExp): string | null {
  const m = html.match(pattern);
  return m ? decode(m[1]).replace(/\s+/g, " ").trim() : null;
}

/** Strips script and style blocks so we don't match on code when reading copy. */
function visibleHtml(html: string) {
  return html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

export function runChecks(
  html: string,
  finalUrl: string,
  extras: { robots: boolean; sitemap: boolean; ms: number }
): AuditCheck[] {
  const checks: AuditCheck[] = [];
  const body = visibleHtml(html);
  const add = (c: AuditCheck) => checks.push(c);

  // --- Tracking -----------------------------------------------------------
  const pixel = has(html, "connect.facebook.net", "fbq(", "facebook-jssdk");
  add({
    id: "meta-pixel",
    label: "Meta Pixel",
    severity: pixel ? "good" : "critical",
    detail: pixel
      ? "Found on the page."
      : "Not found anywhere on the page.",
    why: pixel
      ? undefined
      : "Without it, anything you run on Facebook or Instagram can't learn who actually bought from you, and you can't advertise again to people who visited and left.",
  });

  const ga = has(html, "googletagmanager.com", "gtag(", "google-analytics.com");
  add({
    id: "analytics",
    label: "Google Analytics",
    severity: ga ? "good" : "critical",
    detail: ga ? "Found on the page." : "Not found anywhere on the page.",
    why: ga
      ? undefined
      : "You have no record of how many people visit, where they come from, or which pages they leave on.",
  });

  const gads = has(html, "googleadservices.com", "google_conversion", "aw-");
  add({
    id: "google-ads-tag",
    label: "Google Ads conversion tracking",
    severity: gads ? "good" : "warning",
    detail: gads ? "Found on the page." : "Not found.",
    why: gads
      ? undefined
      : "Only matters if you run Google Ads, but without it you can't tell which clicks turned into enquiries.",
  });

  // --- How Google sees the page ------------------------------------------
  const title = text(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  add({
    id: "title",
    label: "Page title",
    severity: !title ? "critical" : title.length > 60 || title.length < 15 ? "warning" : "good",
    detail: title
      ? `"${title.slice(0, 90)}" (${title.length} characters)`
      : "Missing.",
    why: !title
      ? "This is the line Google shows in search results. Without it, Google writes its own."
      : title.length > 60
        ? "Over 60 characters usually gets cut off in search results, so the end is lost."
        : title.length < 15
          ? "Very short, so it's probably not saying what you do or where you are."
          : undefined,
  });

  const desc = text(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  add({
    id: "description",
    label: "Meta description",
    severity: !desc ? "warning" : desc.length > 170 || desc.length < 70 ? "warning" : "good",
    detail: desc ? `${desc.length} characters` : "Missing.",
    why: !desc
      ? "This is the paragraph under your link in search results. Without it Google picks a sentence at random from your page."
      : desc.length > 170
        ? "Too long, so it gets cut off before the end."
        : desc.length < 70
          ? "Short enough that it's probably not doing much persuading."
          : undefined,
  });

  const h1s = body.match(/<h1[\s>]/gi)?.length ?? 0;
  add({
    id: "h1",
    label: "Main heading",
    severity: h1s === 1 ? "good" : "warning",
    detail: h1s === 0 ? "No main heading found." : `${h1s} main headings found.`,
    why:
      h1s === 0
        ? "Search engines use the main heading to work out what the page is about."
        : h1s > 1
          ? "More than one main heading muddies what the page is about."
          : undefined,
  });

  const canonical = has(html, 'rel="canonical"', "rel='canonical'");
  add({
    id: "canonical",
    label: "Canonical tag",
    severity: canonical ? "good" : "warning",
    detail: canonical ? "Present." : "Missing.",
    why: canonical
      ? undefined
      : "Helps stop Google treating several versions of the same page as duplicates.",
  });

  const schema = has(html, "application/ld+json");
  add({
    id: "schema",
    label: "Structured data",
    severity: schema ? "good" : "warning",
    detail: schema ? "Found." : "None found.",
    why: schema
      ? undefined
      : "This is what tells Google your business name, address, phone and opening hours in a form it can read. It also feeds AI answers.",
  });

  // --- Sharing ------------------------------------------------------------
  const ogTitle = has(html, 'property="og:title"', "property='og:title'");
  const ogImg = has(html, 'property="og:image"', "property='og:image'");
  add({
    id: "og",
    label: "Social sharing preview",
    severity: ogTitle && ogImg ? "good" : "warning",
    detail: ogImg ? "Image and title set." : ogTitle ? "Title set but no image." : "Not set up.",
    why:
      ogTitle && ogImg
        ? undefined
        : "When someone shares your link on WhatsApp, Facebook or LinkedIn it appears as a plain grey box with no picture.",
  });

  // --- Getting in touch ---------------------------------------------------
  const tel = /href=(?:["\\'\\\\]*)tel:/i.test(html);
  add({
    id: "phone",
    label: "Tappable phone number",
    severity: tel ? "good" : "critical",
    detail: tel ? "Found." : "No tappable phone number found.",
    why: tel
      ? undefined
      : "On a phone, a number people can tap to call is the difference between an enquiry and a lost one.",
  });

  const wa = has(html, "wa.me", "api.whatsapp.com", "web.whatsapp.com", "whatsapp://send");
  add({
    id: "whatsapp",
    label: "WhatsApp link",
    severity: wa ? "good" : "warning",
    detail: wa ? "Found." : "Not found.",
    why: wa ? undefined : "Plenty of people will message who would never fill in a form or ring.",
  });

  const form = /<form[\s>]/i.test(body);
  add({
    id: "form",
    label: "Enquiry form",
    severity: form ? "good" : "warning",
    detail: form ? "Found on this page." : "None found on the homepage.",
    why: form ? undefined : "Nothing here captures somebody who isn't ready to ring you yet.",
  });

  // --- Technical ----------------------------------------------------------
  const https = finalUrl.startsWith("https://");
  add({
    id: "https",
    label: "Secure connection",
    severity: https ? "good" : "critical",
    detail: https ? "Site loads over HTTPS." : "Site is not using HTTPS.",
    why: https
      ? undefined
      : "Browsers show a 'Not secure' warning, which costs you enquiries and hurts your ranking.",
  });

  const mixed = https && /<(?:img|script|link)[^>]+(?:src|href)=["']http:\/\//i.test(html);
  if (mixed) {
    add({
      id: "mixed-content",
      label: "Insecure content",
      severity: "warning",
      detail: "Some images or scripts load over an insecure connection.",
      why: "Browsers may block them, and it can break how the page looks.",
    });
  }

  const viewport = has(html, 'name="viewport"', "name='viewport'");
  add({
    id: "viewport",
    label: "Mobile friendly",
    severity: viewport ? "good" : "critical",
    detail: viewport ? "Mobile viewport set." : "No mobile viewport setting found.",
    why: viewport
      ? undefined
      : "The page won't resize properly on a phone, which is where most of your visitors are.",
  });

  const imgs = body.match(/<img[^>]*>/gi) ?? [];
  const noAlt = imgs.filter((i) => !/\salt\s*=/i.test(i)).length;
  if (imgs.length > 0) {
    add({
      id: "alt-text",
      label: "Image descriptions",
      severity: noAlt === 0 ? "good" : noAlt > imgs.length / 2 ? "warning" : "good",
      detail: `${noAlt} of ${imgs.length} images have no description.`,
      why:
        noAlt > imgs.length / 2
          ? "Search engines can't read pictures, and screen readers can't describe them."
          : undefined,
    });
  }

  add({
    id: "speed",
    label: "Server response",
    severity: extras.ms < 800 ? "good" : extras.ms < 2000 ? "warning" : "critical",
    detail: `Page responded in ${(extras.ms / 1000).toFixed(1)} seconds.`,
    why:
      extras.ms >= 800
        ? "Slow pages lose visitors before they've seen anything, and Google counts it against you."
        : undefined,
  });

  add({
    id: "sitemap",
    label: "Sitemap",
    severity: extras.sitemap ? "good" : "warning",
    detail: extras.sitemap ? "Found at /sitemap.xml." : "Not found at /sitemap.xml.",
    why: extras.sitemap
      ? undefined
      : "A sitemap tells Google which pages you have. Without one it has to find them on its own.",
  });

  add({
    id: "robots",
    label: "Robots file",
    severity: extras.robots ? "good" : "warning",
    detail: extras.robots ? "Found at /robots.txt." : "Not found at /robots.txt.",
    why: extras.robots
      ? undefined
      : "This file tells search engines what they can and can't look at.",
  });

  return checks;
}

export function scoreChecks(checks: AuditCheck[]) {
  const counts = {
    critical: checks.filter((c) => c.severity === "critical").length,
    warning: checks.filter((c) => c.severity === "warning").length,
    good: checks.filter((c) => c.severity === "good").length,
  };
  const score = Math.max(
    0,
    Math.round(100 - counts.critical * 12 - counts.warning * 4)
  );
  return { counts, score };
}
