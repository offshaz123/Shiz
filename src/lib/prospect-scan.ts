import { buildReport, type AuditCheck } from "./site-audit";
import { fetchForAudit } from "./scan-site";

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

export function extractEmail(html: string): string {
  const candidates: string[] = [];

  for (const m of html.matchAll(/mailto:([^"'?>\s]+)/gi)) {
    candidates.push(decodeURIComponent(m[1]));
  }
  for (const m of html.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}/g)) {
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

    return { score: report.score, findings, email: extractEmail(page.html) };
  } catch {
    return null;
  }
}
