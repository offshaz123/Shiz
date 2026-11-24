/**
 * The shape of a prospect, and the statuses one can be in.
 *
 * Separate from prospects.ts on purpose. That file opens a MySQL connection,
 * and the call-list UI needs the status list at runtime to draw its buttons —
 * importing it from there pulls the whole database driver into the browser
 * bundle, which fails the build outright. Types alone would have been erased;
 * STATUSES is a real value, so it has to live somewhere the client can reach.
 */

import type { Region } from "./regions";

export const STATUSES = [
  "new",
  "called",
  "interested",
  "not-interested",
  "no-answer",
  "customer",
] as const;

export type ProspectStatus = (typeof STATUSES)[number];

/**
 * How a call went.
 *
 * Separate from the status on purpose: the status is where the business has
 * got to overall, a call outcome is what happened on one attempt. Three "no
 * answer" calls and then a conversation is a story the status alone cannot
 * tell.
 */
export const CALL_OUTCOMES = [
  "spoke",
  "no-answer",
  "voicemail",
  "call-back",
  "gatekeeper",
  "wrong-number",
  "bad-number",
  "not-interested",
] as const;

export type CallOutcome = (typeof CALL_OUTCOMES)[number];

export const CALL_LABEL: Record<CallOutcome, string> = {
  spoke: "Spoke to them",
  "no-answer": "No answer",
  voicemail: "Left a voicemail",
  "call-back": "Asked to call back",
  gatekeeper: "Got the gatekeeper",
  "wrong-number": "Wrong number",
  // Different from a wrong number, and the difference matters. A wrong
  // number reaches somebody else; this one reaches nobody — dead line,
  // number unobtainable, a digit short. Nothing is learnt about the
  // business, so its status is left alone, but the number is marked so
  // the list stops handing it out and the next person does not waste
  // the same thirty seconds.
  "bad-number": "Number doesn't work",
  "not-interested": "Not interested",
};

/**
 * What a call row says it was, including the ones not chosen from the
 * list above.
 *
 * A call logged the moment somebody presses Call has no outcome yet —
 * it has not happened. Showing that as "No answer" would be the system
 * inventing a fact about a business, which is the one thing a call
 * record must never do.
 */
export const NOT_WRITTEN_UP = "pending";

export function callLabel(outcome: string): string {
  if (outcome === NOT_WRITTEN_UP) return "Not written up yet";
  return CALL_LABEL[outcome as CallOutcome] ?? outcome;
}

export function isCallOutcome(value: unknown): value is CallOutcome {
  return typeof value === "string" && (CALL_OUTCOMES as readonly string[]).includes(value);
}

export type ProspectCall = {
  /** One of CALL_OUTCOMES, or "pending" for a call that was placed and
   *  has not been written up yet. Read it through callLabel rather than
   *  looking it up in CALL_LABEL. */
  outcome: string;
  notes: string;
  minutes: number | null;
  caller: string;
  calledAt: string;
};

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
  /** Set when that address has been proved not to work: a bounce came back,
   *  or its domain has no mail server. The address is kept so the call list
   *  can say which one failed. */
  emailDeadAt: string | null;
  /** The receiving server's own words, for showing somebody why. */
  emailDeadReason: string;
  /** Set when somebody rang and the number itself did not work: dead
   *  line, unobtainable, a digit short. The number is kept so the row
   *  can say which one failed rather than quietly going blank. */
  phoneDeadAt: string | null;
  /** What the person who rang it wrote down. */
  phoneDeadReason: string;
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
  /** When to ring them back, if a call said so. */
  callbackAt: string | null;
  /** The last call's outcome and when it was, for the row. */
  lastCall: { outcome: string; at: string } | null;
  /** When an email was last sent to them from the admin page. */
  emailedAt: string | null;
  /** Set when the row is in the deleted folder. Never actually removed. */
  deletedAt: string | null;
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
  /** Which country they are in. Decides which list they appear on, and
   *  what hour of the day it is sensible to ring them. */
  region: Region;
  /** The town the search that found them was run in. */
  town: string;
};
