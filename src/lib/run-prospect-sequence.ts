import { buildDraft, STEP_DAYS, type OutreachStep } from "./prospect-outreach";
import { sendProspectEmail } from "./send-prospect-email";
import { prospectUnsubscribeUrl } from "./unsubscribe-url";
import {
  countStepOneSent,
  listNeverContacted,
  listSequenceAddresses,
  listSequenceDue,
  markReplied,
} from "./prospects";
import { sendersSince } from "./mail-store";
import { newPerRun } from "./outreach-warm-up";

/**
 * The whole prospect sequence: the first email, then day three and day five.
 *
 * Step 1 used to be Walid pressing send on one row at a time, and the comment
 * here used to say that nothing automatic would ever write to a business a
 * person had not written to first. He has asked for that to change, so it
 * has: startNewSequences below opens them by itself.
 *
 * That removes the human read-through before first contact, which was the
 * main thing keeping the volume honest, so three limits take its place:
 *
 *  - Only scanned rows with real findings, because the first email's opening
 *    sentence is a claim about their website. See listNeverContacted.
 *  - Only rows with a working one-click unsubscribe link. Automated cold mail
 *    without a working opt-out is the thing the regulations actually care
 *    about, and a link that cannot be signed is not a link.
 *  - A warm-up ramp on how many go out per day, because these now leave from
 *    the same domain as the client work and the enquiry replies. Walid chose
 *    that deliberately; it means the domain's reputation is the thing at
 *    stake, so the volume climbs slowly instead of starting where it ends.
 *
 * Run from the existing follow-ups cron rather than a job of its own. There
 * is one scheduler on this hosting, getting a second one onto hPanel is
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
  /** First emails opened by this run, counted separately from follow-ups:
   *  "we wrote to four new businesses" and "we chased four" are different
   *  days and should never read the same on the admin page. */
  started: number;
  failed: number;
  skipped: number;
  replied: number;
  considered: number;
  /** False when the inbox could not be read, which is why nothing was sent. */
  repliesChecked: boolean;
  /** Live sequences left untouched because the inbox could not be read. The
   *  number matters: one is a quiet day, thirty is a stalled pipeline that
   *  nobody has noticed. */
  held: number;
  /** Websites read this run. Always 0 now that scanning has its own job,
   *  kept because the admin page and the cron detail read it and a missing
   *  field would read as a failure rather than as "somewhere else". */
  scanned: number;
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

/**
 * Opens sequences for businesses nobody has written to yet.
 *
 * Runs after the follow-ups, not before. A chase to someone already in a
 * conversation is worth more than an opener to a stranger, so if the mail
 * server starts refusing halfway through a run it should be the openers that
 * are lost.
 *
 * Returns how many were actually opened. A row that cannot be given a signed
 * unsubscribe link is skipped and left for the next run rather than sent
 * without one — if CRON_SECRET ever goes missing the right outcome is that
 * automated cold mail stops, not that it goes out with no way to opt out.
 */
async function startNewSequences(summary: SequenceSummary): Promise<void> {
  const everSent = await countStepOneSent();
  // Not knowing how many have gone out means not knowing where on the ramp
  // we are, and guessing low is still guessing. Send none.
  if (everSent === null) return;

  const allowed = newPerRun(everSent);
  const fresh = await listNeverContacted(allowed);
  if (!fresh || fresh.length === 0) return;

  for (const prospect of fresh) {
    const unsubscribeUrl = prospectUnsubscribeUrl(prospect.id);
    if (!unsubscribeUrl) {
      summary.skipped += 1;
      continue;
    }

    const draft = buildDraft(1, prospect, unsubscribeUrl);
    const result = await sendProspectEmail(prospect.id, draft.subject, draft.body, 1);
    // sendProspectEmail stamps sequence_started_at on a successful step 1,
    // which is what puts them into listSequenceDue for days three and five.
    if (result.ok) summary.started += 1;
    else if (result.reason === "send_failed") summary.failed += 1;
    else summary.skipped += 1;
  }
}

export async function runProspectSequence(): Promise<SequenceSummary> {
  const summary: SequenceSummary = {
    sent: 0,
    started: 0,
    failed: 0,
    skipped: 0,
    replied: 0,
    considered: 0,
    repliesChecked: true,
    held: 0,
    scanned: 0,
  };

  const replies = await stopAnyoneWhoReplied();
  summary.replied = replies.replied;
  summary.repliesChecked = replies.checked;

  // Not knowing whether anyone has replied is a reason to send nothing at
  // all. A day's delay on a follow-up costs very little; a follow-up landing
  // under a reply costs the conversation.
  if (!replies.checked) {
    // Say how much is waiting on it. A held sequence that reports nothing is
    // indistinguishable from a quiet week, which is how a dead scheduler
    // went unnoticed here once already.
    const waiting = await listSequenceDue(MAX_PER_RUN);
    summary.held = waiting?.length ?? 0;
    return summary;
  }

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

  await startNewSequences(summary);

  return summary;
}
