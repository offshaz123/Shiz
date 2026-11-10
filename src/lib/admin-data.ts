import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";

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

export async function getCronHealth(): Promise<CronHealth | null> {
  return withDb(async (db) => {
    const [[row]] = await db.query<CronRow[]>(
      `SELECT MAX(created_at) AS last_run,
              SUBSTRING_INDEX(GROUP_CONCAT(detail ORDER BY created_at DESC SEPARATOR '|~|'), '|~|', 1) AS detail,
              TIMESTAMPDIFF(HOUR, MAX(created_at), NOW()) AS hours_since,
              SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS runs,
              SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN sent ELSE 0 END) AS sent
         FROM cron_runs
        WHERE job = 'follow-ups'`,
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
