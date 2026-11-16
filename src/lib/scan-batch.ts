import { listUnscanned, saveProspectScan } from "./prospects";
import { scanProspectSite } from "./prospect-scan";

/**
 * Scanning a handful of unscanned prospects, shared by the admin button and
 * the daily job.
 *
 * It was only ever the button, which left a manual step in the middle of an
 * automatic pipeline: businesses are found by hand, scanned by hand, and
 * then written to automatically — except nothing is written to a business
 * that has not been scanned, because the first email is a list of what the
 * scan found. So a week of not pressing Scan all is a week of the sequence
 * sending nothing, and from the outside that looks exactly like a scheduler
 * that has stopped.
 *
 * The numbers are the ones the button has been using: eight a run, two in
 * flight. Each scan is a live fetch of somebody else's site on shared
 * hosting with a process ceiling that has taken this site down once
 * already, so they are not numbers to raise casually. Eight a day is slow
 * against a backlog of hundreds; the button is still there to drain it
 * faster while somebody is watching.
 */

const BATCH = 8;
const CONCURRENCY = 2;

export type ScanBatch = { scanned: number; unreadable: number };

export async function scanBatch(limit = BATCH): Promise<ScanBatch | null> {
  const pending = await listUnscanned(limit);
  if (pending === null) return null;
  if (pending.length === 0) return { scanned: 0, unreadable: 0 };

  let scanned = 0;
  let unreadable = 0;

  // A worker pool over one shared queue, so a slow site holds up only
  // itself rather than the whole batch.
  const queue = [...pending];
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      for (;;) {
        const next = queue.shift();
        if (!next) return;
        // Never throws out of the pool: one dead domain must not cost the
        // other seven, and an unreadable site is a normal outcome rather
        // than an error — saveProspectScan stamps it either way so it is
        // not retried forever.
        const result = await scanProspectSite(next.website).catch(() => null);
        await saveProspectScan(next.id, result);
        if (result) scanned++;
        else unreadable++;
      }
    }),
  );

  return { scanned, unreadable };
}
