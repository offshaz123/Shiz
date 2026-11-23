import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { isRegion, type Region } from "./regions";

/** What the admin page reads. Nothing here writes. */

export type AdminLead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  unsubscribed: boolean;
  score: number | null;
  referrer: string | null;
  contacted: boolean;
  notes: string | null;
  createdAt: string;
  /** Which follow-up steps have actually been sent, e.g. [1, 3]. */
  emailsSent: number[];
};

export type AdminStats = {
  totalLeads: number;
  leadsThisWeek: number;
  unsubscribed: number;
  uncontacted: number;
  viewsThisWeek: number;
  topPages: { path: string; views: number }[];
};

interface LeadRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  unsubscribed_at: Date | null;
  score: number | null;
  referrer: string | null;
  contacted: number;
  notes: string | null;
  created_at: Date;
  steps: string | null;
}

export async function getLeads(limit = 200): Promise<AdminLead[] | null> {
  return withDb(async (db) => {
    // GROUP_CONCAT keeps this to one query rather than one per lead. The list
    // is small enough that the join costs nothing and it avoids the N+1.
    const [rows] = await db.query<LeadRow[]>(
      `SELECT l.*, GROUP_CONCAT(e.step ORDER BY e.step) AS steps
       FROM scan_leads l
       LEFT JOIN lead_emails e ON e.lead_id = l.id AND e.status = 'sent'
       GROUP BY l.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      website: row.website,
      unsubscribed: row.unsubscribed_at !== null,
      score: row.score,
      referrer: row.referrer,
      contacted: row.contacted === 1,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      emailsSent: row.steps ? row.steps.split(",").map(Number) : [],
    }));
  });
}

interface CountRow extends RowDataPacket {
  n: number;
}
interface PageRow extends RowDataPacket {
  path: string;
  views: number;
}

/**
 * The prospecting pipeline, one row per country.
 *
 * Walid asked for both markets on the overview with a way to look at each.
 * Written as one grouped query rather than one query per country, so the
 * two can never be a few seconds apart and appear to disagree.
 */
export type RegionStats = {
  region: string;
  found: number;
  withWebsite: number;
  noWebsite: number;
  scanned: number;
  withEmail: number;
  emailed: number;
  called: number;
  replied: number;
  interested: number;
  customers: number;
  deadEmails: number;
  /** Found in the last seven days, so a market that has stalled shows it. */
  foundThisWeek: number;
};

export async function getRegionStats(): Promise<RegionStats[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT p.region,
              COUNT(*) AS found,
              SUM(p.website IS NOT NULL AND p.website <> '') AS with_website,
              SUM(p.website IS NULL OR p.website = '') AS no_website,
              SUM(p.scanned_at IS NOT NULL) AS scanned,
              SUM(p.email IS NOT NULL AND p.email <> '' AND p.email_dead_at IS NULL) AS with_email,
              SUM(p.email_dead_at IS NOT NULL) AS dead_emails,
              SUM(p.sequence_started_at IS NOT NULL) AS emailed,
              SUM(p.called_at IS NOT NULL) AS called,
              SUM(p.replied_at IS NOT NULL) AS replied,
              SUM(p.status = 'interested') AS interested,
              SUM(p.status = 'customer') AS customers,
              SUM(p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS found_this_week
         FROM prospects p
        WHERE p.deleted_at IS NULL
        GROUP BY p.region`,
    );
    return rows.map((r) => ({
      region: String(r.region ?? "uk"),
      found: Number(r.found ?? 0),
      withWebsite: Number(r.with_website ?? 0),
      noWebsite: Number(r.no_website ?? 0),
      scanned: Number(r.scanned ?? 0),
      withEmail: Number(r.with_email ?? 0),
      deadEmails: Number(r.dead_emails ?? 0),
      emailed: Number(r.emailed ?? 0),
      called: Number(r.called ?? 0),
      replied: Number(r.replied ?? 0),
      interested: Number(r.interested ?? 0),
      customers: Number(r.customers ?? 0),
      foundThisWeek: Number(r.found_this_week ?? 0),
    }));
  });
}

export async function getStats(): Promise<AdminStats | null> {
  return withDb(async (db) => {
    const week = "DATE_SUB(NOW(), INTERVAL 7 DAY)";

    const [[total]] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS n FROM scan_leads",
    );
    const [[recent]] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS n FROM scan_leads WHERE created_at >= ${week}`,
    );
    const [[unsubscribed]] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS n FROM scan_leads WHERE unsubscribed_at IS NOT NULL",
    );
    const [[uncontacted]] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS n FROM scan_leads WHERE contacted = 0",
    );
    const [[views]] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS n FROM page_views WHERE created_at >= ${week}`,
    );
    const [topPages] = await db.query<PageRow[]>(
      `SELECT path, COUNT(*) AS views FROM page_views
       WHERE created_at >= ${week}
       GROUP BY path ORDER BY views DESC LIMIT 8`,
    );

    return {
      totalLeads: total?.n ?? 0,
      leadsThisWeek: recent?.n ?? 0,
      unsubscribed: unsubscribed?.n ?? 0,
      uncontacted: uncontacted?.n ?? 0,
      viewsThisWeek: views?.n ?? 0,
      topPages: topPages.map((row) => ({ path: row.path, views: Number(row.views) })),
    };
  });
}

/**
 * When the follow-up scheduler last ran, and what it did.
 *
 * `lastRunAt` being null does not mean "no emails went out" — it means the
 * job has not reached the end of a run since this table existed. That is the
 * distinction the admin page needs: a scheduler that runs daily and finds
 * nobody due looks, from the leads table alone, exactly like one that is
 * dead. It was dead for a week and nothing said so.
 */
export type CronHealth = {
  lastRunAt: string | null;
  hoursSince: number | null;
  sentLast7Days: number;
  runsLast7Days: number;
  /** What the most recent run said it did. */
  lastDetail: string | null;
};

interface CronRow extends RowDataPacket {
  last_run: string | null;
  hours_since: number | null;
  runs: number;
  sent: number;
  detail: string | null;
}

/**
 * Leaves a record that a scheduled job ran, whatever it found to do.
 *
 * Shared, because there are two jobs now and the second one shipped without
 * this. A job that runs and finds nothing to do is indistinguishable from
 * one that never ran, and that exact confusion cost this site a week of
 * dead follow-ups once already.
 *
 * Never throws. Failing to write the diary must not fail the work that
 * just happened.
 */
export async function recordCronRun(
  job: string,
  run: { sent?: number; failed?: number; skipped?: number; considered?: number; detail?: string },
): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `INSERT INTO cron_runs (job, sent, failed, skipped, considered, detail)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [job, run.sent ?? 0, run.failed ?? 0, run.skipped ?? 0, run.considered ?? 0, run.detail ?? null],
    );
  }).catch(() => null);
}

export async function getCronHealth(job = "follow-ups"): Promise<CronHealth | null> {
  return withDb(async (db) => {
    const [[row]] = await db.query<CronRow[]>(
      `SELECT MAX(created_at) AS last_run,
              SUBSTRING_INDEX(GROUP_CONCAT(detail ORDER BY created_at DESC SEPARATOR '|~|'), '|~|', 1) AS detail,
              TIMESTAMPDIFF(HOUR, MAX(created_at), NOW()) AS hours_since,
              SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS runs,
              SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN sent ELSE 0 END) AS sent
         FROM cron_runs
        WHERE job = ?`,
      [job],
    );

    return {
      lastRunAt: row?.last_run ? String(row.last_run) : null,
      hoursSince: row?.hours_since === null || row?.hours_since === undefined
        ? null
        : Number(row.hours_since),
      runsLast7Days: Number(row?.runs ?? 0),
      sentLast7Days: Number(row?.sent ?? 0),
      // What the last run said about itself. "nobody was due" is the normal
      // case; the one worth showing is a run that held follow-ups back
      // because it could not read the inbox.
      lastDetail: row?.detail ? String(row.detail) : null,
    };
  });
}

/**
 * Everything the site has emailed on its own, newest first.
 *
 * Walid asked for this as its own section so he can see what is being sent
 * without his hand on it. That question had no answer until now: the first
 * prospect email used to be a person pressing send, so the step number told
 * you who sent it, and once the scheduler started sending step 1 as well the
 * step number stopped meaning anything. Hence sent_by on prospect_emails.
 *
 * Two sources, because there are two sequences and both are automatic:
 *
 *  - prospect_emails where sent_by = 'auto'. Cold outreach to businesses off
 *    the call list, steps 1, 2 and 3.
 *  - lead_emails, all of it. The day 1, 3 and 6 follow-ups to people who
 *    asked for a website audit. There is no hand-sent path into that table,
 *    so there is nothing to filter.
 *
 * A failed send is included deliberately and labelled. "Nothing went out
 * today" and "four tried and the mail server refused all four" look
 * identical on a page that only lists successes, and the second one is the
 * one worth getting out of bed for.
 */
export type AutomaticEmail = {
  id: string;
  /** The business or person it went to. */
  to: string;
  recipient: string;
  subject: string;
  step: number;
  failed: boolean;
  sentAt: string;
  /** Which sequence: cold outreach, or an audit follow-up. */
  kind: "outreach" | "audit";
  /** The prospect this belongs to, so the row can link to their profile.
   *  Null for audit follow-ups, which are leads rather than prospects and
   *  have no profile page to go to. */
  prospectId: number | null;
  /** How many of the three have now gone to this business, so a row can say
   *  "2 of 3" and where that leaves them. A list of names and step numbers
   *  tells you what happened; this is what tells you what happens next. */
  ofThree: number;
  /** True once all three have gone and nobody replied: the row that turns
   *  into a phone call. */
  readyToCall: boolean;
  /** Their address has been proved dead, so none of it arrived. A different
   *  row to "they ignored us", and it should not be dressed as one. */
  addressDead: boolean;
};

export type AutomaticEmailLog = {
  recent: AutomaticEmail[];
  sentToday: number;
  sentLast7Days: number;
  failedLast7Days: number;
};

interface AutoRow extends RowDataPacket {
  id: number;
  prospect_id: number | null;
  of_three: number | null;
  replied: number | null;
  dead: number | null;
  to_name: string | null;
  recipient: string | null;
  subject: string;
  step: number;
  status: string;
  sent_at: string;
  kind: "outreach" | "audit";
}

export async function getAutomaticEmails(
  limit = 40,
  region?: Region,
): Promise<AutomaticEmailLog | null> {
  // Same reasoning as engine-room: one of two literals, checked at
  // runtime because it is written into SQL rather than bound.
  const only = isRegion(region) ? region : null;
  // The audit follow-ups go to people who filled in the form on the
  // British site. They have no region of their own, so when one country
  // is picked they are left out rather than claimed for it.
  const OUT = only ? `AND p.region = '${only}'` : "";
  const AUDIT = only ? "AND 0" : "";
  return withDb(async (db) => {
    // UNION ALL rather than two round trips, so the ordering across both
    // sequences is the database's job and the page cannot show a mixed list
    // that is only sorted within each half.
    const [rows] = await db.query<AutoRow[]>(
      `(SELECT e.id,
               e.prospect_id,
               p.name AS to_name,
               e.recipient,
               e.subject,
               e.step,
               e.status,
               e.sent_at,
               'outreach' AS kind,
               (SELECT COUNT(*) FROM prospect_emails c
                 WHERE c.prospect_id = e.prospect_id AND c.status = 'sent') AS of_three,
               (p.replied_at IS NOT NULL OR p.unsubscribed_at IS NOT NULL) AS replied,
               (p.email_dead_at IS NOT NULL) AS dead
          FROM prospect_emails e
          JOIN prospects p ON p.id = e.prospect_id
         WHERE e.sent_by = 'auto' ${OUT})
       UNION ALL
       (SELECT e.id,
               NULL AS prospect_id,
               l.name AS to_name,
               l.email AS recipient,
               e.subject,
               e.step,
               e.status,
               e.sent_at,
               'audit' AS kind,
               NULL AS of_three,
               NULL AS replied,
               NULL AS dead
          FROM lead_emails e
          JOIN scan_leads l ON l.id = e.lead_id
         WHERE 1 ${AUDIT})
       ORDER BY sent_at DESC
       LIMIT ?`,
      [limit],
    );

    const [[totals]] = await db.query<
      (RowDataPacket & { today: number; week: number; failed: number })[]
    >(
      `SELECT
         SUM(sent_at >= CURDATE() AND status = 'sent') AS today,
         SUM(sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status = 'sent') AS week,
         SUM(sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status <> 'sent') AS failed
       FROM (
         SELECT e.sent_at, e.status FROM prospect_emails e
           JOIN prospects p ON p.id = e.prospect_id
          WHERE e.sent_by = 'auto' ${OUT}
         UNION ALL
         SELECT sent_at, status FROM lead_emails WHERE 1 ${AUDIT}
       ) AS automatic`,
    );

    return {
      recent: rows.map((row) => ({
        id: `${row.kind}-${row.id}`,
        to: row.to_name ? String(row.to_name) : "(deleted)",
        recipient: row.recipient ? String(row.recipient) : "",
        subject: String(row.subject),
        step: Number(row.step),
        failed: row.status !== "sent",
        sentAt: String(row.sent_at),
        kind: row.kind,
        prospectId: row.prospect_id === null ? null : Number(row.prospect_id),
        ofThree: Number(row.of_three ?? 0),
        readyToCall:
          row.kind === "outreach" &&
          Number(row.of_three ?? 0) >= 3 &&
          !Number(row.replied ?? 0) &&
          !Number(row.dead ?? 0),
        addressDead: Boolean(Number(row.dead ?? 0)),
      })),
      sentToday: Number(totals?.today ?? 0),
      sentLast7Days: Number(totals?.week ?? 0),
      failedLast7Days: Number(totals?.failed ?? 0),
    };
  });
}
