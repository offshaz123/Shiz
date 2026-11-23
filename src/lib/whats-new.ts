import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import type { NewCounts, PageKey } from "./admin-pages";

/**
 * What has arrived since somebody last looked at a page.
 *
 * Walid asked for a number on the navigation when something new comes in,
 * and for it to go away once the page has been opened. That second half
 * is what decides the definition: the count has to be "since you last
 * looked", not "waiting overall". A badge showing work outstanding never
 * clears, so within a week nobody reads it.
 *
 * It is per person. Two people working the same list should each see what
 * is new to them, and one of them opening a page should not clear the
 * other's badge.
 */

/** The owner has no staff row, so he is 0 here. */
function idFor(staffId: number | null): number {
  return staffId ?? 0;
}

/** Records that this person has now seen that page. */
export async function markPageSeen(staffId: number | null, page: PageKey): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `INSERT INTO page_seen (staff_id, page) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE seen_at = NOW()`,
      [idFor(staffId), page],
    );
  }).catch(() => null);
}

export type { NewCounts };

/**
 * The badge numbers, in one query per thing counted.
 *
 * A page nobody has opened yet has no row, and everything counts as new.
 * That is the right first impression: a fresh account should see what is
 * there rather than a clean slate it has not earned.
 */
export async function whatsNew(staffId: number | null): Promise<NewCounts> {
  const counts = await withDb(async (db) => {
    const [seenRows] = await db.query<(RowDataPacket & { page: string; seen_at: string })[]>(
      "SELECT page, seen_at FROM page_seen WHERE staff_id = ?",
      [idFor(staffId)],
    );
    const seen = new Map(seenRows.map((r) => [String(r.page), String(r.seen_at)]));

    // NULL compares false against everything, so a page never opened has
    // to fall back to a date before anything existed rather than to NOW().
    const since = (page: PageKey) => seen.get(page) ?? "1970-01-01 00:00:00";

    const [[leads]] = await db.query<(RowDataPacket & { n: number })[]>(
      "SELECT COUNT(*) AS n FROM scan_leads WHERE created_at > ?",
      [since("leads")],
    );

    const [[reviews]] = await db.query<(RowDataPacket & { n: number })[]>(
      // Only the ones still waiting on a decision. An approved review
      // arriving while you were out is not a thing to go and do.
      "SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending' AND created_at > ?",
      [since("leads")],
    );

    const [[replies]] = await db.query<(RowDataPacket & { n: number })[]>(
      // Somebody writing back is the single most time-sensitive thing in
      // the whole system, which is why it is what the call list counts.
      "SELECT COUNT(*) AS n FROM prospects WHERE replied_at > ?",
      [since("prospects")],
    );

    const [[clientLeads]] = await db.query<(RowDataPacket & { n: number })[]>(
      "SELECT COUNT(*) AS n FROM client_leads WHERE created_at > ?",
      [since("clients")],
    );

    return {
      // Reviews live on the leads page, so they add to the same badge.
      leads: Number(leads?.n ?? 0) + Number(reviews?.n ?? 0),
      prospects: Number(replies?.n ?? 0),
      clients: Number(clientLeads?.n ?? 0),
    } satisfies NewCounts;
  });

  return counts ?? {};
}
