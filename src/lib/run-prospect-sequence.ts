import { buildDraft, STEP_DAYS, type OutreachStep } from "./prospect-outreach";
import { prospectUnsubscribeUrl, sendProspectEmail } from "./send-prospect-email";
import { listSequenceAddresses, listSequenceDue, markReplied } from "./prospects";
import { sendersSince } from "./mail-store";

/**
 * The two follow-ups that send themselves: day three and day five.
 *
 * Step 1 is never in here. A prospect only enters this at all once Walid has
 * read their first email and pressed send, which is what sets
 * sequence_started_at — so nothing automatic ever writes to a business a
 * person has not written to first.
 *
 * Run from the existing follow-ups cron rather than a new job of its own.
 * There is one scheduler on this hosting, getting a second one onto hPanel is
 * fiddly and easy to get wrong, and a sequence nobody notices has stopped is
 * exactly the failure this site has already had once.
 */

/** Kept well under the request timeout, and small enough that a stuck
 *  mail server costs one run rather than the site. */
const MAX_PER_RUN = 12;

/**
 * Minimum gap between two emails to the same business, whatever the schedule
 * does. Without it the spacing is a property of how often the cron happens to
 * run: fire the route twice in an afternoon and a prospect walks the whole
 * sequence in minutes.
 */
const MIN_GAP_HOURS = 20;

/** How far back to read the inbox when looking for replies. Comfortably
 *  longer than the sequence, so a reply cannot be missed by arriving while
 *  the scheduler was down. */
const REPLY_WINDOW_DAYS = 14;

export type SequenceSummary = {
  sent: number;
  failed: number;
  skipped: number;
  replied: number;
  considered: number;
  /** False when the inbox could not be read, which is why nothing was sent. */
  repliesChecked: boolean;
};

/**
 * Takes everyone who has written to us recently and ends the sequence for
 * them.
 *
 * One read of the inbox for the whole run, rather than one search per
 * prospect: thirty prospects must not mean thirty connections, and a mailbox
 * this size holds few enough recent messages to read the envelopes of all of
 * them in a single pass.
 */
async function stopAnyoneWhoReplied(): Promise<{ replied: number; checked: boolean }> {
  const live = await listSequenceAddresses();
  if (!live || live.length === 0) return { replied: 0, checked: true };

  const since = new Date(Date.now() - REPLY_WINDOW_DAYS * 86_400_000);
  const senders = await sendersSince(since);
  // Null means the question could not be answered — no IMAP, a refused
  // login, a timeout. That is not the same as "nobody replied", and the
  // difference matters: following up on a maybe is how you email someone who
  // already said yes.
  if (!senders) return { replied: 0, checked: false };

  let replied = 0;
  for (const row of live) {
    if (senders.has(row.email)) {
      await markReplied(row.id);
      replied += 1;
    }
  }
  return { replied, checked: true };
}

export async function runProspectSequence(): Promise<SequenceSummary> {
  const summary: SequenceSummary = {
    sent: 0,
    failed: 0,
    skipped: 0,
    replied: 0,
    considered: 0,
    repliesChecked: true,
  };

  const replies = await stopAnyoneWhoReplied();
  summary.replied = replies.replied;
  summary.repliesChecked = replies.checked;

  // Not knowing whether anyone has replied is a reason to send nothing at
  // all. A day's delay on a follow-up costs very little; a follow-up landing
  // under a reply costs the conversation.
  if (!replies.checked) return summary;

  const due = await listSequenceDue(MAX_PER_RUN);
  if (!due) return summary;
  summary.considered = due.length;

  for (const row of due) {
    const next = (row.lastStep + 1) as OutreachStep;
    if (next !== 2 && next !== 3) continue;

    const dueAfterHours = STEP_DAYS[next] * 24;
    // Half a day of slack, so a scheduler that drifts an hour or runs at a
    // different time of day than the send did still fires on the right day
    // rather than silently waiting another whole one.
    if (row.hoursSinceStart < dueAfterHours - 12) {
      summary.skipped += 1;
      continue;
    }
    if (row.hoursSinceStart - (STEP_DAYS[2] * 24) < MIN_GAP_HOURS && next === 3) {
      summary.skipped += 1;
      continue;
    }

    const draft = buildDraft(next, row.prospect, prospectUnsubscribeUrl(row.prospect.id));
    const result = await sendProspectEmail(row.prospect.id, draft.subject, draft.body, next);
    if (result.ok) summary.sent += 1;
    else if (result.reason === "send_failed") summary.failed += 1;
    else summary.skipped += 1;
  }

  return summary;
}
