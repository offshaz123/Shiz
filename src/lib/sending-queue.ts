import { REGIONS, type Region } from "./regions";
import { countStepOneSentSince, listNeverContacted } from "./prospects";
import { composeBatch } from "./run-prospect-sequence";
import {
  allowanceNow,
  clockWords,
  minutesSinceDayStart,
  nextSlot,
  PER_SLOT,
  SLOTS,
  localTime,
} from "./sending-hours";

/**
 * What is going out next, and when, before it goes.
 *
 * Until now the sending was something you could only look at afterwards:
 * the mailbox showed what had been sent, and the next batch was whatever
 * the cron decided at four in the morning. Walid asked to see the queue —
 * which businesses are next and at what time — and he is right to. A
 * batch you can see before it leaves is a batch you can stop.
 *
 * This is deliberately built from the same two functions the sending
 * itself uses: listNeverContacted picks who is eligible and composeBatch
 * decides the order and who gets a rebuilt page. A separate "preview"
 * query would drift from the real one within a month and then quietly
 * show the wrong list, which is worse than showing none.
 *
 * It is a forecast, not a promise. Anything that happens between now and
 * the batch — a reply, an unsubscribe, somebody marking a row not
 * interested — takes that business out, which is the system working.
 */

export type QueuedBusiness = {
  id: number;
  name: string;
  town: string;
  website: string;
  /** Whether this one gets a rebuilt page, and so a link in the email. */
  link: boolean;
};

export type QueuedBatch = {
  region: Region;
  /** The hour it goes, in that country's own time: "10am". */
  at: string;
  /** Whether that hour is still to come today, or is the next one after. */
  day: "now" | "today" | "tomorrow";
  /** What the clock says where these businesses are, right now. */
  theirTime: string;
  /** How many may go in this batch. */
  room: number;
  /** How many of them will carry a link. */
  links: number;
  businesses: QueuedBusiness[];
};

function theirTime(region: Region, now: Date): string {
  const { hour, minute } = localTime(region, now);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * The next batch for one country.
 *
 * Three cases, and they read differently on the page on purpose. A batch
 * that is due now is waiting on the scheduler and should go within the
 * hour. One due later today has a time against it. One due tomorrow
 * means that country's day is finished.
 */
async function batchFor(region: Region, now: Date): Promise<QueuedBatch | null> {
  const already = await countStepOneSentSince(region, minutesSinceDayStart(region, now));
  if (already === null) return null;

  const roomNow = allowanceNow(region, already, now);
  const later = nextSlot(region, now);

  let at: string;
  let day: QueuedBatch["day"];
  let room: number;

  if (roomNow > 0) {
    at = "next run";
    day = "now";
    room = roomNow;
  } else if (later !== null) {
    at = clockWords(later);
    day = "today";
    room = PER_SLOT;
  } else {
    at = clockWords(SLOTS[0]);
    day = "tomorrow";
    room = PER_SLOT;
  }

  // The same over-fetch the run does, so the same businesses are chosen.
  const pool = await listNeverContacted(Math.min(room * 4, 200), region);
  const batch = composeBatch(pool ?? [], room);

  return {
    region,
    at,
    day,
    theirTime: theirTime(region, now),
    room,
    links: batch.filter((b) => b.wantLink).length,
    businesses: batch.map(({ prospect, wantLink }) => ({
      id: prospect.id,
      name: prospect.name,
      town: prospect.town,
      website: prospect.website,
      link: wantLink,
    })),
  };
}

/**
 * Every country's next batch.
 *
 * Returns null only when the database could not be reached at all. A
 * country with nobody waiting comes back with an empty list rather than
 * being left out, because "nothing is queued for America" is a thing
 * worth seeing: it means the list needs filling, not that the page is
 * broken.
 */
export async function nextBatches(
  only?: Region[],
  now: Date = new Date(),
): Promise<QueuedBatch[] | null> {
  const wanted = only && only.length > 0 ? REGIONS.filter((r) => only.includes(r)) : REGIONS;
  const batches = await Promise.all(wanted.map((r) => batchFor(r, now)));
  const got = batches.filter((b): b is QueuedBatch => b !== null);
  return got.length === 0 && wanted.length > 0 ? null : got;
}
