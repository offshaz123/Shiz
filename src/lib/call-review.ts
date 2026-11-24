import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { withDb } from "./db";
import type { CallOutcome } from "./prospect-types";

/**
 * Calls that happened but that nobody has said anything about yet.
 *
 * The phone system writes a row the moment a call ends: how long, did it
 * connect, which extension. What it cannot know is what was said — and
 * that is the half that decides whether to ring again, when, and what to
 * open with.
 *
 * So every call it logs starts unreviewed, the person who made it is
 * asked, and until they answer it sits in a count at the top of their
 * screen. Not to nag: a call nobody wrote anything about is a call that
 * may as well not have been made, because the next person to open that
 * business learns nothing from it.
 */

export type PendingCall = {
  id: number;
  prospectId: number;
  business: string;
  phone: string;
  seconds: number;
  /** What the phone system thought: answered, or not. */
  outcome: string;
  at: string;
};

export async function callsNeedingReview(
  staffId: number | null,
  limit = 20,
): Promise<PendingCall[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT c.id, c.prospect_id, c.outcome, c.minutes, c.called_at, c.caller,
              p.name AS business, p.phone
         FROM prospect_calls c
         JOIN prospects p ON p.id = c.prospect_id
        WHERE c.logged_by = 'phone'
          AND c.reviewed_at IS NULL
          -- Only the last day. A call from a fortnight ago is not a
          -- question anybody can still answer, and leaving it in the
          -- count turns the count into wallpaper.
          AND c.called_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          AND (? IS NULL OR c.staff_id <=> ?)
        ORDER BY c.called_at DESC
        LIMIT ?`,
      [staffId, staffId, limit],
    );

    return rows.map((r) => ({
      id: Number(r.id),
      prospectId: Number(r.prospect_id),
      business: String(r.business ?? ""),
      phone: String(r.phone ?? ""),
      seconds: Number(r.minutes ?? 0) * 60,
      outcome: String(r.outcome ?? ""),
      at: String(r.called_at),
    }));
  });
}

/**
 * Records what the person says happened.
 *
 * The outcome can be changed from what the phone system guessed: it
 * knows a call lasted ninety seconds, not that ninety seconds was a
 * gatekeeper saying he is out until Thursday.
 */
export async function reviewCall(
  callId: number,
  review: { outcome: CallOutcome; notes: string; callbackAt: string },
): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [res] = await db.execute<ResultSetHeader>(
      `UPDATE prospect_calls
          SET outcome = ?, notes = ?, reviewed_at = NOW()
        WHERE id = ? AND reviewed_at IS NULL`,
      [review.outcome, review.notes.slice(0, 4000) || null, callId],
    );
    if (res.affectedRows === 0) return false;

    // The business's own status follows the outcome, the same way it
    // does when a call is logged by hand. Two routes to the same place
    // that disagreed would be worse than one route.
    const status =
      review.outcome === "not-interested"
        ? "not-interested"
        : review.outcome === "spoke" || review.outcome === "call-back" || review.outcome === "gatekeeper"
          ? "called"
          : null;

    if (status || review.callbackAt) {
      await db.execute(
        `UPDATE prospects p
            JOIN prospect_calls c ON c.prospect_id = p.id
            SET ${status ? "p.status = ?," : ""}
                p.callback_at = ${review.callbackAt ? "?" : "p.callback_at"}
          WHERE c.id = ?`,
        [
          ...(status ? [status] : []),
          ...(review.callbackAt ? [review.callbackAt] : []),
          callId,
        ],
      );
    }
    return true;
  });
  return done === true;
}

/** Just the number, for the line at the top of the page. */
export async function countNeedingReview(staffId: number | null): Promise<number> {
  const found = await withDb(async (db) => {
    const [[row]] = await db.query<(RowDataPacket & { n: number })[]>(
      `SELECT COUNT(*) AS n FROM prospect_calls
        WHERE logged_by = 'phone'
          AND reviewed_at IS NULL
          AND called_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          AND (? IS NULL OR staff_hint <=> ?)`,
      [staffId, staffId],
    );
    return Number(row?.n ?? 0);
  });
  return found ?? 0;
}
