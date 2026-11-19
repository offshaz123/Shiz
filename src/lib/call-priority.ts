import type { Prospect } from "./prospect-types";

/**
 * Who to ring first, and what to say when they pick up.
 *
 * Its own module with no imports beyond the type, so it can be tested and
 * so the call list can use it in the browser without pulling the database
 * driver in.
 *
 * The point of it is that a list of two hundred phone numbers is not a
 * call list, it is a pile. Somebody sitting down to ring people needs to
 * know which fifteen to do this morning and what the opening line is for
 * each — and both of those are already sitting in what the scan found.
 *
 * Every reason here is a fact about that business taken from a real row.
 * Nothing is inferred about how likely they are to buy, because we do not
 * know that and a made-up likelihood score is worse than none: it sends
 * somebody to the top of the list for no reason and they learn to ignore
 * the ordering.
 */

export type Urgency = "today" | "this-week" | "when-you-can" | "leave-it";

export type CallPlan = {
  urgency: Urgency;
  /** Higher first within a band. Not shown; only used to sort. */
  score: number;
  /** Why they are worth ringing, in the order to say them. */
  reasons: string[];
  /** The single line to open with. */
  opener: string;
};

export const URGENCY_WORD: Record<Urgency, string> = {
  today: "Ring today",
  "this-week": "This week",
  "when-you-can": "When you get a minute",
  "leave-it": "Leave it",
};

/** Days before a found business is stale enough to be worth less. */
const GOING_OFF_AFTER = 30;

function daysSince(value: string | null, now: number): number | null {
  if (!value) return null;
  const at = new Date(value);
  if (Number.isNaN(at.getTime())) return null;
  return Math.max(0, Math.floor((now - at.getTime()) / 86_400_000));
}

/**
 * Works out where a business sits on the list and why.
 *
 * Reads in the order somebody would actually think: is this one already
 * dealt with, is there something booked, and then what is wrong with them
 * that we could fix.
 */
export function planCall(prospect: Prospect, now = Date.now()): CallPlan {
  const reasons: string[] = [];
  let score = 0;

  // Dealt with, one way or another. Still shown, never prioritised.
  if (
    prospect.status === "customer" ||
    prospect.status === "not-interested" ||
    prospect.unsubscribedAt
  ) {
    return {
      urgency: "leave-it",
      score: -1,
      reasons:
        prospect.status === "customer"
          ? ["Already a customer."]
          : ["Said no, or asked not to be contacted."],
      opener: "",
    };
  }

  // A callback somebody promised beats everything else on the list. Not
  // because of what is wrong with their website — because a person said
  // "ring me Thursday" and Thursday is today.
  const dueIn = prospect.callbackAt
    ? Math.ceil((new Date(prospect.callbackAt).getTime() - now) / 86_400_000)
    : null;
  if (dueIn !== null && Number.isFinite(dueIn) && dueIn <= 0) {
    return {
      urgency: "today",
      score: 1000,
      reasons: ["They asked you to ring back, and that was today or earlier."],
      opener: "You asked me to give you a ring back about your marketing.",
    };
  }

  // No website at all. The biggest thing we sell and the easiest call to
  // open, because there is nothing to argue about.
  const noWebsite = !prospect.website.trim();
  if (noWebsite) {
    score += 50;
    reasons.push(
      prospect.reviews > 0
        ? `No website at all, but ${prospect.reviews} Google review${
            prospect.reviews === 1 ? "" : "s"
          } — people are already looking for them and finding nothing to land on.`
        : "No website at all. Anybody searching for them finds nothing to land on.",
    );
  } else if (prospect.siteScore !== null) {
    if (prospect.siteScore < 40) {
      score += 40;
      reasons.push(`Their website scored ${prospect.siteScore} out of 100.`);
    } else if (prospect.siteScore < 70) {
      score += 20;
      reasons.push(`Their website scored ${prospect.siteScore} out of 100.`);
    } else {
      // A good site is a worse call and should say so rather than be
      // quietly buried. Somebody needs to know not to waste the hour.
      reasons.push(
        `Their website scored ${prospect.siteScore} out of 100, so there is less obviously wrong to talk about.`,
      );
    }
  }

  // The actual things to say. Two, because a call that opens with six
  // faults is a call that sounds like an attack.
  for (const finding of prospect.findings.slice(0, 2)) {
    reasons.push(finding.why || finding.label);
  }

  // A Google listing nobody has reviewed is a real, fixable problem and
  // one the owner usually already knows about.
  if (prospect.reviews === 0) {
    score += 15;
    reasons.push("No Google reviews at all.");
  } else if (prospect.reviews < 5) {
    score += 8;
    reasons.push(`Only ${prospect.reviews} Google reviews.`);
  }

  // Already being emailed, so the phone is the second attempt rather than
  // the first. Worth less, not worthless.
  if (prospect.emailCount > 0) {
    score -= 10;
    reasons.push(
      `${prospect.emailCount} email${prospect.emailCount === 1 ? "" : "s"} already sent, no reply.`,
    );
  }

  // Rung already and nobody picked up. Worth another go, below the ones
  // nobody has tried.
  const sinceCall = daysSince(prospect.calledAt, now);
  if (sinceCall !== null) {
    score -= 25;
    reasons.push(
      sinceCall === 0
        ? "Already rung today."
        : `Last rung ${sinceCall} day${sinceCall === 1 ? "" : "s"} ago.`,
    );
    // Rung today already: leave them alone until tomorrow.
    if (sinceCall === 0) score -= 1000;
  }

  // Found weeks ago and still sitting there. Details go off, and a
  // business rung three months after we looked at their site is a call
  // where half of what we say is out of date.
  const age = daysSince(prospect.scannedAt, now);
  if (age !== null && age > GOING_OFF_AFTER) {
    score -= 10;
    reasons.push(`Scanned ${Math.floor(age / 7)} weeks ago — worth a fresh look first.`);
  }

  // Never scanned, so there is nothing to tell them. Rings bottom until
  // the scanner gets to it.
  if (prospect.scannedAt === null && !noWebsite) {
    return {
      urgency: "when-you-can",
      score: 0,
      reasons: ["Their website has not been looked at yet, so there is nothing to open with."],
      opener: "",
    };
  }

  const urgency: Urgency = score >= 50 ? "today" : score >= 20 ? "this-week" : "when-you-can";

  return { urgency, score, reasons, opener: openerFor(prospect, noWebsite) };
}

/**
 * The first line out of their mouth.
 *
 * Built from the one worst thing rather than from a template, because the
 * opener is the whole call: a sentence that is obviously about them gets a
 * conversation, and a sentence that could be about anybody gets hung up
 * on.
 */
function openerFor(prospect: Prospect, noWebsite: boolean): string {
  const them = prospect.name;

  if (noWebsite) {
    return `I was looking for ${them} online and could not find a website — is that right?`;
  }

  if (prospect.siteScore !== null && prospect.siteScore < 40) {
    return `I had a look at your website this morning and there are a couple of things on it costing you enquiries. Have you got two minutes?`;
  }

  const first = prospect.findings[0]?.label;
  if (first) {
    return `I had a look at your website and noticed ${first.toLowerCase()}. Is that something you know about?`;
  }

  if (prospect.reviews === 0) {
    return `I noticed ${them} has no reviews on Google yet. Is that something you have been meaning to sort?`;
  }

  return `I had a look at how ${them} shows up online and there are one or two things worth a conversation.`;
}

/**
 * The order to work the list in.
 *
 * Sorted rather than filtered, so nothing disappears — somebody who wants
 * to scroll to the bottom and ring a cold one still can.
 */
export function callOrder(prospects: Prospect[], now = Date.now()): {
  prospect: Prospect;
  plan: CallPlan;
}[] {
  return prospects
    .map((prospect) => ({ prospect, plan: planCall(prospect, now) }))
    .sort((a, b) => b.plan.score - a.plan.score);
}
