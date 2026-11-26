/**
 * Pulling a business out of its own website.
 *
 * The scanner already downloads the whole homepage to run its checks, then
 * keeps three findings and throws the rest away. Inside that page is the
 * business itself: its name, its logo, its own words for what it does, its
 * photographs, its phone number. Everything needed to show somebody their
 * own site rebuilt, rather than a template with their name dropped into it.
 *
 * Nothing here is invented. Every field comes off their page or comes back
 * empty, because the whole pitch is "this is yours, working properly", and
 * one made-up service on a page with their name at the top ends that
 * conversation before it starts.
 *
 * Pure string work, no network, so it can be tested against saved pages
 * without waiting on anybody's server.
 */

export type Rebuilt = {
  /** What they call themselves. */
  name: string;
  /** The one line under the name, in their words. */
  tagline: string;
  /** Absolute URL of their logo, when the page makes one obvious. */
  logo: string;
  /** What they do, in their own headings. At most six. */
  services: string[];
  /** Absolute URLs of photographs worth showing, biggest first. At most six.
   *  Never includes the logo, so the hero cannot end up being it. */
  images: string[];
  /** The colour the site itself declares, for the rebuilt page to borrow. */
  colour: string;
  phone: string;
  email: string;
  /** A paragraph about them, theirs. */
  about: string;
  /** The offer bar off the top of their own site, where they run one.
   *  Theirs, word for word, so the rebuilt page is not inventing a sale. */
  promo: string;
  /** The year they say they started, when the page says it. */
  since: string;
  /** What their own page claims about reviews, when it claims anything.
   *  Read from schema.org markup, which is the only place on a page where
   *  these two numbers mean what they say. */
  rating: string;
  reviewCount: string;
};

const EMPTY: Rebuilt = {
  name: "",
  tagline: "",
  logo: "",
  services: [],
  images: [],
  colour: "",
  phone: "",
  email: "",
  about: "",
  promo: "",
  since: "",
  rating: "",
  reviewCount: "",
};

/** Tags whose contents are never page text. */
function stripNoise(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

/** HTML to the words a person would read. */
export function text(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  const raw = (m?.[2] ?? m?.[3] ?? m?.[4] ?? "").trim();
  // An address written in HTML has its ampersands escaped, so a lazy-loaded
  // image comes out as ...?url=x&amp;w=3840 and fetches nothing. Decoded
  // here rather than at every call site, because every attribute this file
  // reads is either a URL or a piece of text and both want it.
  return raw
    .replace(/&amp;/gi, "&")
    .replace(/&#38;/g, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'");
}

/** One meta tag's content, by name or property. */
function meta(html: string, key: string): string {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const which = (attr(tag, "property") || attr(tag, "name")).toLowerCase();
    if (which === key.toLowerCase()) return text(attr(tag, "content"));
  }
  return "";
}

/** Relative to absolute, dropping anything that is not a real address. */
export function absolute(url: string, base: string): string {
  if (!url) return "";
  if (url.startsWith("data:")) return "";
  try {
    return new URL(url, base).toString();
  } catch {
    return "";
  }
}

/** The contents of every tag of one kind. */
function all(html: string, tag: string): string[] {
  const found = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi")) ?? [];
  return found.map((one) => text(one)).filter(Boolean);
}

/**
 * Their name.
 *
 * og:site_name first because it is the one field on a page that exists to
 * answer this. The title is next but has to be cut down: half the web ships
 * "Barton Tyres | Tyre Fitting in Manchester | Cheap Tyres Near You", and
 * only the first part of that is a name.
 */
function nameOf(html: string): string {
  const site = meta(html, "og:site_name");
  if (site) return site;

  const title = text((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? "");
  if (title) {
    const first = title.split(/\s*[|–—:]\s*/)[0]?.trim();
    // A first part that is plainly a slogan rather than a name.
    if (first && first.length >= 2 && first.length <= 60) return first;
  }

  const [h1] = all(html, "h1");
  return h1 && h1.length <= 60 ? h1 : "";
}

/** The line under the name: what they say about themselves, briefly. */
function taglineOf(html: string): string {
  for (const key of ["og:description", "description", "twitter:description"]) {
    const found = meta(html, key);
    if (found.length >= 20 && found.length <= 200) return found;
  }
  const [h1] = all(html, "h1");
  return h1 && h1.length <= 160 ? h1 : "";
}

/**
 * Their logo.
 *
 * An image whose own markup says it is one, which is how nearly every site
 * labels it, then the social preview image as a fallback. The social image
 * is often a photograph rather than a logo, so it is the second choice.
 */
function logoOf(html: string, base: string): string {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const tag of imgs) {
    const hay = `${attr(tag, "src")} ${attr(tag, "alt")} ${attr(tag, "class")} ${attr(tag, "id")}`;
    if (/logo|brand/i.test(hay)) {
      const src = absolute(attr(tag, "src") || attr(tag, "data-src"), base);
      if (src) return src;
    }
  }
  return absolute(meta(html, "og:image"), base);
}

/** Words that are navigation furniture rather than something they sell. */
const NOT_A_SERVICE =
  /^(home|about|about us|contact|contact us|menu|blog|news|gallery|faqs?|reviews|testimonials|privacy|terms|cookies|basket|cart|checkout|log ?in|sign ?up|search|more|next|previous|back|read more|learn more|get in touch|book now|call us|follow us|newsletter|subscribe)$/i;

/**
 * Headings that are the furniture of a page rather than a thing they sell.
 *
 * The first version put "why choose us" and "our working process" on the
 * rebuilt page as though they were services, which is exactly the sort of
 * detail that tells somebody a machine made it. Matched loosely because
 * every site words them slightly differently.
 */
const SECTION_HEADING =
  /^(why (choose|use) us|our (working )?process|how it works|what we do|our services|services|our work|our team|meet the team|opening (hours|times)|find us|where we are|latest|recent work|get a quote|free quote|pricing|our prices)\b/i;

/** "Prices start from £50" and "Prices start from £100" are one heading
 *  repeated down a price list, not two different services. */
function familyOf(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[£$€]\s?[\d,.]+/g, "")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * What they do, taken from their own headings.
 *
 * Headings rather than navigation, because a nav is mostly furniture and
 * the headings down a homepage are almost always the services, in the
 * order the business itself thinks they matter.
 */
function servicesOf(html: string): string[] {
  const seen = new Set<string>();
  const families = new Set<string>();
  const out: string[] = [];
  for (const heading of [...all(html, "h2"), ...all(html, "h3")]) {
    const clean = heading.replace(/\s+/g, " ").trim();
    const key = clean.toLowerCase();
    if (!clean || clean.length < 3 || clean.length > 60) continue;
    if (NOT_A_SERVICE.test(key) || SECTION_HEADING.test(key) || seen.has(key)) continue;
    // One per family, so a price list does not fill the whole section.
    const family = familyOf(clean);
    if (family.length < 3 || families.has(family)) continue;
    seen.add(key);
    families.add(family);
    out.push(clean);
    if (out.length === 6) break;
  }
  return out;
}

/** Tells an icon, a tracking pixel or a payment badge from a photograph. */
const NOT_A_PHOTO = /icon|sprite|logo|badge|pixel|spacer|placeholder|avatar|flag|payment|visa|mastercard|paypal|klarna|stripe|trustpilot|\.svg(\?|$)/i;

function imagesOf(html: string, base: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const raw = attr(tag, "src") || attr(tag, "data-src") || attr(tag, "data-lazy-src");
    const src = absolute(raw, base);
    if (!src || seen.has(src) || NOT_A_PHOTO.test(src)) continue;
    // Anything the page itself declares as tiny is furniture.
    const w = Number(attr(tag, "width") || 0);
    const h = Number(attr(tag, "height") || 0);
    if ((w && w < 150) || (h && h < 150)) continue;
    seen.add(src);
    out.push(src);
    if (out.length === 6) break;
  }
  return out;
}

/** The colour the site declares for itself, so the rebuild is recognisably theirs. */
function colourOf(html: string): string {
  const declared = meta(html, "theme-color");
  if (/^#[0-9a-f]{3,8}$/i.test(declared)) return declared;

  // Otherwise the most-used hex in the page's own inline styles, which is
  // usually the brand colour because it is on every button.
  const counts = new Map<string, number>();
  for (const hex of html.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
    const key = hex.toLowerCase();
    // Black, white and the near-greys are not a brand colour.
    const r = parseInt(key.slice(1, 3), 16);
    const g = parseInt(key.slice(3, 5), 16);
    const b = parseInt(key.slice(5, 7), 16);
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    if (spread < 24) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best = "";
  let most = 0;
  for (const [hex, n] of counts) {
    if (n > most) {
      most = n;
      best = hex;
    }
  }
  return best;
}

function phoneOf(html: string): string {
  const tel = html.match(/href\s*=\s*["']tel:([^"']+)["']/i);
  if (tel) return decodeURIComponent(tel[1]).replace(/\s+/g, " ").trim();
  const loose = text(stripNoise(html)).match(/\b0\d[\d\s()-]{8,13}\d\b/);
  return loose ? loose[0].replace(/\s+/g, " ").trim() : "";
}

function emailOf(html: string): string {
  const mailto = html.match(/href\s*=\s*["']mailto:([^"'?]+)/i);
  return mailto ? mailto[1].trim().toLowerCase() : "";
}

/**
 * A paragraph about them.
 *
 * The longest one on the page that reads like prose. Short paragraphs are
 * captions and labels; very long ones are terms and conditions.
 */
function aboutOf(html: string): string {
  let best = "";
  for (const para of all(html, "p")) {
    if (para.length < 80 || para.length > 500) continue;
    if (/cookie|privacy|terms|copyright|all rights reserved/i.test(para)) continue;
    if (para.length > best.length) best = para;
  }
  return best;
}

/**
 * The offer they are already running, off the bar at the top of their site.
 *
 * Taken word for word rather than written, because an offer is a promise
 * about money and the only safe one to put on a mock-up of their site is
 * the one they are making themselves.
 */
const OFFER = /(\d+\s?%\s?off|free (uk )?(tracked )?delivery|free (quote|survey|consultation|fitting)|same day|next day|\bsale\b|discount code|use code)/i;

function promoOf(html: string): string {
  // The usual places a site puts one, in the order they are usually used.
  const bars =
    html.match(
      /<(div|p|span|section|header|aside)\b[^>]*(announcement|promo|topbar|top-bar|offer|banner|ticker|marquee)[^>]*>([\s\S]{0,400}?)<\/\1>/gi,
    ) ?? [];
  for (const bar of bars) {
    const words = text(bar);
    if (words.length >= 8 && words.length <= 140 && OFFER.test(words)) return words;
  }
  return "";
}

/** The year they say they started. */
function sinceOf(html: string): string {
  const m = text(html).match(/\b(?:since|established|est\.?|trading since)\s+((?:19|20)\d{2})\b/i);
  if (!m) return "";
  const year = Number(m[1]);
  const now = new Date().getFullYear();
  return year >= 1900 && year <= now ? m[1] : "";
}

/**
 * Their own review numbers, from schema.org markup only.
 *
 * Loose text matching finds "4.9" next to the word reviews on pages where
 * it means something else entirely, and a wrong star rating on a page with
 * their name on it is worse than no star rating.
 */
function reviewsOf(html: string): { rating: string; count: string } {
  const rating = html.match(/"ratingValue"\s*:\s*"?([0-9](?:\.[0-9])?)"?/i);
  const count = html.match(/"(?:reviewCount|ratingCount)"\s*:\s*"?(\d{1,6})"?/i);
  return { rating: rating?.[1] ?? "", count: count?.[1] ?? "" };
}

/**
 * Their other pages, worth reading for the rebuild.
 *
 * The homepage alone gives one screen of material, which is why the
 * first rebuilt version read as a leaflet next to a real website. A
 * services page and an about page have the words a business actually
 * uses about itself, and pictures the homepage never shows.
 *
 * Same site only, three at most, and each kind only once. Following
 * every link on a site would be a crawl, which is a different thing
 * from reading the few pages a person would read.
 */
const WORTH_READING: { kind: string; test: RegExp }[] = [
  { kind: "services", test: /\/(services?|what-we-do|treatments?|products?|shop|packages?|pricing|prices)(\/|$|\?)/i },
  { kind: "about", test: /\/(about|about-us|our-story|who-we-are|meet-the-team)(\/|$|\?)/i },
  { kind: "gallery", test: /\/(gallery|portfolio|our-work|projects?|case-stud|examples?)(\/|$|\?)/i },
];

export function otherPages(html: string, baseUrl: string): string[] {
  let origin = "";
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }

  const taken = new Set<string>();
  const out: string[] = [];
  const clean = stripNoise(html);

  for (const m of clean.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
    const href = absolute(m[1], baseUrl);
    if (!href || !href.startsWith(origin)) continue;
    // Files are not pages.
    if (/\.(pdf|jpe?g|png|gif|webp|svg|zip|docx?|xlsx?)(\?|$)/i.test(href)) continue;

    const path = href.slice(origin.length) || "/";
    const match = WORTH_READING.find((w) => w.test.test(path));
    if (!match || taken.has(match.kind) || out.includes(href)) continue;

    taken.add(match.kind);
    out.push(href);
    if (out.length === 3) break;
  }
  return out;
}

/**
 * Two pages of theirs, read as one business.
 *
 * The homepage decides the name, the look and the headline, because
 * that is what it is for. Everything countable — services, pictures —
 * is added to from the rest, because more of their own material is
 * exactly what the rebuild was short of.
 */
export function merge(main: Rebuilt, extra: Rebuilt[]): Rebuilt {
  const services = [...main.services];
  const images = [...main.images];

  for (const other of extra) {
    for (const s of other.services) {
      if (services.length < 9 && !services.some((have) => have.toLowerCase() === s.toLowerCase())) {
        services.push(s);
      }
    }
    for (const src of other.images) {
      if (images.length < 12 && !images.includes(src) && src !== main.logo) images.push(src);
    }
  }

  return {
    ...main,
    services,
    images,
    // The longest honest paragraph about them, wherever it was found.
    about: [main.about, ...extra.map((e) => e.about)].reduce(
      (best, one) => (one.length > best.length ? one : best),
      "",
    ),
    phone: main.phone || extra.map((e) => e.phone).find(Boolean) || "",
    email: main.email || extra.map((e) => e.email).find(Boolean) || "",
  };
}

/**
 * Everything the rebuilt page needs, off their own homepage.
 *
 * Never throws and never guesses. A field it cannot find comes back empty
 * and the page simply leaves that part out.
 */
export function rebuildFrom(html: string, baseUrl: string): Rebuilt {
  if (!html || html.length < 200) return EMPTY;
  const clean = stripNoise(html);

  const logo = logoOf(clean, baseUrl);
  // The social preview image is very often the logo on a coloured
  // background. Behind a hero heading that reads as a mistake, so anything
  // the page uses as its logo is kept out of the photographs.
  const images = imagesOf(clean, baseUrl).filter((src) => src !== logo);

  return {
    name: nameOf(clean),
    tagline: taglineOf(clean),
    logo,
    services: servicesOf(clean),
    images,
    // Colour reads the raw page: the brand hex usually lives in a style
    // block, which stripNoise has just removed.
    colour: colourOf(html),
    phone: phoneOf(clean),
    email: emailOf(clean),
    about: aboutOf(clean),
    promo: promoOf(clean),
    since: sinceOf(clean),
    // Reads the raw page: schema markup lives in a script tag, which
    // stripNoise has just taken out.
    rating: reviewsOf(html).rating,
    reviewCount: reviewsOf(html).count,
  };
}
