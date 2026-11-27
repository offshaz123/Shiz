import { buildDraft, STEP_DAYS, type OutreachStep } from "./prospect-outreach";
import { sendProspectEmail } from "./send-prospect-email";
import { createPreview, dropPreview, hasPreview, livePreview, previewUrl } from "./previews";
import { canBuildPreview, worthAPreview } from "./preview-worth-it";
import { previewWouldWork } from "./preview-quality";
import { prospectUnsubscribeUrl } from "./unsubscribe-url";
import {
  countQueueBlockers,
  countStepOneSent,
  countStepOneSentSince,
  listNeverContacted,
  listSequenceAddresses,
  listSequenceDue,
  markEmailDead,
  markReplied,
} from "./prospects";
import { bouncesSince, sendersSince } from "./mail-store";
import { newPerRun } from "./outreach-warm-up";
import { REGIONS, type Region } from "./regions";
import { allowanceNow, minutesSinceDayStart, openNow } from "./sending-hours";
import type { Prospect } from "./prospect-types";

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
 * How many of every twenty openers should carry a rebuilt page.
 *
 * Walid's number. An email that says "I rebuilt your homepage, here it
 * is" is a different email from one that lists three faults, and when the
 * batch happens to hold nobody strictly worth the effort the whole day's
 * sending turns into the second kind. Seven in twenty is the floor, not
 * the target: everyone who clears the stricter test still gets one.
 */
const LINKS_PER = 7;
const OUT_OF = 20;

/** The floor for a batch of this size, rounded up, never above the batch. */
function linkFloor(batch: number): number {
  return Math.min(batch, Math.ceil((batch * LINKS_PER) / OUT_OF));
}

/**
 * Chooses the batch so that enough of it can carry a link.
 *
 * Oldest first is still the rule, and this only breaks it as far as it
 * has to: the businesses worth a page are pulled forward until the floor
 * is met, then the rest of the batch fills in order behind them, and the
 * whole thing is put back into the original order before it is sent so a
 * day's mail is not obviously sorted into two halves.
 *
 * `want` is what may be sent; `pool` should hold more than that, or there
 * is nothing to choose between.
 */
export function composeBatch(
  pool: Prospect[],
  want: number,
): { prospect: Prospect; wantLink: boolean }[] {
  const need = linkFloor(want);
  const chosen: Prospect[] = [];
  const taken = new Set<number>();

  // Worth winning first, then merely possible, until the floor is met.
  for (const test of [worthAPreview, canBuildPreview]) {
    for (const one of pool) {
      if (chosen.length >= need) break;
      if (taken.has(one.id) || !test(one)) continue;
      chosen.push(one);
      taken.add(one.id);
    }
  }
  // Then the rest of the batch, oldest first, whoever they are.
  for (const one of pool) {
    if (chosen.length >= want) break;
    if (taken.has(one.id)) continue;
    chosen.push(one);
    taken.add(one.id);
  }

  const order = new Map(pool.map((one, i) => [one.id, i]));
  chosen.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

  // Who actually gets a page. Everyone who clears the stricter test, plus
  // as many of the looser ones as it takes to reach the floor.
  let links = chosen.filter(worthAPreview).length;
  return chosen.map((prospect) => {
    if (worthAPreview(prospect)) return { prospect, wantLink: true };
    if (links < need && canBuildPreview(prospect)) {
      links += 1;
      return { prospect, wantLink: true };
    }
    return { prospect, wantLink: false };
  });
}

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

/** How far back to look for bounces. Longer than the reply window: a bounce
 *  for a dead address is worth acting on whenever it arrived, and the same
 *  address turning up again in a later scan should stay marked. */
const BOUNCE_WINDOW_DAYS = 30;

export type SequenceSummary = {
  sent: number;
  /** Pages built out of a business's own site this run, for the ones the
   *  rules say are worth winning. Counted separately because it is the
   *  number that says how much of a day's sending had something to look
   *  at behind it. */
  previews: number;
  /** First emails opened by this run, counted separately from follow-ups:
   *  "we wrote to four new businesses" and "we chased four" are different
   *  days and should never read the same on the admin page. */
  started: number;
  failed: number;
  skipped: number;
  replied: number;
  /** Addresses a bounce proved dead this run. Reported because a day where
   *  five addresses turn out not to work is a day the list got better, and
   *  it should not look identical to a day where nothing happened. */
  bounced: number;
  considered: number;
  /** False when the inbox could not be read, which is why nothing was sent. */
  repliesChecked: boolean;
  /** Live sequences left untouched because the inbox could not be read. The
   *  number matters: one is a quiet day, thirty is a stalled pipeline that
   *  nobody has noticed. */
  held: number;
  /** Why no new business was written to, when none was. Empty when some
   *  were. Carried all the way out to the cron log, because "nothing
   *  went" and "nothing could go, and here is what is blocking it" are
   *  different reports and only one of them is actionable. */
  whyNothingNew: string;
  /** Pages not built because the business's site could not be read well
   *  enough to make one worth looking at. Counted because a day where
   *  six previews were refused is a day the gate did its job, and it
   *  should not read as a quiet day. */
  previewsRefused: number;
  /** Businesses passed over because it is the wrong time of day where
   *  they are. Reported separately from skipped, because "nothing went to
   *  America at six in the morning their time" is the system working and
   *  should not read like a failure. */
  outOfHours: number;
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
 * Takes every bounce in the inbox and ends the sequence for the address it
 * names.
 *
 * Added after the mail server's own log for 16 to 23 November showed three
 * hard bounces and six sends to domains with no mail server, none of which
 * the system knew about. A bounce comes back from MAILER-DAEMON rather than
 * from the business, so the reply check above cannot see it: it matches the
 * sender against the addresses we wrote to, and MAILER-DAEMON is not one of
 * them.
 *
 * Failing quietly is the right behaviour here, unlike the reply check. Not
 * knowing whether somebody replied is a reason to send nothing, because a
 * follow-up under a reply costs a conversation. Not knowing whether an
 * address bounced costs one more email to a mailbox that is not there, so
 * the run carries on.
 */
async function stopAnyoneWhoBounced(): Promise<number> {
  const since = new Date(Date.now() - BOUNCE_WINDOW_DAYS * 86_400_000);
  const dead = await bouncesSince(since);
  if (!dead || dead.length === 0) return 0;

  let marked = 0;
  for (const address of dead) {
    // Only counts the ones that actually matched a prospect. The inbox also
    // collects bounces from the audit follow-ups and from Walid's own
    // sending, and reporting those as list improvements would overstate it.
    marked += await markEmailDead(address.email, address.reason);
  }
  return marked;
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

  // The ramp is still the ceiling. It is about how fast this domain may
  // raise its volume, which is a different question from what hour of the
  // day it is in Ohio, and the lower of the two answers wins.
  const ramp = newPerRun(everSent);
  const now = new Date();

  // What each country may still have today, in its own hours. Two batches
  // of twenty, the first opening at ten in the morning there and the
  // second at two in the afternoon, less whatever has already gone out
  // since that country's midnight. A country whose day has not opened yet,
  // or has closed, comes back zero and is left alone until tomorrow.
  const perRegion = new Map<Region, number>();
  for (const region of REGIONS) {
    if (!openNow(region, now)) continue;
    const already = await countStepOneSentSince(region, minutesSinceDayStart(region, now));
    // A count that could not be read is not a zero. Sending the whole
    // batch again on a failed count is the one mistake here that cannot
    // be taken back.
    if (already === null) continue;
    const room = allowanceNow(region, already, now);
    if (room > 0) perRegion.set(region, Math.min(room, ramp));
  }
  if (perRegion.size === 0) {
    summary.whyNothingNew = "outside both countries' sending hours";
    return;
  }

  const allowed = [...perRegion.values()].reduce((a, b) => a + b, 0);

  // Taken from each country in turn rather than oldest-first across both.
  //
  // Oldest-first is what this did, and with one country it was right. With
  // two it is a trap: every American business is newer than every British
  // one, so the whole British backlog — a hundred and seventy-nine of them
  // at the time of writing, against a dozen openers a day — would have to
  // empty before the first email ever went to America. The US list would
  // have filled up, scanned itself, and sat there for a month looking like
  // it was working.
  //
  // Each country is asked for the whole allowance and the two are
  // interleaved, so when one has nobody waiting the other still fills the
  // run rather than half of it going unused.
  // Each country is asked only for its own remaining allowance, so one
  // country's quiet day no longer spends the other's. That is a change
  // from asking both for the whole number and interleaving: the batch
  // sizes are now the point, and lending twenty of America's to Britain
  // would put forty British emails out in one morning.
  //
  // More is read than will be sent, because the batch is then composed
  // rather than taken off the top — see composeBatch. With exactly twenty
  // rows there is nothing to choose between, and the share of the day's
  // mail that carries a rebuilt page would be whatever the list happened
  // to be sorted into.
  const wanted = [...perRegion.entries()];
  const byRegion = await Promise.all(
    wanted.map(([r, n]) => listNeverContacted(Math.min(n * 4, 200), r)),
  );
  const batches = wanted.map(([, n], i) => composeBatch(byRegion[i] ?? [], n));

  // The countries are interleaved so a failure partway through a run costs
  // both of them a little rather than one of them everything.
  const fresh: { prospect: Prospect; wantLink: boolean }[] = [];
  for (let i = 0; i < allowed; i += 1) {
    for (const batch of batches) {
      const one = batch[i];
      if (one) fresh.push(one);
    }
  }
  if (fresh.length === 0) {
    // Room to send and nobody to send to. The interesting case, and the
    // one that used to read the same as a quiet day: the list is not
    // empty, it is full of businesses that cannot be written to yet.
    const why: string[] = [];
    for (const [region] of perRegion) {
      const stuck = await countQueueBlockers(region);
      if (!stuck || stuck.total === 0) continue;
      const bits: string[] = [];
      if (stuck.noEmail) bits.push(`${stuck.noEmail} no email`);
      if (stuck.notScanned) bits.push(`${stuck.notScanned} unscanned`);
      if (stuck.noFindings) bits.push(`${stuck.noFindings} nothing wrong`);
      if (stuck.deadEmail) bits.push(`${stuck.deadEmail} bounced`);
      why.push(`${region.toUpperCase()}: ${stuck.total} waiting (${bits.join(", ")})`);
    }
    summary.whyNothingNew = why.length ? why.join("; ") : "nobody eligible";
    return;
  }
  fresh.length = Math.min(fresh.length, allowed);

  for (const { prospect, wantLink } of fresh) {
    const unsubscribeUrl = prospectUnsubscribeUrl(prospect.id);
    if (!unsubscribeUrl) {
      summary.skipped += 1;
      continue;
    }

    // A page built out of their own site. Made before the email so the
    // link can go in it, and only once per business ever: a second one
    // landing a fortnight later reads as a machine, which is the
    // opposite of the point.
    let link = "";
    let previewId: number | null = null;
    if (wantLink && !(await hasPreview(prospect.id))) {
      // Looked at before the link goes in an email, never after. A
      // business whose site we cannot read gives a page with nothing on
      // it, and a stranger who opens an empty page does not open a
      // second link from us. No preview is a fine outcome; the empty
      // one was not.
      const worth = await previewWouldWork(prospect.website);
      if (worth.ok) {
        const preview = await createPreview(prospect.id, prospect.name);
        if (preview) {
          link = previewUrl(preview);
          previewId = preview.id;
        }
      } else {
        summary.previewsRefused += 1;
      }
    }

    const draft = buildDraft(1, prospect, unsubscribeUrl, link);
    const result = await sendProspectEmail(prospect.id, draft.subject, draft.body, 1);

    // The page exists only to be in that email. If the email did not
    // go, the page is a link nobody has, and leaving it there would
    // mark this business as already done and bar them from ever
    // getting one.
    if (previewId !== null) {
      if (result.ok) summary.previews += 1;
      else await dropPreview(previewId);
    }
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
    previews: 0,
    started: 0,
    failed: 0,
    skipped: 0,
    replied: 0,
    bounced: 0,
    considered: 0,
    repliesChecked: true,
    held: 0,
    whyNothingNew: "",
    previewsRefused: 0,
    outOfHours: 0,
    scanned: 0,
  };

  // Bounces first. A business whose address has just been proved dead
  // should not be in the follow-up queue this run, let alone be chased
  // twice more and then land on the call list marked "no reply".
  summary.bounced = await stopAnyoneWhoBounced();

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

  // One reading of the clock for the whole loop, so a run that straddles
  // the top of an hour cannot send half its follow-ups under one rule and
  // half under another.
  const clockNow = new Date();

  for (const row of due) {
    const next = (row.lastStep + 1) as OutreachStep;
    if (next !== 2 && next !== 3) continue;

    // The same hours as the openers. A chase landing at three in the
    // morning is worse than a cold opener doing it, not better: this is
    // the second or third time this business has heard from us, and the
    // timestamp is the thing that decides whether that reads as a person
    // following up or a machine working through a list overnight.
    if (!openNow(row.prospect.region, clockNow)) {
      summary.outOfHours += 1;
      continue;
    }

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

    // The page built for them in the first email, if it is still up.
    // Without this the follow-ups never mention the one thing in the
    // sequence worth clicking, and the deadline on it goes unused.
    const page = await livePreview(row.prospect.id);
    const draft = buildDraft(
      next,
      row.prospect,
      prospectUnsubscribeUrl(row.prospect.id),
      page?.url ?? "",
      page?.expiresAt ?? "",
    );
    const result = await sendProspectEmail(row.prospect.id, draft.subject, draft.body, next);
    if (result.ok) summary.sent += 1;
    else if (result.reason === "send_failed") summary.failed += 1;
    else summary.skipped += 1;
  }

  await startNewSequences(summary);

  return summary;
}
