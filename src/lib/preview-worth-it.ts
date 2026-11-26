import type { Prospect } from "./prospect-types";

/**
 * Who gets a page built for them, and who just gets the email.
 *
 * Building one costs a fetch of their site at the moment the link is
 * opened, and thirty seconds of somebody's attention if it is ever
 * looked at. Neither is much, but doing it for every business on a list
 * of hundreds is work spent on companies nobody will ever ring.
 *
 * So it goes to the ones worth winning. The test is not "could we build
 * them something", it is "would we be pleased if this one replied".
 *
 * Its own module with no imports but the type, because it is policy
 * rather than plumbing and because it is the line most likely to move
 * once there is a month of replies to look at.
 */

/** Below this, their site is bad enough that a rebuild is an argument. */
export const WORST_SCORE = 50;

/** Reviews are the cheapest proof a business is busy, and busy pays. */
export const LEAST_REVIEWS = 5;

export type NotWorthIt =
  | "no-website"
  | "never-scanned"
  | "site-is-fine"
  | "too-quiet"
  | "no-findings";

/**
 * Why this business is not getting one, or null when it is.
 *
 * Returns the reason rather than a boolean so the admin page can say
 * "their site scored 68" instead of leaving somebody wondering why the
 * button did nothing.
 */
export function previewProblem(p: Prospect): NotWorthIt | null {
  // The no-website version of this page is a different thing and is not
  // switched on. Nothing here applies to them.
  if (!p.website.trim()) return "no-website";

  // Without a scan there is no score to argue from and no list of what
  // we changed, which is the half of the page that does the work.
  if (p.scannedAt === null || p.siteScore === null) return "never-scanned";
  if (p.findings.length === 0) return "no-findings";

  if (p.siteScore >= WORST_SCORE) return "site-is-fine";
  if (p.reviews < LEAST_REVIEWS) return "too-quiet";

  return null;
}

export function worthAPreview(p: Prospect): boolean {
  return previewProblem(p) === null;
}

/**
 * Could a page be built for this business at all, setting aside whether
 * it is the best use of the effort.
 *
 * The looser of the two tests. worthAPreview asks "would we be pleased if
 * this one replied"; this one asks only whether there is a site to rebuild
 * and something to say about it. Walid wants a fixed share of every batch
 * to go out with a link in it — seven in twenty — and on a day when the
 * list does not hold seven businesses worth winning, these are the ones
 * that make up the number. A site scoring 58 is a weaker argument than one
 * scoring 31, not an impossible one.
 */
export function canBuildPreview(p: Prospect): boolean {
  const problem = previewProblem(p);
  return problem === null || problem === "site-is-fine" || problem === "too-quiet";
}

/** What the admin page says when the answer is no. */
export function previewWords(reason: NotWorthIt, p: Prospect): string {
  switch (reason) {
    case "no-website":
      return "No website to rebuild. These get a call rather than a page.";
    case "never-scanned":
      return "Not scanned yet, so there is nothing to compare against.";
    case "no-findings":
      return "The scan found nothing wrong, so there is nothing to show them.";
    case "site-is-fine":
      return `Their site scored ${p.siteScore} out of 100. A rebuild is not much of an argument above ${WORST_SCORE}.`;
    case "too-quiet":
      return `Only ${p.reviews} review${p.reviews === 1 ? "" : "s"}. Under ${LEAST_REVIEWS} there is little sign they are busy enough to buy.`;
  }
}
