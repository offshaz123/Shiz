import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { withDb } from "@/lib/db";
import { sendFollowUp } from "@/lib/send-follow-up";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sends the day 1, 3 and 6 follow-ups. Fired by a cron job, guarded by
 * CRON_SECRET — without that anyone who found this URL could run the whole
 * sequence at will.
 *
 * Safe to run as often as you like and safe to run twice. What has already
 * gone out is decided by rows in lead_emails, and the unique key on
 * (lead_id, step) means a duplicate send is rejected by the database rather
 * than relying on this code getting it right.
 *
 * One email per person per run, always the earliest one they are still owed.
 * This matters whenever the scheduler has not run for a while: a lead who has
 * been waiting six days is due all three at once, and firing them within the
 * same second would land as three emails stacked in an inbox, in a sequence
 * that reads as though it was written to be spread over a week. Sending the
 * earliest and letting the rest follow on later runs keeps the order and the
 * spacing intact, at the cost of the sequence finishing a few days later than
 * the day numbers suggest. That is the right way round.
 *
 * A lead stops receiving these the moment any of these is true: marked
 * contacted in the admin page, unsubscribed, or past step 6.
 */

/**
 * All three go to everyone who submitted their details, by Walid's decision.
 *
 * The basis is PECR's soft opt-in: someone who hands a marketing agency their
 * details to get a website audit is in negotiations for a sale, and the form
 * tells them plainly that the report and follow-ups are what they are signing
 * up for. What keeps that defensible rather than reckless is the unsubscribe
 * link on every email and the fact that it is honoured immediately — see the
 * unsubscribed_at check in the query below, which is not optional and must
 * not be removed.
 */
const STEPS = [
  { step: 1, afterDays: 1 },
  { step: 3, afterDays: 3 },
  { step: 6, afterDays: 6 },
];

/** Kept small so a run finishes well inside any request timeout. */
const MAX_PER_RUN = 25;

/**
 * Minimum gap between two emails to the same person.
 *
 * Without this the spacing of the sequence is a property of how often the
 * cron happens to run, not of the data. Anyone firing the route twice in an
 * afternoon — testing it, or catching up after an outage — would walk a
 * backlogged lead through the whole sequence in minutes. Twenty hours rather
 * than a full day so a daily job that drifts by an hour still fires.
 */
const MIN_GAP_HOURS = 20;

interface DueRow extends RowDataPacket {
  id: number;
  age_days: number;
  sent_steps: string | null;
  hours_since_last: number | null;
}

/**
 * Three outcomes, not two.
 *
 * A missing CRON_SECRET and a wrong one used to both answer 401, which meant
 * a silently dead scheduler looked identical from outside to one being
 * probed by a stranger. Saying which is which costs nothing — it reveals
 * only whether an environment variable exists, never its value — and it is
 * the difference between diagnosing this in a second and guessing at it.
 */
function authorised(request: Request): "ok" | "wrong_key" | "not_configured" {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return "not_configured";

  const header = request.headers.get("authorization");
  if (header === `Bearer ${secret}`) return "ok";

  // Hostinger's cron runs a shell command, and getting a header onto it is
  // fiddlier than a query string, so both are accepted.
  return new URL(request.url).searchParams.get("key") === secret ? "ok" : "wrong_key";
}

export async function POST(request: Request) {
  return run(request);
}

export async function GET(request: Request) {
  return run(request);
}

async function run(request: Request) {
  const auth = authorised(request);
  if (auth === "not_configured") {
    return NextResponse.json(
      {
        error: "cron_secret_not_configured",
        fix: "Add CRON_SECRET under Environment variables in hPanel, then redeploy.",
      },
      { status: 503 },
    );
  }
  if (auth !== "ok") {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const summary: Record<string, number> = { sent: 0, failed: 0, skipped: 0 };

  // Everyone who could be owed something: not contacted, not unsubscribed,
  // and old enough for at least the first step.
  const due = await withDb(async (db) => {
    const [rows] = await db.query<DueRow[]>(
      `SELECT l.id,
              TIMESTAMPDIFF(DAY, l.created_at, NOW()) AS age_days,
              GROUP_CONCAT(e.step) AS sent_steps,
              TIMESTAMPDIFF(HOUR, MAX(e.sent_at), NOW()) AS hours_since_last
       FROM scan_leads l
       LEFT JOIN lead_emails e ON e.lead_id = l.id
       WHERE l.contacted = 0
         AND l.unsubscribed_at IS NULL
         AND l.created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY l.id
       ORDER BY l.created_at ASC
       LIMIT ?`,
      [STEPS[0].afterDays, MAX_PER_RUN],
    );
    return rows;
  });

  if (!due) {
    return NextResponse.json({ error: "no_database" }, { status: 500 });
  }

  for (const row of due) {
    // Any existing row counts as attempted, including a failed one. Retrying
    // a bad address on every run forever helps nobody and harms the domain's
    // sending reputation.
    const already = new Set(
      (row.sent_steps ?? "").split(",").filter(Boolean).map(Number),
    );

    // Nothing within twenty hours of the last one, whatever the schedule did.
    if (row.hours_since_last !== null && row.hours_since_last < MIN_GAP_HOURS) {
      continue;
    }

    const next = STEPS.find(
      (candidate) => row.age_days >= candidate.afterDays && !already.has(candidate.step),
    );
    if (!next) continue;
    const step = next.step;

    const result = await sendFollowUp(row.id, step);
    if (result.ok) summary.sent += 1;
    else if (result.reason === "send_failed") summary.failed += 1;
    else summary.skipped += 1;
  }

  return NextResponse.json({ ok: true, ...summary });
}
