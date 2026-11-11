import { buildReport, type AuditCheck } from "./site-audit";
import { fetchForAudit, fetchExtraPage } from "./scan-site";

/**
 * Scanning a prospect's website before you ring them.
 *
 * The point of this is the opening line of a cold call. "Hi, I had a look at
 * your site and there's no way to track where your enquiries come from" is a
 * conversation. "Hi, I do marketing" is not. So every prospect the finder
 * turns up gets scanned, and the call list shows what is wrong with each one
 * before the phone is picked up.
 *
 * Deliberately no Google Places lookup here, unlike the free audit. The
 * prospect finder already fetched the listing — reviews, rating, hours — when
 * it found the business, so calling Places again would spend the monthly
 * budget twice over for facts we are already holding.
 */

const TIMEOUT_MS = 10_000;

/** How many problems to carry into the call list. Three is what fits in a row
 *  and roughly what anyone can hold in their head while dialling. */
const MAX_FINDINGS = 3;

export type ProspectFinding = {
  label: string;
  /** What it costs them, in plain words. From the audit's own wording. */
  why: string;
};

export type ProspectScan = {
  score: number;
  findings: ProspectFinding[];
  /** Their published contact address, when the page carries one. */
  email: string;
};

/**
 * Pulls a contact address out of the page we have already downloaded.
 *
 * Places does not return emails, so the alternative is not having one. A
 * mailto: link is taken first because it is unambiguous; loose text matches
 * are a fallback and get filtered hard, since an image filename or a
 * tracking script will otherwise pass for an address.
 */
const JUNK = [
  "example.", "sentry", "wixpress", "squarespace", "godaddy", "@2x", "@3x",
  "noreply", "no-reply", "donotreply", "@sentry", "yourdomain", "domain.com",
  "email.com", "@adobe", "@google", "core-js", ".png", ".jpg", ".jpeg",
  ".webp", ".gif", ".svg", ".js", ".css",
];

/** Placeholder addresses that templates ship with. Matched on the local part
 *  so a real firm at one of these domains is not ruled out. */
const PLACEHOLDER_LOCAL = /^(you|your|yourname|name|someone|user|username|email|firstname)@/;

/**
 * Cloudflare's email obfuscation, undone.
 *
 * Sites behind Cloudflare with Email Address Obfuscation switched on have
 * their addresses replaced by <a href="/cdn-cgi/l/email-protection#<hex>">,
 * which is a single XOR key followed by the address, byte by byte. The real
 * address is right there in the page and we were walking past it. It is not
 * encryption and undoing it is not a bypass of anything — the site's own
 * JavaScript does exactly this for every visitor.
 */
function decodeCloudflare(hex: string): string {
  try {
    const key = parseInt(hex.slice(0, 2), 16);
    let out = "";
    for (let i = 2; i < hex.length; i += 2) {
      out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
    }
    return out;
  } catch {
    return "";
  }
}

/**
 * The addresses people write out to dodge scrapers: "info (at) example dot
 * co dot uk". A person reads that as an email address, so for the purpose of
 * "do they publish a way to contact them", so do we.
 */
function deobfuscate(html: string): string {
  return html
    .replace(/\s*[([{<]\s*(?:at|@)\s*[)\]}>]\s*/gi, "@")
    .replace(/\s+(?:at)\s+/gi, "@")
    .replace(/\s*[([{<]\s*dot\s*[)\]}>]\s*/gi, ".")
    .replace(/\s+dot\s+/gi, ".");
}

export function extractEmail(html: string): string {
  const candidates: string[] = [];

  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) {
    candidates.push(decodeURIComponent(m[1]));
  }
  // Cloudflare's obfuscated form, in both the places it appears.
  for (const m of html.matchAll(/data-cfemail="([0-9a-f]+)"/gi)) {
    candidates.push(decodeCloudflare(m[1]));
  }
  for (const m of html.matchAll(/email-protection#([0-9a-f]+)/gi)) {
    candidates.push(decodeCloudflare(m[1]));
  }
  for (const m of html.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}/g)) {
    candidates.push(m[0]);
  }
  // Last, and only over the visible text, because running the "(at)" rules
  // over markup turns attributes into things that look like addresses.
  const words = deobfuscate(html.replace(/<[^>]+>/g, " "));
  for (const m of words.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}/g)) {
    candidates.push(m[0]);
  }

  const seen = new Set<string>();
  const clean = candidates
    // Trailing punctuation, quotes and escape slashes come from the markup
    // the address was lifted out of, not from the address.
    .map((e) => e.trim().toLowerCase().replace(/^[\\"'<(]+/, "").replace(/[\\"'>).,;:]+$/, ""))
    .filter((e) => {
      if (e.length < 6 || e.length > 190 || !e.includes("@")) return false;
      if (JUNK.some((j) => e.includes(j))) return false;
      if (PLACEHOLDER_LOCAL.test(e)) return false;
      if (seen.has(e)) return false;
      seen.add(e);
      return true;
    });

  // info@ and similar first: a generic business inbox is both the one they
  // published to be written to and the least personal data to be holding.
  const preferred = clean.find((e) => /^(info|hello|sales|enquiries|enquiry|contact|admin|bookings)@/.test(e));
  return preferred ?? clean[0] ?? "";
}

/**
 * Pages worth a second look when the homepage carries no address.
 *
 * Most businesses do not put their email on the front page; they put it on
 * the contact page, and the homepage links to it. Reading only the homepage
 * is why this came back empty for sites that plainly do publish an address.
 *
 * Links are taken from the page itself rather than guessed at, so we only
 * ever ask for a URL the site says exists, and only on the same host.
 */
const CONTACT_WORDS = /contact|get-in-touch|getintouch|enquir|about|reach-us|book/i;
const MAX_EXTRA_PAGES = 2;

function contactLinks(html: string, base: URL): URL[] {
  const found: URL[] = [];
  const seen = new Set<string>();

  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
    const raw = m[1];
    if (!CONTACT_WORDS.test(raw)) continue;
    let url: URL;
    try {
      url = new URL(raw, base);
    } catch {
      continue;
    }
    // Same site only. Following a "contact" link off to someone else's
    // domain would collect an address belonging to a different business.
    if (url.hostname.replace(/^www\./, "") !== base.hostname.replace(/^www\./, "")) continue;
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    const key = url.toString();
    if (seen.has(key) || key === base.toString()) continue;
    seen.add(key);
    found.push(url);
    if (found.length >= MAX_EXTRA_PAGES) break;
  }

  return found;
}

/** Critical first, then warnings. Within a severity, the audit's own order. */
function worstFirst(checks: AuditCheck[]): AuditCheck[] {
  const rank = (c: AuditCheck) => (c.severity === "critical" ? 0 : c.severity === "warning" ? 1 : 2);
  return checks.filter((c) => c.severity === "critical" || c.severity === "warning").sort((a, b) => rank(a) - rank(b));
}

/**
 * Returns null when the site cannot be read at all — no site, dead domain,
 * not HTML, timed out. That is not a failure worth surfacing as an error: a
 * prospect with no working website is a prospect, and arguably a better one.
 */
export async function scanProspectSite(website: string): Promise<ProspectScan | null> {
  if (!website.trim()) return null;

  try {
    const page = await fetchForAudit(website, TIMEOUT_MS);
    const report = buildReport({
      html: page.html,
      finalUrl: page.finalUrl,
      robots: page.robots,
      sitemap: page.sitemap,
      ms: page.ms,
      // No google: see the note at the top.
    });

    const findings = worstFirst(report.categories.flatMap((c) => c.checks))
      .slice(0, MAX_FINDINGS)
      .map((c) => ({ label: c.label, why: c.why ?? "" }));

    // The homepage first, then the contact page if it had nothing. Two extra
    // requests at most, and only for the sites that need them: this runs in
    // batches on hosting with a hard process ceiling, so it must stay cheap
    // for the sites where the front page already has an address.
    let email = extractEmail(page.html);
    if (!email) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        for (const link of contactLinks(page.html, new URL(page.finalUrl))) {
          const extra = await fetchExtraPage(link, controller.signal);
          if (!extra) continue;
          email = extractEmail(extra);
          if (email) break;
        }
      } catch {
        // A contact page that will not load is not a failed scan.
      } finally {
        clearTimeout(timer);
      }
    }

    return { score: report.score, findings, email };
  } catch {
    return null;
  }
}
