/**
 * The shape of a prospect, and the statuses one can be in.
 *
 * Separate from prospects.ts on purpose. That file opens a MySQL connection,
 * and the call-list UI needs the status list at runtime to draw its buttons —
 * importing it from there pulls the whole database driver into the browser
 * bundle, which fails the build outright. Types alone would have been erased;
 * STATUSES is a real value, so it has to live somewhere the client can reach.
 */

export const STATUSES = [
  "new",
  "called",
  "interested",
  "not-interested",
  "no-answer",
  "customer",
] as const;

export type ProspectStatus = (typeof STATUSES)[number];

export function isStatus(value: unknown): value is ProspectStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

/** Mirrors ProspectFinding in prospect-scan.ts. Repeated here rather than
 *  imported because that module reaches the network, and this one is read by
 *  the browser. */
export type ProspectFinding = { label: string; why: string };

export type Prospect = {
  id: number;
  placeId: string;
  name: string;
  phone: string;
  /** Published on their site, when they publish one. */
  email: string;
  website: string;
  address: string;
  category: string;
  mapsUri: string;
  reviews: number;
  rating: number | null;
  siteScore: number | null;
  /** The worst few things the scanner found on their site, for the call. */
  findings: ProspectFinding[];
  /** Null until the site has been scanned at all. */
  scannedAt: string | null;
  status: ProspectStatus;
  notes: string;
  calledAt: string | null;
  /** When an email was last sent to them from the admin page. */
  emailedAt: string | null;
  /** Set when the first email was sent by hand, which is what starts the two
   *  that follow on their own. Null means no sequence is running. */
  sequenceStartedAt: string | null;
  sequenceStoppedAt: string | null;
  /** Why it stopped: replied, unsubscribed, stopped by hand, and so on. */
  sequenceStopReason: string;
  repliedAt: string | null;
  unsubscribedAt: string | null;
  /** Signed one-click unsubscribe link for this business, minted on the
   *  server. Empty when there is no CRON_SECRET to sign with, in which case
   *  no email links to a page that could not work. */
  unsubscribeUrl: string;
  /** How many emails have actually gone to them. On the row, because
   *  "have we written to this business, and how often" is the first thing
   *  anybody wants to know and the last thing worth hiding. */
  emailCount: number;
  foundFor: string;
  /** Which of the site's industries this was found under. */
  industry: string;
  /** The town the search that found them was run in. */
  town: string;
};
