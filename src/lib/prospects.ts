import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { withDb } from "./db";
import { prospectUnsubscribeUrl } from "./unsubscribe-url";
import type { GoogleBusiness } from "./google-business";
import {
  isStatus as isValidStatus,
  type Prospect,
  type ProspectStatus,
  type ProspectFinding,
} from "./prospect-types";

/**
 * The call list.
 *
 * A search on its own is a list you lose the moment you close the tab, and
 * the second search gives you the same names with no memory of which ones
 * already said no. So everything found is kept, keyed on Google's place ID,
 * and what you write on a row — the status, the notes, when you rang — is
 * yours and survives every later search of the same area.
 */

// The statuses and the row shape live in prospect-types.ts, which imports
// nothing — the call-list UI needs them in the browser and must not drag the
// MySQL driver in with them.
export { STATUSES, isStatus } from "./prospect-types";
export type { Prospect, ProspectStatus, ProspectFinding } from "./prospect-types";

interface ProspectRow extends RowDataPacket {
  id: number;
  place_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  category: string | null;
  maps_uri: string | null;
  reviews: number;
  rating: string | number | null;
  site_score: string | number | null;
  site_findings: string | null;
  scanned_at: string | null;
  status: string;
  notes: string | null;
  called_at: string | null;
  emailed_at: string | null;
  sequence_started_at: string | null;
  sequence_stopped_at: string | null;
  sequence_stop_reason: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  found_for: string | null;
  industry: string | null;
}

interface SentEmailRow extends RowDataPacket {
  subject: string;
  body: string;
  step: number | null;
  status: string;
  sent_at: string;
}

/** Stored as JSON and only ever read back whole. Bad JSON means no findings,
 *  never a crash: a malformed column must not take the call list down. */
function parseFindings(raw: string | null): ProspectFinding[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((f): f is ProspectFinding =>
        typeof f === "object" && f !== null && typeof (f as ProspectFinding).label === "string")
      .map((f) => ({ label: String(f.label), why: String(f.why ?? "") }));
  } catch {
    return [];
  }
}

function toProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    placeId: row.place_id,
    name: row.name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    website: row.website ?? "",
    address: row.address ?? "",
    category: row.category ?? "",
    mapsUri: row.maps_uri ?? "",
    reviews: Number(row.reviews),
    rating: row.rating === null ? null : Number(row.rating),
    siteScore: row.site_score === null ? null : Number(row.site_score),
    findings: parseFindings(row.site_findings),
    scannedAt: row.scanned_at ? String(row.scanned_at) : null,
    status: isValidStatus(row.status) ? row.status : "new",
    notes: row.notes ?? "",
    calledAt: row.called_at ? String(row.called_at) : null,
    emailedAt: row.emailed_at ? String(row.emailed_at) : null,
    sequenceStartedAt: row.sequence_started_at ? String(row.sequence_started_at) : null,
    sequenceStoppedAt: row.sequence_stopped_at ? String(row.sequence_stopped_at) : null,
    sequenceStopReason: row.sequence_stop_reason ?? "",
    repliedAt: row.replied_at ? String(row.replied_at) : null,
    unsubscribedAt: row.unsubscribed_at ? String(row.unsubscribed_at) : null,
    unsubscribeUrl: prospectUnsubscribeUrl(row.id),
    foundFor: row.found_for ?? "",
    industry: row.industry ?? "",
  };
}

/**
 * Files away everything a search found.
 *
 * On a repeat sighting the listing figures are refreshed — review counts
 * move, that is rather the point — but status, notes and called_at are left
 * alone. Nothing a search returns should ever be able to wipe out the fact
 * that somebody already said no.
 */
export async function saveProspects(
  businesses: GoogleBusiness[],
  foundFor: string,
  industry: string,
): Promise<void> {
  const rows = businesses.filter((b) => b.id);
  if (rows.length === 0) return;

  await withDb(async (db) => {
    for (const b of rows) {
      await db.execute(
        `INSERT INTO prospects
           (place_id, name, phone, website, address, category, maps_uri, reviews, rating, found_for, industry)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           phone = VALUES(phone),
           website = VALUES(website),
           address = VALUES(address),
           category = VALUES(category),
           maps_uri = VALUES(maps_uri),
           reviews = VALUES(reviews),
           rating = VALUES(rating),
           -- Keeps whichever industry it was first filed under rather than
           -- blanking it when the same firm turns up in a plain text search.
           industry = COALESCE(NULLIF(VALUES(industry), ''), industry)`,
        [
          b.id,
          b.name.slice(0, 200),
          b.phone.slice(0, 60) || null,
          b.websiteUri.slice(0, 255) || null,
          b.address.slice(0, 255) || null,
          b.category.slice(0, 120) || null,
          b.mapsUri.slice(0, 500) || null,
          b.reviews,
          b.rating,
          foundFor.slice(0, 160),
          industry.slice(0, 40),
        ],
      );
    }
  }).catch(() => null);
}

export type ProspectFilters = {
  maxReviews?: number;
  minRating?: number;
  status?: ProspectStatus | "all" | "to-call";
  industry?: string;
  /** "worst-site" puts the most broken websites first, which is the order
   *  you want to ring in: the worse the site, the more there is to say. */
  sort?: "default" | "worst-site";
  limit?: number;
};

export async function listProspects(filters: ProspectFilters = {}): Promise<Prospect[] | null> {
  const { maxReviews, minRating, status = "all", industry, sort = "default", limit = 200 } = filters;

  return withDb(async (db) => {
    const where: string[] = [];
    const params: (string | number)[] = [];

    if (typeof maxReviews === "number") {
      where.push("reviews <= ?");
      params.push(maxReviews);
    }
    if (typeof minRating === "number" && minRating > 0) {
      // A business with no rating at all has no reviews yet, which is a
      // better prospect than a mediocre one — so it is kept, not filtered
      // out for failing a test it cannot take.
      where.push("(rating IS NULL OR rating >= ?)");
      params.push(minRating);
    }
    if (industry) {
      where.push("industry = ?");
      params.push(industry);
    }
    if (status === "to-call") {
      where.push("status IN ('new', 'no-answer')");
    } else if (status !== "all") {
      where.push("status = ?");
      params.push(status);
    }

    const [rows] = await db.query<ProspectRow[]>(
      `SELECT * FROM prospects
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY ${
         sort === "worst-site"
           ? // Unscanned last: a row with no score is not evidence of a good
             // site, just of one we have not looked at yet.
             "site_score IS NULL ASC, site_score ASC, reviews ASC"
           : "FIELD(status, 'interested', 'new', 'no-answer', 'called', 'customer', 'not-interested'), reviews ASC"
       }
       LIMIT ?`,
      [...params, limit],
    );
    return rows.map(toProspect);
  });
}

/** What the admin writes on a row after ringing. */
export async function updateProspect(
  id: number,
  changes: { status?: ProspectStatus; notes?: string; siteScore?: number },
): Promise<boolean> {
  const sets: string[] = [];
  const params: (string | number | null)[] = [];

  if (changes.status) {
    sets.push("status = ?");
    params.push(changes.status);
    // Anything other than "not yet touched" means it has been rung.
    if (changes.status !== "new") sets.push("called_at = COALESCE(called_at, NOW())");
  }
  if (changes.notes !== undefined) {
    sets.push("notes = ?");
    params.push(changes.notes.slice(0, 4000) || null);
  }
  if (typeof changes.siteScore === "number") {
    sets.push("site_score = ?");
    params.push(changes.siteScore);
  }
  if (sets.length === 0) return false;

  const result = await withDb(async (db) => {
    const [res] = await db.execute<ResultSetHeader>(
      `UPDATE prospects SET ${sets.join(", ")} WHERE id = ?`,
      [...params, id],
    );
    return res.affectedRows > 0;
  });

  return result ?? false;
}

/** Prospects with a website that has never been scanned. The batch scanner
 *  works through these, oldest first, so a long list drains predictably. */
export async function listUnscanned(limit = 10): Promise<Prospect[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<ProspectRow[]>(
      `SELECT * FROM prospects
       WHERE scanned_at IS NULL
         AND website IS NOT NULL AND website <> ''
       ORDER BY id ASC
       LIMIT ?`,
      [limit],
    );
    return rows.map(toProspect);
  });
}

/**
 * Records a scan. `scanned_at` is set either way, including when the scan
 * found nothing readable — otherwise a dead domain would be retried on every
 * run forever, and a prospect with no working site is one worth ringing, not
 * one worth hiding.
 */
export async function saveProspectScan(
  id: number,
  scan: { score: number; findings: ProspectFinding[]; email?: string } | null,
): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      // COALESCE on email keeps anything already there: a corrected address
      // typed in by hand must not be overwritten by a rescan of the page.
      `UPDATE prospects
         SET site_score = ?, site_findings = ?, email = COALESCE(email, ?), scanned_at = NOW()
       WHERE id = ?`,
      [
        scan ? scan.score : null,
        scan && scan.findings.length ? JSON.stringify(scan.findings).slice(0, 4000) : null,
        scan?.email ? scan.email.slice(0, 200) : null,
        id,
      ],
    );
  }).catch(() => null);
}

/** One prospect by id, for the parts of the admin that act on a single row
 *  rather than a list. Null when there is no database or no such row. */
export async function getProspect(id: number): Promise<Prospect | null> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<ProspectRow[]>("SELECT * FROM prospects WHERE id = ? LIMIT 1", [
      id,
    ]);
    return rows[0] ? toProspect(rows[0]) : null;
  });
  return found ?? null;
}

/**
 * Files away an outreach email, sent or failed, and stamps the prospect.
 *
 * The body is kept in full. The server is the only thing that holds a copy —
 * nothing lands in a Sent folder when the server does the sending — so if
 * this row is not written, the record of what was said exists nowhere.
 */
export async function recordProspectEmail(
  id: number,
  email: {
    recipient: string;
    subject: string;
    body: string;
    step: number;
    status: "sent" | "failed";
    error?: string;
  },
): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `INSERT INTO prospect_emails (prospect_id, recipient, subject, body, step, status, error)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        email.recipient.slice(0, 200),
        email.subject.slice(0, 255),
        email.body,
        email.step,
        email.status,
        email.error ? email.error.slice(0, 500) : null,
      ],
    );
    // Only a send that actually worked counts as having written to them — and
    // the first one is what starts the clock on the two that follow by
    // themselves. COALESCE so re-sending a first email never moves the start
    // date and quietly runs the sequence again.
    if (email.status === "sent") {
      await db.execute(
        email.step === 1
          ? `UPDATE prospects
                SET emailed_at = NOW(),
                    sequence_started_at = COALESCE(sequence_started_at, NOW())
              WHERE id = ?`
          : "UPDATE prospects SET emailed_at = NOW() WHERE id = ?",
        [id],
      );
    }
  }).catch(() => null);
}

/**
 * Prospects owed the next email in the sequence.
 *
 * Only rows whose first email was sent by hand are in here at all, and a row
 * leaves the moment any of these is true: the sequence was stopped, they
 * replied, they unsubscribed, or they were marked interested, not interested
 * or a customer — at which point a scripted follow-up is the wrong thing to
 * send whichever way it went.
 */
export type SequenceDue = { prospect: Prospect; lastStep: number; hoursSinceStart: number };

interface DueRow extends ProspectRow {
  last_step: number | null;
  hours_since_start: number | null;
}

export async function listSequenceDue(limit = 20): Promise<SequenceDue[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<DueRow[]>(
      `SELECT p.*,
              MAX(e.step) AS last_step,
              TIMESTAMPDIFF(HOUR, p.sequence_started_at, NOW()) AS hours_since_start
         FROM prospects p
         LEFT JOIN prospect_emails e
           ON e.prospect_id = p.id AND e.status = 'sent'
        WHERE p.sequence_started_at IS NOT NULL
          AND p.sequence_stopped_at IS NULL
          AND p.replied_at IS NULL
          AND p.unsubscribed_at IS NULL
          AND p.email IS NOT NULL AND p.email <> ''
          AND p.status NOT IN ('interested', 'not-interested', 'customer')
        GROUP BY p.id
       HAVING last_step IS NOT NULL AND last_step < 3
        ORDER BY p.sequence_started_at ASC
        LIMIT ?`,
      [limit],
    );
    return rows.map((row) => ({
      prospect: toProspect(row),
      lastStep: Number(row.last_step ?? 1),
      hoursSinceStart: Number(row.hours_since_start ?? 0),
    }));
  });
}

/** Takes a prospect out of the sequence for good, with the reason why. */
export async function stopSequence(id: number, reason: string): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE prospects
          SET sequence_stopped_at = COALESCE(sequence_stopped_at, NOW()),
              sequence_stop_reason = COALESCE(sequence_stop_reason, ?)
        WHERE id = ?`,
      [reason.slice(0, 40), id],
    );
  }).catch(() => null);
}

/** They wrote back. Stamps the row and ends the sequence in one go. */
export async function markReplied(id: number): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE prospects
          SET replied_at = COALESCE(replied_at, NOW()),
              sequence_stopped_at = COALESCE(sequence_stopped_at, NOW()),
              sequence_stop_reason = COALESCE(sequence_stop_reason, 'replied')
        WHERE id = ?`,
      [id],
    );
  }).catch(() => null);
}

/** Everyone in a live sequence, so the reply check can compare the whole lot
 *  against one read of the inbox instead of asking once per address. */
export async function listSequenceAddresses(): Promise<{ id: number; email: string }[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { id: number; email: string })[]>(
      `SELECT id, email FROM prospects
        WHERE sequence_started_at IS NOT NULL
          AND sequence_stopped_at IS NULL
          AND replied_at IS NULL
          AND email IS NOT NULL AND email <> ''`,
    );
    return rows.map((r) => ({ id: r.id, email: r.email.toLowerCase() }));
  });
}

/**
 * Honours an unsubscribe click.
 *
 * Separate from stopSequence because this one is permanent and applies to
 * anything we might ever send them, not only the three emails.
 */
export async function unsubscribeProspect(id: number): Promise<boolean> {
  const done = await withDb(async (db) => {
    const [res] = await db.execute<ResultSetHeader>(
      `UPDATE prospects
          SET unsubscribed_at = COALESCE(unsubscribed_at, NOW()),
              sequence_stopped_at = COALESCE(sequence_stopped_at, NOW()),
              sequence_stop_reason = COALESCE(sequence_stop_reason, 'unsubscribed')
        WHERE id = ?`,
      [id],
    );
    return res.affectedRows > 0;
  });
  return done ?? false;
}

/** What has already gone out to one prospect, newest first. */
export async function listProspectEmails(
  id: number,
): Promise<
  { subject: string; body: string; step: number; status: string; sentAt: string }[] | null
> {
  return withDb(async (db) => {
    const [rows] = await db.query<SentEmailRow[]>(
      `SELECT subject, body, step, status, sent_at FROM prospect_emails
       WHERE prospect_id = ? ORDER BY id ASC LIMIT 20`,
      [id],
    );
    return rows.map((r) => ({
      subject: r.subject,
      body: r.body,
      step: Number(r.step ?? 1),
      status: r.status,
      sentAt: String(r.sent_at),
    }));
  });
}
