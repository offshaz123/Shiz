import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { logoUrlFor, logoUrlFrom } from "./client-logo";
import { normaliseAccountName } from "./account-name";
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
  /** What the job is worth, when they have put a number on it. */
  value: number | null;
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
  /** Total value of the leads marked won this month. */
  wonValue: number;
  /** Value won for every pound of advertising. Null without both figures,
   *  because a return with no spend behind it is not a return. */
  returnOnSpend: number | null;
  /** Still in play: everything not yet won or lost. */
  openValue: number;
  /** Every enquiry that reached each stage, newest stage last. */
  funnel: FunnelStep[];
};

/**
 * One rung of the funnel.
 *
 * `reached` counts everybody who got this far or further, not everybody
 * sitting on this stage right now. A lead that is Won reached Contacted
 * and Quoted on the way, and a funnel that forgot that would show the
 * business shrinking as it succeeded.
 */
export type FunnelStep = {
  stage: string;
  label: string;
  reached: number;
  /** Share of everybody who made it from the stage before. Null on the
   *  first rung, which has nothing to be a share of. */
  fromPrevious: number | null;
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
  value: string | null;
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
    value: row.value === null ? null : Number(row.value),
    createdAt: String(row.created_at),
    firstRepliedAt: row.first_replied_at ? String(row.first_replied_at) : null,
    hoursToReply: row.hours_to_reply === null ? null : Number(row.hours_to_reply),
  };
}

const LEAD_COLUMNS = `id, name, email, phone, message, source, status, value, created_at,
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
      (RowDataPacket & {
        leads: number;
        customers: number;
        answered: number;
        won_value: string | null;
        open_value: string | null;
      })[]
    >(
      `SELECT COUNT(*) AS leads,
              SUM(status = 'customer') AS customers,
              SUM(first_replied_at IS NOT NULL) AS answered,
              SUM(CASE WHEN status = 'customer' THEN value ELSE 0 END) AS won_value,
              SUM(CASE WHEN status NOT IN ('customer', 'lost') THEN value ELSE 0 END) AS open_value
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

    // Counted once and sliced here rather than six more queries. The
    // statuses are a path, so reaching one means having reached the
    // earlier ones, whether or not it was recorded at the time.
    const [stageRows] = await db.query<(RowDataPacket & { status: string; n: number })[]>(
      `SELECT status, COUNT(*) AS n
         FROM client_leads
        WHERE client_id = ?
          AND created_at >= ?
          AND created_at < DATE_ADD(?, INTERVAL 1 MONTH)
        GROUP BY status`,
      [clientId, start, start],
    );
    const byStatus = new Map(stageRows.map((r) => [r.status, Number(r.n)]));
    const count = (...names: string[]) =>
      names.reduce((sum, name) => sum + (byStatus.get(name) ?? 0), 0);

    const leads = Number(totals?.leads ?? 0);
    const spend = Number(spendRow?.total ?? 0);
    const wonValue = Number(totals?.won_value ?? 0);
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
      wonValue,
      openValue: Number(totals?.open_value ?? 0),
      funnel: (() => {
        const rungs = [
          { stage: "enquired", label: "Enquiries", reached: leads },
          {
            stage: "answered",
            label: "Answered",
            reached: Number(totals?.answered ?? 0),
          },
          {
            stage: "quoted",
            label: "Quoted",
            reached: count("quoted", "customer", "lost"),
          },
          { stage: "customer", label: "Won", reached: count("customer") },
        ];
        return rungs.map((rung, i) => ({
          ...rung,
          fromPrevious:
            i === 0 || rungs[i - 1].reached === 0
              ? null
              : Math.round((rung.reached / rungs[i - 1].reached) * 1000) / 10,
        }));
      })(),
      returnOnSpend:
        spend > 0 && wonValue > 0 ? Math.round((wonValue / spend) * 10) / 10 : null,
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
  defaultLeadValue: number | null;
  logoUrl: string;
  autoReplyOn: boolean;
  autoReplyText: string;
  /** When the last enquiry arrived, or "" if none ever has. A client who
   *  has gone quiet is the one thing on the list worth noticing. */
  lastLeadAt: string;
  /** When they last signed in, or "" if they never have. */
  lastLoginAt: string;
  /** Their line of work, for the ideas page. "" means not set. */
  trade: string;
  /** What their website scored last time we looked, or null. */
  siteScore: number | null;
  siteIssues: { label: string; why: string }[];
  siteScannedAt: string;
  /** Their own website, as typed on the admin side. */
  businessWebsite: string;
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
        default_lead_value: string | null;
        logo_url: string | null;
        auto_reply_on: number;
        auto_reply_text: string | null;
        logo_updated_at: string | null;
        last_lead_at: string | null;
        last_login_at: string | null;
        trade: string | null;
        site_score: number | null;
        site_issues: string | null;
        site_scanned_at: string | null;
        business_website: string | null;
      })[]
    >(
      `SELECT c.id, c.slug, c.name, c.contact_email, c.is_active, c.password_hash, c.created_at,
              c.review_link, c.review_requests_on, c.default_lead_value,
              c.logo_url, c.auto_reply_on, c.auto_reply_text, c.last_login_at, c.trade,
              c.site_score, c.site_issues, c.site_scanned_at, c.business_website,
              (SELECT l.updated_at FROM client_logos l WHERE l.client_id = c.id)
                AS logo_updated_at,
              (SELECT COUNT(*) FROM client_leads l WHERE l.client_id = c.id) AS leads,
              (SELECT MAX(l.created_at) FROM client_leads l WHERE l.client_id = c.id)
                AS last_lead_at
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
      defaultLeadValue: r.default_lead_value === null ? null : Number(r.default_lead_value),
      logoUrl: logoUrlFrom(r.slug, r.logo_updated_at ? String(r.logo_updated_at) : null, r.logo_url ?? ""),
      autoReplyOn: Boolean(r.auto_reply_on),
      autoReplyText: r.auto_reply_text ?? "",
      lastLeadAt: r.last_lead_at === null ? "" : String(r.last_lead_at),
      lastLoginAt: r.last_login_at === null ? "" : String(r.last_login_at),
      trade: r.trade ?? "",
      siteScore: r.site_score === null ? null : Number(r.site_score),
      // Written by us and read straight back, but still guarded: a row
      // half-written by an interrupted deploy should not take a page down.
      siteIssues: parseIssues(r.site_issues),
      siteScannedAt: r.site_scanned_at === null ? "" : String(r.site_scanned_at),
      businessWebsite: r.business_website ?? "",
    }));
  });
}

/**
 * One client's whole record, by the name they sign in with.
 *
 * Reads the list rather than its own query: the list is already one row
 * per client with every column the admin side shows, and a second query
 * that selects nearly the same columns is a second place to forget a new
 * one. There are tens of clients, not thousands.
 *
 * Deliberately not filtered by is_active. A paused client is exactly the
 * one somebody needs to open, to see why and to switch them back on.
 */
export async function getAdminClient(slug: string): Promise<AdminClient | null> {
  const wanted = slug.trim().toLowerCase();
  const all = await listClients();
  return all?.find((client) => client.slug === wanted) ?? null;
}

/** Returns the new client's id, or null if the slug is taken. */
export async function createClient(input: {
  slug: string;
  name: string;
  contactEmail: string;
  password: string;
}): Promise<number | null> {
  // The same fold the login box puts what gets typed through, so that a
  // client typing their business name the way they write it lands on the
  // name this made for them.
  const slug = normaliseAccountName(input.slug);
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
/** The instant reply, and the logo on their portal. */
function parseIssues(raw: string | null): { label: string; why: string }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is { label: string; why: string } =>
          typeof row === "object" &&
          row !== null &&
          typeof (row as { label?: unknown }).label === "string" &&
          typeof (row as { why?: unknown }).why === "string",
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

/** What their website scored, and the few things most worth fixing. */
export async function setSiteScan(
  id: number,
  scan: { score: number; issues: { label: string; why: string }[] },
): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE clients
          SET site_score = ?, site_issues = ?, site_scanned_at = NOW()
        WHERE id = ?`,
      [
        Math.min(100, Math.max(0, Math.round(scan.score))),
        JSON.stringify(scan.issues.slice(0, 6)),
        id,
      ],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

/** The line of work they are in, for the ideas page. */
export async function setClientTrade(id: number, trade: string): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE clients SET trade = ? WHERE id = ?",
      [trade.trim().slice(0, 40) || null, id],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

export async function setClientBranding(
  id: number,
  changes: { logoUrl?: string; autoReplyOn?: boolean; autoReplyText?: string },
): Promise<boolean> {
  const sets: string[] = [];
  const params: (string | number)[] = [];

  if (changes.logoUrl !== undefined) {
    const url = changes.logoUrl.trim().slice(0, 500);
    // Either a real address or nothing. A half-typed one renders as a
    // broken image at the top of their dashboard.
    if (url && !/^https?:\/\//i.test(url)) return false;
    sets.push("logo_url = ?");
    params.push(url);
  }
  if (changes.autoReplyOn !== undefined) {
    sets.push("auto_reply_on = ?");
    params.push(changes.autoReplyOn ? 1 : 0);
  }
  if (changes.autoReplyText !== undefined) {
    sets.push("auto_reply_text = ?");
    params.push(changes.autoReplyText.slice(0, 2000));
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

export async function setDefaultLeadValue(
  id: number,
  value: number | null,
): Promise<boolean> {
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 99_999_999)) return false;
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE clients SET default_lead_value = ? WHERE id = ?",
      [value === null ? null : Math.round(value * 100) / 100, id],
    );
    return result.affectedRows > 0;
  });
  return done ?? false;
}

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
/** Returns the new lead's id, so the instant reply knows what to stamp. */
export async function recordClientLead(
  clientId: number,
  lead: {
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    landingPage: string;
    /**
     * Set when the client typed it in themselves rather than it arriving
     * from a form. Their own figure still fills in when this is null, so
     * one typed by hand with no price on it behaves like any other.
     */
    value?: number | null;
    /** Where it already is. Somebody adding a job they quoted last week
     *  should not have to mark it twice. */
    status?: string;
    /** Set when it is being added after the fact and was answered at the
     *  time, so their reply time is not ruined by their own book-keeping. */
    alreadyAnswered?: boolean;
  },
): Promise<number | null> {
  const done = await withDb(async (db) => {
    // The client's own figure, read at the moment the lead arrives rather
    // than joined at read time. A business that puts its average job up
    // from £400 to £600 should not have last year's enquiries silently
    // revalue themselves.
    const status =
      lead.status && ["new", "contacted", "quoted", "customer", "lost"].includes(lead.status)
        ? lead.status
        : "new";

    await db.execute(
      `INSERT INTO client_leads
         (client_id, name, email, phone, message, source, landing_page, value,
          status, first_replied_at)
       SELECT ?, ?, ?, ?, ?, ?, ?, COALESCE(?, default_lead_value), ?, ?
         FROM clients WHERE id = ?`,
      [
        clientId,
        lead.name.slice(0, 160) || null,
        lead.email.slice(0, 200) || null,
        lead.phone.slice(0, 60) || null,
        lead.message.slice(0, 4000) || null,
        lead.source.slice(0, 40) || "website",
        lead.landingPage.slice(0, 255) || null,
        lead.value ?? null,
        status,
        lead.alreadyAnswered ? new Date() : null,
        clientId,
      ],
    );
    const [[row]] = await db.query<(RowDataPacket & { id: number })[]>(
      "SELECT LAST_INSERT_ID() AS id",
    );
    return Number(row?.id ?? 0) || null;
  });
  return done ?? null;
}

/**
 * Kept as a name the pages already call, now answered by one helper.
 *
 * It used to read `logo_url` alone, which is the address an admin types
 * in. Once clients could upload their own, that meant the logo showed on
 * their invoices and not in their own side column — the same business
 * looking like two different ones on two screens of the same site.
 */
export async function getClientLogo(clientId: number): Promise<string> {
  return logoUrlFor(clientId);
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

/**
 * What the job came to.
 *
 * Separate from the status because the two do not always move together: a
 * quote gets a number before anybody has won anything, and a figure gets
 * corrected after the fact without the stage changing.
 */
export async function setLeadValue(
  clientId: number,
  leadId: number,
  value: number | null,
): Promise<boolean> {
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 99_999_999)) return false;
  const done = await withDb(async (db) => {
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE client_leads SET value = ? WHERE id = ? AND client_id = ?",
      [value === null ? null : Math.round(value * 100) / 100, leadId, clientId],
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
