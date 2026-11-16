import type { RowDataPacket } from "mysql2";
import { withDb } from "@/lib/db";
import { runFollowUps } from "@/lib/run-follow-ups";

/**
 * The site's own scheduler, so the follow-up sequence does not depend on
 * anything outside the running server.
 *
 * Why this exists rather than a cron job in hPanel: there was a cron job in
 * hPanel. It was listed, on a sensible schedule, and the sequence sat dead
 * for a week — Hostinger's "View Output" showed an empty box that never
 * finished loading, so there was nothing to debug either. The comment above
 * the cron_runs table in db.ts is the record of that. Hanging the only
 * automatic thing the business does on a panel setting that silently stops
 * working is not a design, it is a hope.
 *
 * `next start` is one long-lived Node process, so a timer inside it is a
 * perfectly ordinary scheduler. What makes it trustworthy is that it does not
 * keep its own idea of when it last ran:
 *
 *  - Whether a run is due is read from the cron_runs table every time, so a
 *    restart, a deploy, or two processes behind a load balancer cannot cause
 *    a second run. The last run is the last run, whoever did it.
 *  - The work itself is idempotent. Nothing can be sent twice: the unique key
 *    on (lead_id, step) is what enforces that, not this file.
 *  - The hPanel cron job, if it is ever set up, can stay. Both can fire and
 *    the second one finds nothing due.
 *
 * It fails quietly on purpose. A scheduler that can take the website down is
 * worse than no scheduler.
 */

/** How often to wake up and ask whether a run is due. */
const TICK_MS = 30 * 60 * 1000;

/**
 * A pause before the first check, so a deploy serves pages before it thinks
 * about sending anything. Long enough for the database pool and the schema
 * check to settle, short enough that a restart is not a lost day.
 */
const SETTLE_MS = 2 * 60 * 1000;

/** Don't run again inside this many hours of the last finished run. */
const MIN_HOURS_BETWEEN_RUNS = 20;

/**
 * Sending hours, UK time.
 *
 * A marketing follow-up that arrives at 03:14 tells the person it was sent by
 * a machine before they have read a word of it. The server's own clock is not
 * necessarily London's, so the hour is read in Europe/London explicitly
 * rather than trusting process.env.TZ to be set on shared hosting.
 *
 * Twenty hours of enforced gap inside a ten-hour daily window always leaves a
 * slot, so this narrows when a run happens without ever preventing one.
 */
const SEND_FROM_HOUR = 9;
const SEND_UNTIL_HOUR = 18;

let armed = false;
let running = false;

interface LastRunRow extends RowDataPacket {
  hours_since: number | null;
}

function londonHour(now = new Date()): number {
  // en-GB with hour12: false gives "24" at midnight rather than "00", which
  // would sort below SEND_FROM_HOUR either way — but %24 keeps the number
  // honest in case the comparison ever changes.
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    hour12: false,
  }).format(now);
  return Number(hour) % 24;
}

/**
 * Asks the database when a run last finished, rather than remembering it.
 *
 * Returns null when the database cannot be reached, which is treated as "not
 * due": a scheduler that cannot tell whether it has already sent today must
 * not send.
 */
async function hoursSinceLastRun(): Promise<number | null> {
  const row = await withDb(async (db) => {
    const [[result]] = await db.query<LastRunRow[]>(
      `SELECT TIMESTAMPDIFF(HOUR, MAX(created_at), NOW()) AS hours_since
         FROM cron_runs
        WHERE job = 'follow-ups'`,
    );
    return result ?? null;
  });

  if (!row) return null;
  // No rows at all means it has never run: due immediately.
  return row.hours_since === null ? Number.POSITIVE_INFINITY : Number(row.hours_since);
}

async function tick() {
  if (running) return;

  const hour = londonHour();
  if (hour < SEND_FROM_HOUR || hour >= SEND_UNTIL_HOUR) return;

  const since = await hoursSinceLastRun();
  if (since === null || since < MIN_HOURS_BETWEEN_RUNS) return;

  running = true;
  try {
    const result = await runFollowUps();
    if (result.ok) {
      console.log(
        `[scheduler] follow-up run: ${result.sent} sent, ${result.failed} failed, ` +
          `${result.skipped} skipped, ${result.considered} considered, ` +
          `${result.prospects?.sent ?? 0} prospect follow-up(s)`,
      );
    } else {
      // No row is written in this case, so the admin health check will keep
      // reporting the job as not having run — which is the truth.
      console.error("[scheduler] follow-up run could not reach the database");
    }
  } catch (err) {
    console.error("[scheduler] follow-up run threw:", err);
  } finally {
    running = false;
  }
}

/**
 * Arms the timer. Called once from instrumentation.ts.
 *
 * Returns without doing anything unless this is a real production server, so
 * `next build`, `next dev` and the test runner never send a live email. Set
 * SCHEDULER=on to arm it anyway while developing.
 */
export function startScheduler() {
  if (armed) return;

  const forced = process.env.SCHEDULER === "on";
  if (!forced) {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;
    if (process.env.NODE_ENV !== "production") return;
    // Next sets this while prerendering pages, and those workers are Node
    // servers as far as the checks above are concerned.
    if (process.env.NEXT_PHASE === "phase-production-build") return;
  }

  armed = true;

  // unref so this timer alone never holds the process open. The HTTP server
  // is what keeps it alive; if the server is gone there is nothing to send
  // on behalf of.
  setTimeout(() => {
    void tick();
    setInterval(() => void tick(), TICK_MS).unref();
  }, SETTLE_MS).unref();

  console.log(
    `[scheduler] armed — checking every ${TICK_MS / 60000} minutes, ` +
      `sending between ${SEND_FROM_HOUR}:00 and ${SEND_UNTIL_HOUR}:00 UK time`,
  );
}
