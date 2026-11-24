import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { getCronHealth } from "./admin-data";
import { placesBudget } from "./google-business";
import { newPerRun } from "./outreach-warm-up";
import { REGIONS, REGION_INFO } from "./regions";

/**
 * What is likely to go wrong tomorrow.
 *
 * The system check answers "is anything broken now", which is a
 * different and easier question. Most of what actually costs this
 * business money announces itself a day in advance and nowhere in
 * particular: a call list that will be empty by the morning, a
 * callback somebody promised for tomorrow that nobody has looked at, a
 * month's search budget that runs out on the 19th, a daily job that
 * quietly stopped running on Sunday.
 *
 * None of that is broken. All of it is tomorrow's problem, and the
 * only time it is cheap to fix is today.
 *
 * Everything here is computed from the database or from a real
 * setting. There is no scoring and no guessing: a warning either has a
 * number behind it or it is not shown. A list that cried wolf would be
 * a list nobody reads, and this one is only worth having if the day it
 * says something, somebody acts.
 */

export type Risk = {
  /** "today" for something already wrong, "tomorrow" for what is coming. */
  when: "today" | "tomorrow";
  /** How much it matters. */
  level: "bad" | "worth-knowing";
  title: string;
  /** The number or fact behind it, in a sentence. */
  detail: string;
  /** What to do, when there is something to do. */
  fix?: string;
  href?: string;
};

interface Counts extends RowDataPacket {
  uk_left: number;
  us_left: number;
  callbacks_tomorrow: number;
  callbacks_overdue: number;
  due_tomorrow: number;
  ever_sent: number;
  unreviewed: number;
  no_way_in: number;
}

export async function whatCouldGoWrong(): Promise<Risk[]> {
  const [counts, followUps, finder] = await Promise.all([
    withDb(async (db) => {
      const [[row]] = await db.query<Counts[]>(
        `SELECT
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL AND region = 'uk'
               AND status IN ('new','no-answer') AND phone_dead_at IS NULL) AS uk_left,
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL AND region = 'us'
               AND status IN ('new','no-answer') AND phone_dead_at IS NULL) AS us_left,
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL
               AND callback_at = DATE_ADD(CURDATE(), INTERVAL 1 DAY)) AS callbacks_tomorrow,
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL AND callback_at < CURDATE()
               AND status NOT IN ('customer','not-interested')) AS callbacks_overdue,
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL AND sequence_started_at IS NOT NULL
               AND sequence_stopped_at IS NULL AND replied_at IS NULL
               AND email_dead_at IS NULL) AS due_tomorrow,
           (SELECT COUNT(*) FROM prospect_emails) AS ever_sent,
           (SELECT COUNT(*) FROM prospect_calls
             WHERE reviewed_at IS NULL AND logged_by IN ('phone','click')
               AND called_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS unreviewed,
           (SELECT COUNT(*) FROM prospects
             WHERE deleted_at IS NULL AND status IN ('new','no-answer')
               AND phone_dead_at IS NOT NULL
               AND (email IS NULL OR email = '' OR email_dead_at IS NOT NULL)) AS no_way_in`,
      );
      return row;
    }),
    getCronHealth("follow-ups"),
    getCronHealth("find-and-scan"),
  ]);

  const risks: Risk[] = [];
  const n = (v: unknown) => Number(v ?? 0);

  if (!counts) {
    return [
      {
        when: "today",
        level: "bad",
        title: "Cannot read the database",
        detail: "Nothing here can be checked while that is true.",
        href: "/admin/health",
      },
    ];
  }

  // A call list that runs out is the quietest failure there is: nobody
  // reports it, the morning just has nothing in it.
  const perRun = newPerRun(n(counts.ever_sent));
  for (const region of REGIONS) {
    const left = region === "uk" ? n(counts.uk_left) : n(counts.us_left);
    if (left === 0) {
      risks.push({
        when: "tomorrow",
        level: "bad",
        title: `Nothing left to ring in ${REGION_INFO[region].name}`,
        detail: "Every business on that list has been called or ruled out.",
        fix: "Run a search on Who to call, or let the finder do it overnight.",
        href: "/admin/prospects",
      });
    } else if (left <= perRun) {
      risks.push({
        when: "tomorrow",
        level: "worth-knowing",
        title: `${REGION_INFO[region].name} list is nearly empty`,
        detail: `${left} left to contact, which is about a day's work.`,
        fix: "Worth a search before it runs dry.",
        href: "/admin/prospects",
      });
    }
  }

  // Somebody said "ring me tomorrow". That promise is the single most
  // valuable thing on the list and the easiest to walk past.
  if (n(counts.callbacks_tomorrow) > 0) {
    risks.push({
      when: "tomorrow",
      level: "worth-knowing",
      title: `${n(counts.callbacks_tomorrow)} callback${n(counts.callbacks_tomorrow) === 1 ? "" : "s"} promised for tomorrow`,
      detail: "Somebody asked to be rung back on that day.",
      href: "/admin/today",
    });
  }

  if (n(counts.callbacks_overdue) > 0) {
    risks.push({
      when: "today",
      level: "bad",
      title: `${n(counts.callbacks_overdue)} callback${n(counts.callbacks_overdue) === 1 ? "" : "s"} already missed`,
      detail: "The day they asked to be rung back on has been and gone.",
      fix: "Ring them today and say so, or take the date off.",
      href: "/admin/today",
    });
  }

  // A job that stopped running does not tell anybody. The follow-ups
  // one is the expensive one: sequences simply stop mid-way.
  const stale = (hours: number | null) => hours !== null && hours > 36;
  if (!followUps || followUps.lastRunAt === null) {
    risks.push({
      when: "today",
      level: "bad",
      title: "The daily email job has never run",
      detail: "No follow-up has ever been sent by the system.",
      fix: "Check the scheduler on the system check page.",
      href: "/admin/health",
    });
  } else if (stale(followUps.hoursSince)) {
    risks.push({
      when: "today",
      level: "bad",
      title: "The daily email job has stopped",
      detail: `Nothing for ${followUps.hoursSince} hours. ${n(counts.due_tomorrow)} sequences are waiting on it.`,
      fix: "Check the scheduler on the system check page.",
      href: "/admin/health",
    });
  }

  if (finder && stale(finder.hoursSince)) {
    risks.push({
      when: "tomorrow",
      level: "worth-knowing",
      title: "No new businesses are being found",
      detail: `The search job has not run for ${finder.hoursSince} hours, so the list is not growing.`,
      href: "/admin/health",
    });
  }

  // The search budget is a real monthly cap with a real date attached:
  // spend it by the 19th and the list stops growing until the 1st.
  const places = placesBudget();
  if (places.hasKey && places.monthlyBudget > 0) {
    const used = places.thisMonth / places.monthlyBudget;
    const day = new Date().getUTCDate();
    const daysIn = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0)).getUTCDate();
    // Ahead of the month it is in: 60% spent on the 10th is a problem,
    // 60% spent on the 25th is fine.
    if (used > 0.9) {
      risks.push({
        when: "tomorrow",
        level: "bad",
        title: "The search budget is nearly gone",
        detail: `${Math.round(used * 100)}% of this month's Google budget is spent, with ${daysIn - day} days to go.`,
        fix: "Searching will stop until the 1st unless the budget is raised.",
        href: "/admin/health",
      });
    } else if (used > day / daysIn + 0.25) {
      risks.push({
        when: "tomorrow",
        level: "worth-knowing",
        title: "The search budget is going faster than the month",
        detail: `${Math.round(used * 100)}% spent on day ${day} of ${daysIn}.`,
        href: "/admin/health",
      });
    }
  }

  // Calls nobody wrote up. A week of these and the call list is back to
  // being a list of numbers with no history on it.
  if (n(counts.unreviewed) >= 3) {
    risks.push({
      when: "today",
      level: "worth-knowing",
      title: `${n(counts.unreviewed)} calls not written up`,
      detail: "Nobody has said what happened on them, so the next person learns nothing.",
      href: "/admin/prospects",
    });
  }

  // Businesses with a dead number and a dead address are dead weight:
  // they come back round the list and cost somebody the same minute.
  if (n(counts.no_way_in) > 0) {
    risks.push({
      when: "tomorrow",
      level: "worth-knowing",
      title: `${n(counts.no_way_in)} business${n(counts.no_way_in) === 1 ? "" : "es"} with no way of reaching them`,
      detail: "The number does not work and there is no address that does either.",
      fix: "Worth moving them to Deleted so they stop coming round.",
      href: "/admin/prospects",
    });
  }

  // Worst first, and today before tomorrow.
  const weight = (r: Risk) => (r.level === "bad" ? 0 : 2) + (r.when === "today" ? 0 : 1);
  return risks.sort((a, b) => weight(a) - weight(b));
}
