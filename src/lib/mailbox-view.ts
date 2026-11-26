import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import { isRegion, type Region } from "./regions";
import { siteConfig } from "./site-config";

/**
 * Everything the Emails page shows about what has gone out.
 *
 * The replies half of that page is read live from the mailbox over IMAP;
 * this is the other half, and it comes from the database, because the
 * database is the only honest record of what we sent. Sending happens
 * through the server rather than from a mail client, so there is no Sent
 * folder holding the original — a copy is filed into one afterwards, and
 * a copy that failed to file is still an email that went.
 *
 * Walid's complaint was that the number of emails sent was not readable
 * anywhere: it had to be inferred from a chart. So the counts here are
 * plain counts, split by country and by the address they left from,
 * because he is about to add a second sending address.
 */

/** The address everything has gone from until now. */
export function defaultFrom(): string {
  return process.env.MAIL_FROM || process.env.SMTP_USER || siteConfig.email;
}

export type SentEmail = {
  id: string;
  /** The business, or the person who asked for an audit. */
  to: string;
  recipient: string;
  from: string;
  subject: string;
  /** 1, 2 or 3 in the sequence. */
  step: number;
  /** How many of the three have actually gone to this business. */
  ofThree: number;
  failed: boolean;
  sentAt: string;
  region: Region | null;
  kind: "outreach" | "audit";
  prospectId: number | null;
  /** The page built out of their own site that went with this email, and
   *  whether they have opened it. Null on everything else, which is most
   *  of the list. */
  preview: { url: string; expiresAt: string; opens: number } | null;
  /** They wrote back, so the sequence has stopped. */
  replied: boolean;
  /** Their address is dead, so none of it arrived. */
  dead: boolean;
};

export type MailboxCounts = {
  /** Sent today, and in the last seven days, per country. */
  today: Record<string, number>;
  week: Record<string, number>;
  /** Failed at the point of sending, last seven days. */
  failedWeek: number;
  /** Businesses whose address has been proved dead. */
  deadAddresses: number;
  /** Replies, counted from the prospects table rather than the mailbox,
   *  so the figure is the same whether or not IMAP answers. */
  repliesWeek: number;
  /** One row per address anything has been sent from. */
  byFrom: { from: string; n: number }[];
};

function toRegionOrNull(value: unknown): Region | null {
  return isRegion(value) ? value : null;
}

/**
 * The sent list, newest first.
 *
 * Outreach and the audit follow-ups in one list, because from the point
 * of view of "what has this mailbox sent today" they are the same thing.
 * Audit follow-ups have no country of their own — the people who filled
 * in the form on the website are not filed by one — so picking a country
 * leaves them out rather than claiming them for it.
 */
export async function listSent(
  region?: Region,
  limit = 100,
): Promise<SentEmail[] | null> {
  const only = isRegion(region) ? region : null;
  const OUT = only ? `AND p.region = '${only}'` : "";
  const AUDIT = only ? "AND 0" : "";
  const fallback = defaultFrom();

  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `(SELECT e.id,
               'outreach' AS kind,
               e.prospect_id,
               p.name AS to_name,
               e.recipient,
               e.sent_from,
               e.subject,
               e.step,
               e.status,
               e.sent_at,
               p.region,
               (p.replied_at IS NOT NULL) AS replied,
               (p.email_dead_at IS NOT NULL) AS dead,
               (SELECT COUNT(*) FROM prospect_emails c
                 WHERE c.prospect_id = e.prospect_id AND c.status = 'sent') AS of_three,
               v.token AS preview_token, v.slug AS preview_slug,
               v.expires_at AS preview_expires, v.opens AS preview_opens
          FROM prospect_emails e
          JOIN prospects p ON p.id = e.prospect_id
          -- The page built for them, so a day's sending can be read for
          -- which ones had something to look at behind them.
          LEFT JOIN prospect_previews v
            ON v.id = (SELECT MAX(v2.id) FROM prospect_previews v2
                        WHERE v2.prospect_id = e.prospect_id)
         WHERE 1 ${OUT})
       UNION ALL
       (SELECT e.id,
               'audit' AS kind,
               NULL AS prospect_id,
               l.name AS to_name,
               l.email AS recipient,
               NULL AS sent_from,
               e.subject,
               e.step,
               e.status,
               e.sent_at,
               NULL AS region,
               0 AS replied,
               0 AS dead,
               NULL AS of_three,
               -- An audit email belongs to a lead, not a prospect, so
               -- there is never a page behind it. Still has to be here:
               -- both halves of a union need the same columns.
               NULL AS preview_token, NULL AS preview_slug,
               NULL AS preview_expires, NULL AS preview_opens
          FROM lead_emails e
          JOIN scan_leads l ON l.id = e.lead_id
         WHERE 1 ${AUDIT})
       ORDER BY sent_at DESC
       LIMIT ?`,
      [limit],
    );

    return rows.map((r) => ({
      id: `${String(r.kind)}-${Number(r.id)}`,
      to: r.to_name ? String(r.to_name) : "(deleted)",
      recipient: r.recipient ? String(r.recipient) : "",
      // An empty column means it went before the column existed, which
      // means it went from the one address there was.
      from: r.sent_from ? String(r.sent_from) : fallback,
      subject: String(r.subject),
      step: Number(r.step ?? 1),
      ofThree: Number(r.of_three ?? 0),
      failed: String(r.status) !== "sent",
      sentAt: String(r.sent_at),
      region: toRegionOrNull(r.region),
      kind: String(r.kind) === "audit" ? ("audit" as const) : ("outreach" as const),
      prospectId: r.prospect_id === null ? null : Number(r.prospect_id),
      preview:
        r.preview_token && r.preview_slug
          ? {
              url: `${siteConfig.url}/preview/${String(r.preview_slug)}-${String(r.preview_token)}`,
              expiresAt: String(r.preview_expires ?? ""),
              opens: Number(r.preview_opens ?? 0),
            }
          : null,
      replied: Boolean(Number(r.replied ?? 0)),
      dead: Boolean(Number(r.dead ?? 0)),
    }));
  });
}

/**
 * The numbers across the top.
 *
 * Counted per country in one grouped query rather than one query each,
 * so the two can never be a few seconds apart and appear to disagree.
 */
export async function mailboxCounts(): Promise<MailboxCounts | null> {
  const fallback = defaultFrom();

  return withDb(async (db) => {
    const [sent] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT p.region,
              SUM(e.status = 'sent' AND e.sent_at >= CURDATE()) AS today,
              SUM(e.status = 'sent' AND e.sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS week,
              SUM(e.status <> 'sent' AND e.sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS failed
         FROM prospect_emails e
         JOIN prospects p ON p.id = e.prospect_id
        GROUP BY p.region`,
    );

    const [[audit]] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT SUM(status = 'sent' AND sent_at >= CURDATE()) AS today,
              SUM(status = 'sent' AND sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS week,
              SUM(status <> 'sent' AND sent_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS failed
         FROM lead_emails`,
    );

    const [byFrom] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT COALESCE(NULLIF(sent_from, ''), ?) AS f, COUNT(*) AS n
         FROM prospect_emails
        WHERE status = 'sent'
        GROUP BY f
        ORDER BY n DESC`,
      [fallback],
    );

    const [[extra]] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT (SELECT COUNT(*) FROM prospects WHERE email_dead_at IS NOT NULL) AS dead,
              (SELECT COUNT(*) FROM prospects
                WHERE replied_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) AS replies`,
    );

    const today: Record<string, number> = {};
    const week: Record<string, number> = {};
    let failedWeek = Number(audit?.failed ?? 0);

    for (const row of sent) {
      const key = String(row.region ?? "uk");
      today[key] = (today[key] ?? 0) + Number(row.today ?? 0);
      week[key] = (week[key] ?? 0) + Number(row.week ?? 0);
      failedWeek += Number(row.failed ?? 0);
    }

    // The audit follow-ups belong to no country, so they are their own
    // line rather than being added to one.
    today.audit = Number(audit?.today ?? 0);
    week.audit = Number(audit?.week ?? 0);

    return {
      today,
      week,
      failedWeek,
      deadAddresses: Number(extra?.dead ?? 0),
      repliesWeek: Number(extra?.replies ?? 0),
      byFrom: byFrom.map((r) => ({ from: String(r.f), n: Number(r.n) })),
    };
  });
}

/**
 * The full text of one sent email.
 *
 * Fetched when somebody opens a row rather than with the list. A hundred
 * and twenty bodies is most of a megabyte of text to answer a question
 * nobody has asked yet, and the list is the thing that has to be quick.
 */
export async function sentBody(
  kind: "outreach" | "audit",
  id: number,
): Promise<{ subject: string; body: string } | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { subject: string; body: string })[]>(
      kind === "outreach"
        ? "SELECT subject, body FROM prospect_emails WHERE id = ? LIMIT 1"
        : "SELECT subject, body FROM lead_emails WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] ? { subject: String(rows[0].subject), body: String(rows[0].body) } : null;
  });
  return found ?? null;
}

/**
 * Matches an address that has written to us against a business we wrote
 * to, so the inbox can say who it is rather than only what it is called.
 */
export async function sendersWeKnow(
  addresses: string[],
): Promise<Map<string, { id: number; name: string; region: Region }>> {
  const clean = [...new Set(addresses.map((a) => a.trim().toLowerCase()).filter(Boolean))];
  if (clean.length === 0) return new Map();

  const found = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & Record<string, unknown>)[]>(
      `SELECT id, name, email, region FROM prospects
        WHERE LOWER(email) IN (${clean.map(() => "?").join(",")})`,
      clean,
    );
    return rows;
  });

  const map = new Map<string, { id: number; name: string; region: Region }>();
  for (const row of found ?? []) {
    map.set(String(row.email).toLowerCase(), {
      id: Number(row.id),
      name: String(row.name),
      region: toRegionOrNull(row.region) ?? "uk",
    });
  }
  return map;
}
