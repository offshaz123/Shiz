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
  /** What the phone system thought: answered, or not. "pending" when it
   *  has not told us anything yet. */
  outcome: string;
  at: string;
  /** True once the phone system has confirmed the call ended. A row
   *  written when somebody pressed Call starts false. */
  confirmed: boolean;
};

/**
 * The calls one person has to write up — theirs, and only theirs.
 *
 * It used to hand the owner everybody's. The condition was "this staff
 * id, or all of them if the id is null", and the owner's id is null, so
 * Walid was being stopped on every page and asked what was said on a
 * call Ali made. He was not on it. Nobody can write up somebody else's
 * call, and a prompt that cannot be answered is a prompt people learn
 * to close without reading — which costs the write-ups that can be
 * answered.
 *
 * So it is always that person's own. The owner's calls carry no staff
 * row, so his are the ones with none, which is also where a call from a
 * handset nobody recognises lands.
 */
export async function callsNeedingReview(
  staffId: number | null,
  limit = 20,
): Promise<PendingCall[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT c.id, c.prospect_id, c.outcome, c.minutes, c.called_at, c.caller, c.logged_by,
              p.name AS business, p.phone
         FROM prospect_calls c
         JOIN prospects p ON p.id = c.prospect_id
        WHERE c.logged_by IN ('phone', 'click')
          AND c.reviewed_at IS NULL
          -- No hold-back. It used to wait two minutes before a call
          -- placed from the site would count, on the grounds that the
          -- call might still be going — but the write-up box now opens
          -- on the row the moment you dial, so closing it and seeing
          -- nothing at the top read as the system having forgotten.
          -- The count is a count, not a box in the way: only a call the
          -- phone system has confirmed opens anything by itself.
          -- Only the last day. A call from a fortnight ago is not a
          -- question anybody can still answer, and leaving it in the
          -- count turns the count into wallpaper.
          AND c.called_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          -- <=> rather than =, so the owner's null matches the rows
          -- that have no staff against them. With = those rows match
          -- nobody and the prompt never appears for him at all.
          AND c.staff_id <=> ?
        ORDER BY c.called_at DESC
        LIMIT ?`,
      [staffId, limit],
    );

    return rows.map((r) => ({
      id: Number(r.id),
      prospectId: Number(r.prospect_id),
      business: String(r.business ?? ""),
      phone: String(r.phone ?? ""),
      seconds: Number(r.minutes ?? 0) * 60,
      outcome: String(r.outcome ?? ""),
      at: String(r.called_at),
      confirmed: r.logged_by === "phone",
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

    // Written up, so the call definitely happened — which is what makes
    // the business count as contacted. Pressing Call alone does not,
    // because a number that rang out is not a business you have spoken
    // to and it must stay on the list.
    await db.execute(
      `UPDATE prospects p
          JOIN prospect_calls c ON c.prospect_id = p.id
          SET p.called_at = COALESCE(p.called_at, NOW())
        WHERE c.id = ?`,
      [callId],
    );

    // The business's own status follows the outcome, the same way it
    // does when a call is logged by hand. Two routes to the same place
    // that disagreed would be worse than one route.
    const status =
      review.outcome === "not-interested"
        ? "not-interested"
        : review.outcome === "spoke" || review.outcome === "call-back" || review.outcome === "gatekeeper"
          ? "called"
          : null;

    // Said on the write-up rather than when the row was made: the
    // person only finds out the number is dead by ringing it.
    if (review.outcome === "bad-number") {
      await db.execute(
        `UPDATE prospects p
            JOIN prospect_calls c ON c.prospect_id = p.id
            SET p.phone_dead_at = COALESCE(p.phone_dead_at, NOW()),
                p.phone_dead_reason = COALESCE(p.phone_dead_reason, ?)
          WHERE c.id = ?`,
        [review.notes.trim().slice(0, 200) || "Rang it and the number did not work.", callId],
      );
    }

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
      // staff_id, not staff_hint. There has never been a column called
      // staff_hint, so this query failed every time it ran and the
      // count it returned was always zero — silently, because a failed
      // read here is treated as "nothing to report".
      `SELECT COUNT(*) AS n FROM prospect_calls
        WHERE logged_by IN ('phone', 'click')
          AND reviewed_at IS NULL
          AND called_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
          AND (? IS NULL OR staff_id <=> ?)`,
      [staffId, staffId],
    );
    return Number(row?.n ?? 0);
  });
  return found ?? 0;
}

/**
 * How many calls each person has not written up.
 *
 * The prompt only ever asks somebody about their own calls, which is
 * right — nobody can say what was said on a call they were not on. The
 * cost of that is that the owner cannot see a person quietly closing
 * the box every time, so the number goes on the Team page instead: a
 * fact next to their name rather than a question he cannot answer.
 *
 * All of them, not just today's. A backlog is the thing worth seeing.
 */
export async function unwrittenByStaff(): Promise<Map<number | null, number> | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { staff_id: number | null; n: number })[]>(
      `SELECT c.staff_id, COUNT(*) AS n
         FROM prospect_calls c
        WHERE c.logged_by IN ('phone', 'click')
          AND c.reviewed_at IS NULL
        GROUP BY c.staff_id`,
    );
    const counts = new Map<number | null, number>();
    for (const row of rows) {
      counts.set(row.staff_id === null ? null : Number(row.staff_id), Number(row.n));
    }
    return counts;
  });
}
