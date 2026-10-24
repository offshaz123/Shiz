import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";

/** What the admin page reads. Nothing here writes. */

export type AdminLead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  marketingConsent: boolean;
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
  consented: number;
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
  marketing_consent: number;
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
      marketingConsent: row.marketing_consent === 1,
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
    const [[consented]] = await db.query<CountRow[]>(
      "SELECT COUNT(*) AS n FROM scan_leads WHERE marketing_consent = 1",
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
      consented: consented?.n ?? 0,
      uncontacted: uncontacted?.n ?? 0,
      viewsThisWeek: views?.n ?? 0,
      topPages: topPages.map((row) => ({ path: row.path, views: Number(row.views) })),
    };
  });
}
