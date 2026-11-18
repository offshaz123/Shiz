import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { hashPassword } from "./client-auth";

/**
 * Reading and writing the client side of the database.
 *
 * The figures here are the four from the blog post, and they are the four
 * on purpose: enquiries split by where they came from, what each one cost,
 * how many became customers, and how long somebody waited for an answer.
 * Everything else a marketing report normally carries — impressions, reach,
 * click-through rate — is deliberately absent, because none of it changes
 * what anybody does on Monday.
 *
 * Nothing in this file can reach a campaign, a keyword or an audience. That
 * is not an oversight: a client dashboard that could show those would be
 * one configuration mistake away from showing them.
 */

export type ClientLead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  status: string;
  createdAt: string;
  firstRepliedAt: string | null;
  /** Hours between arriving and being answered. Null while unanswered. */
  hoursToReply: number | null;
};

export type SourceCount = { source: string; leads: number };

export type ClientSummary = {
  /** The month this covers, as YYYY-MM-01. */
  month: string;
  leads: number;
  bySource: SourceCount[];
  customers: number;
  spend: number;
  /** Null when there is no spend recorded: an unknown cost is not £0. */
  costPerLead: number | null;
  /** Null until at least one lead has been answered. */
  medianHoursToReply: number | null;
  answered: number;
};

export type MonthPoint = { month: string; leads: number; customers: number; spend: number };

interface LeadRow extends RowDataPacket {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  status: string;
  created_at: string;
  first_replied_at: string | null;
  hours_to_reply: number | null;
}

function toLead(row: LeadRow): ClientLead {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    message: row.message ?? "",
    source: row.source,
    status: row.status,
    createdAt: String(row.created_at),
    firstRepliedAt: row.first_replied_at ? String(row.first_replied_at) : null,
    hoursToReply: row.hours_to_reply === null ? null : Number(row.hours_to_reply),
  };
}

const LEAD_COLUMNS = `id, name, email, phone, message, source, status, created_at,
         first_replied_at,
         TIMESTAMPDIFF(HOUR, created_at, first_replied_at) AS hours_to_reply`;

/** This month unless told otherwise, as the first day of it. */
function monthStart(month?: string): string {
  if (month && /^\d{4}-\d{2}$/.test(month)) return `${month}-01`;
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export async function listClientLeads(
  clientId: number,
  limit = 100,
): Promise<ClientLead[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<LeadRow[]>(
      `SELECT ${LEAD_COLUMNS} FROM client_leads
        WHERE client_id = ?
        ORDER BY created_at DESC
        LIMIT ?`,
      [clientId, limit],
    );
    return rows.map(toLead);
  });
}

/**
 * The month's figures.
 *
 * The median is used for reply time rather than the mean, because one
 * enquiry answered a fortnight late drags an average into uselessness while
 * saying nothing about the normal day.
 */
export async function getClientSummary(
  clientId: number,
  month?: string,
): Promise<ClientSummary | null> {
  const start = monthStart(month);

  return withDb(async (db) => {
    const [[totals]] = await db.query<
      (RowDataPacket & { leads: number; customers: number; answered: number })[]
    >(
      `SELECT COUNT(*) AS leads,
              SUM(status = 'customer') AS customers,
              SUM(first_replied_at IS NOT NULL) AS answered
         FROM client_leads
        WHERE client_id = ?
          AND created_at >= ?
          AND created_at < DATE_ADD(?, INTERVAL 1 MONTH)`,
      [clientId, start, start],
    );

    const [sources] = await db.query<(RowDataPacket & { source: string; n: number })[]>(
      `SELECT source, COUNT(*) AS n
         FROM client_leads
        WHERE client_id = ?
          AND created_at >= ?
          AND created_at < DATE_ADD(?, INTERVAL 1 MONTH)
        GROUP BY source
        ORDER BY n DESC`,
      [clientId, start, start],
    );

    const [[spendRow]] = await db.query<(RowDataPacket & { total: string | null })[]>(
      `SELECT SUM(amount) AS total FROM client_spend
        WHERE client_id = ? AND month = ?`,
      [clientId, start],
    );

    // Median in SQL is awkward and this is a small set, so the reply hours
    // come back and are sorted here.
    const [replied] = await db.query<(RowDataPacket & { hours: number })[]>(
      `SELECT TIMESTAMPDIFF(HOUR, created_at, first_replied_at) AS hours
         FROM client_leads
        WHERE client_id = ?
          AND first_replied_at IS NOT NULL
          AND created_at >= ?
          AND created_at < DATE_ADD(?, INTERVAL 1 MONTH)`,
      [clientId, start, start],
    );

    const leads = Number(totals?.leads ?? 0);
    const spend = Number(spendRow?.total ?? 0);
    const hours = replied.map((r) => Number(r.hours)).sort((a, b) => a - b);
    const median =
      hours.length === 0
        ? null
        : hours.length % 2 === 1
          ? hours[(hours.length - 1) / 2]
          : Math.round((hours[hours.length / 2 - 1] + hours[hours.length / 2]) / 2);

    return {
      month: start,
      leads,
      bySource: sources.map((s) => ({ source: s.source, leads: Number(s.n) })),
      customers: Number(totals?.customers ?? 0),
      answered: Number(totals?.answered ?? 0),
      spend,
      // No spend recorded is not the same as free, so it reads as unknown.
      costPerLead: spend > 0 && leads > 0 ? Math.round((spend / leads) * 100) / 100 : null,
      medianHoursToReply: median,
    };
  });
}

/** Six months of totals, so a client can see a direction rather than a day. */
export async function getClientTrend(clientId: number): Promise<MonthPoint[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & { month: string; leads: number; customers: number })[]
    >(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-01') AS month,
              COUNT(*) AS leads,
              SUM(status = 'customer') AS customers
         FROM client_leads
        WHERE client_id = ?
          AND created_at >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
        GROUP BY month
        ORDER BY month ASC`,
      [clientId],
    );

    const [spend] = await db.query<(RowDataPacket & { month: string; total: string })[]>(
      `SELECT DATE_FORMAT(month, '%Y-%m-01') AS month, SUM(amount) AS total
         FROM client_spend
        WHERE client_id = ?
          AND month >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
        GROUP BY month`,
      [clientId],
    );
    const spendByMonth = new Map(spend.map((s) => [String(s.month), Number(s.total)]));

    return rows.map((r) => ({
      month: String(r.month),
      leads: Number(r.leads),
      customers: Number(r.customers),
      spend: spendByMonth.get(String(r.month)) ?? 0,
    }));
  });
}

/* ------------------------------------------------------------- admin ---- */

export type AdminClient = {
  id: number;
  slug: string;
  name: string;
  contactEmail: string;
  isActive: boolean;
  hasPassword: boolean;
  leads: number;
  createdAt: string;
  reviewLink: string;
  reviewRequestsOn: boolean;
};

export async function listClients(): Promise<AdminClient[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & {
        id: number;
        slug: string;
        name: string;
        contact_email: string | null;
        is_active: number;
        password_hash: string | null;
        created_at: string;
        leads: number;
        review_link: string | null;
        review_requests_on: number;
      })[]
    >(
      `SELECT c.id, c.slug, c.name, c.contact_email, c.is_active, c.password_hash, c.created_at,
              c.review_link, c.review_requests_on,
              (SELECT COUNT(*) FROM client_leads l WHERE l.client_id = c.id) AS leads
         FROM clients c
        ORDER BY c.is_active DESC, c.name ASC`,
    );
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      contactEmail: r.contact_email ?? "",
      isActive: Boolean(r.is_active),
      hasPassword: Boolean(r.password_hash),
      leads: Number(r.leads),
      createdAt: String(r.created_at),
      reviewLink: r.review_link ?? "",
      reviewRequestsOn: Boolean(r.review_requests_on),
    }));
  });
}

/** Returns the new client's id, or null if the slug is taken. */
export async function createClient(input: {
  slug: string;
  name: string;
  contactEmail: string;
  password: string;
}): Promise<number | null> {
  const slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
  if (!slug || !input.name.trim() || input.password.length < 8) return null;

  const { hash, salt } = hashPassword(input.password);
  const created = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT INTO clients (slug, name, contact_email, password_hash, password_salt)
       VALUES (?, ?, ?, ?, ?)`,
      [slug, input.name.trim().slice(0, 160), input.contactEmail.trim().slice(0, 200) || null, hash, salt],
    );
    return result.insertId;
  });
  return created ?? null;
}

export async function setClientPassword(id: number, password: string): Promise<boolean> {
  if (password.length < 8) return false;
  const { hash, salt } = hashPassword(password);
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE clients SET password_hash = ?, password_salt = ? WHERE id = ?",
      [hash, salt, id],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

export async function setClientActive(id: number, active: boolean): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE clients SET is_active = ? WHERE id = ?",
      [active ? 1 : 0, id],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

/**
 * Their review link, and whether to use it.
 *
 * Switching it on without a link does nothing on purpose: the send query
 * requires both, so a half-finished setup sends nothing rather than
 * sending something broken.
 */
export async function setClientReviews(
  id: number,
  changes: { reviewLink?: string; reviewRequestsOn?: boolean },
): Promise<boolean> {
  const sets: string[] = [];
  const params: (string | number)[] = [];

  if (changes.reviewLink !== undefined) {
    const link = changes.reviewLink.trim().slice(0, 500);
    // Either a real link or nothing. A half-typed address would be mailed
    // to their customers.
    if (link && !/^https?:\/\//i.test(link)) return false;
    sets.push("review_link = ?");
    params.push(link);
  }
  if (changes.reviewRequestsOn !== undefined) {
    sets.push("review_requests_on = ?");
    params.push(changes.reviewRequestsOn ? 1 : 0);
  }
  if (sets.length === 0) return false;

  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE clients SET ${sets.join(", ")} WHERE id = ?`,
      [...params, id],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

/** Writes a month's spend for one channel, correcting it if already set. */
export async function setClientSpend(
  clientId: number,
  month: string,
  channel: string,
  amount: number,
): Promise<boolean> {
  if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(amount) || amount < 0) return false;
  const done = await withDb(async (db) => {
    await db.execute(
      `INSERT INTO client_spend (client_id, month, channel, amount)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [clientId, `${month}-01`, channel.slice(0, 40), Math.round(amount * 100) / 100],
    );
    return true;
  });
  return done ?? false;
}

/** One enquiry arriving, from a client's form. */
export async function recordClientLead(
  clientId: number,
  lead: {
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    landingPage: string;
  },
): Promise<boolean> {
  const done = await withDb(async (db) => {
    await db.execute(
      `INSERT INTO client_leads (client_id, name, email, phone, message, source, landing_page)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        lead.name.slice(0, 160) || null,
        lead.email.slice(0, 200) || null,
        lead.phone.slice(0, 60) || null,
        lead.message.slice(0, 4000) || null,
        lead.source.slice(0, 40) || "website",
        lead.landingPage.slice(0, 255) || null,
      ],
    );
    return true;
  });
  return done ?? false;
}

export async function getClientBySlug(slug: string): Promise<{ id: number } | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { id: number })[]>(
      "SELECT id FROM clients WHERE slug = ? AND is_active = 1 LIMIT 1",
      [slug.trim().toLowerCase()],
    );
    return rows[0] ?? null;
  });
  return found ?? null;
}

/** Marks an enquiry answered, which is what makes reply time measurable. */
export async function markLeadAnswered(clientId: number, leadId: number): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE client_leads SET first_replied_at = COALESCE(first_replied_at, NOW())
        WHERE id = ? AND client_id = ?`,
      [leadId, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

export async function setLeadStatus(
  clientId: number,
  leadId: number,
  status: string,
): Promise<boolean> {
  if (!["new", "contacted", "quoted", "customer", "lost"].includes(status)) return false;
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE client_leads SET status = ? WHERE id = ? AND client_id = ?",
      [status, leadId, clientId],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}
