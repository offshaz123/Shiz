import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { withDb } from "./db";
import { prospectUnsubscribeUrl } from "./unsubscribe-url";
import type { GoogleBusiness } from "./google-business";
import {
  isStatus as isValidStatus,
  type Prospect,
  type ProspectStatus,
  type ProspectFinding,
  isCallOutcome,
  type CallOutcome,
  type ProspectCall,
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
  callback_at: string | null;
  last_call_outcome?: string | null;
  last_call_at?: string | null;
  emailed_at: string | null;
  email_count?: number | null;
  listing_checked_at: string | null;
  sequence_started_at: string | null;
  sequence_stopped_at: string | null;
  sequence_stop_reason: string | null;
  replied_at: string | null;
  unsubscribed_at: string | null;
  found_for: string | null;
  industry: string | null;
  town: string | null;
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
    callbackAt: row.callback_at ? String(row.callback_at) : null,
    lastCall: row.last_call_outcome
      ? { outcome: String(row.last_call_outcome), at: String(row.last_call_at ?? "") }
      : null,
    emailedAt: row.emailed_at ? String(row.emailed_at) : null,
    sequenceStartedAt: row.sequence_started_at ? String(row.sequence_started_at) : null,
    sequenceStoppedAt: row.sequence_stopped_at ? String(row.sequence_stopped_at) : null,
    sequenceStopReason: row.sequence_stop_reason ?? "",
    repliedAt: row.replied_at ? String(row.replied_at) : null,
    unsubscribedAt: row.unsubscribed_at ? String(row.unsubscribed_at) : null,
    unsubscribeUrl: prospectUnsubscribeUrl(row.id),
    emailCount: Number(row.email_count ?? 0),
    foundFor: row.found_for ?? "",
    industry: row.industry ?? "",
    town: row.town ?? "",
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
  town = "",
): Promise<void> {
  const rows = businesses.filter((b) => b.id);
  if (rows.length === 0) return;

  await withDb(async (db) => {
    for (const b of rows) {
      await db.execute(
        `INSERT INTO prospects
           (place_id, name, phone, website, address, category, maps_uri, reviews, rating, found_for, industry, town)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
           industry = COALESCE(NULLIF(VALUES(industry), ''), industry),
           -- Same for the town: a business found again by a search with no
           -- town box filled in keeps the area it was first filed under.
           town = COALESCE(NULLIF(VALUES(town), ''), town)`,
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
          town.slice(0, 80),
        ],
      );
    }
  }).catch(() => null);
}

/**
 * Contacted or not, which is the first question the call list has to answer.
 *
 * Deliberately not the same thing as the status. A status is a judgement
 * somebody typed — interested, no answer — and it stays "new" on a business
 * that has had an email sent to it and not replied yet. "Have we approached
 * these people" is a fact, and it is the one that decides whether a row
 * belongs on the list of people still to approach.
 */
export type ContactFilter = "all" | "not-contacted" | "contacted";

/** Approached at all: emailed from the admin page, or given a status that
 *  stamped called_at. */
const CONTACTED_SQL = "(emailed_at IS NOT NULL OR called_at IS NOT NULL)";

export type ProspectFilters = {
  maxReviews?: number;
  minRating?: number;
  status?: ProspectStatus | "all" | "to-call";
  contact?: ContactFilter;
  industry?: string;
  /** One town, exactly as it is stored. Empty means every town. */
  town?: string;
  /** "worst-site" puts the most broken websites first, which is the order
   *  you want to ring in: the worse the site, the more there is to say. */
  sort?: "default" | "worst-site";
  limit?: number;
};

/**
 * The filters, as SQL, shared by the list and the counts above it so the two
 * can never disagree about what they are describing.
 */
function whereFor(filters: ProspectFilters): { where: string[]; params: (string | number)[] } {
  const { maxReviews, minRating, status = "all", contact = "all", industry, town } = filters;
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (typeof maxReviews === "number") {
    where.push("reviews <= ?");
    params.push(maxReviews);
  }
  if (typeof minRating === "number" && minRating > 0) {
    // A business with no rating at all has no reviews yet, which is a better
    // prospect than a mediocre one — so it is kept, not filtered out for
    // failing a test it cannot take.
    where.push("(rating IS NULL OR rating >= ?)");
    params.push(minRating);
  }
  if (industry) {
    where.push("industry = ?");
    params.push(industry);
  }
  if (town) {
    where.push("town = ?");
    params.push(town);
  }
  if (status === "to-call") {
    where.push("status IN ('new', 'no-answer')");
  } else if (status !== "all") {
    where.push("status = ?");
    params.push(status);
  }
  if (contact === "not-contacted") where.push(`NOT ${CONTACTED_SQL}`);
  else if (contact === "contacted") where.push(CONTACTED_SQL);

  return { where, params };
}

/**
 * How many are waiting to be approached and how many already have been, under
 * whatever filters are set — the contact one excepted, since those two
 * numbers are the thing being chosen between.
 */
export async function countByContact(
  filters: ProspectFilters = {},
): Promise<{ notContacted: number; contacted: number } | null> {
  const { where, params } = whereFor({ ...filters, contact: "all" });
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { contacted: number; total: number })[]>(
      `SELECT SUM(${CONTACTED_SQL}) AS contacted, COUNT(*) AS total
         FROM prospects
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
      params,
    );
    const contacted = Number(rows[0]?.contacted ?? 0);
    const total = Number(rows[0]?.total ?? 0);
    return { notContacted: total - contacted, contacted };
  });
}

export async function listProspects(filters: ProspectFilters = {}): Promise<Prospect[] | null> {
  const { sort = "default", limit = 200 } = filters;
  const { where, params } = whereFor(filters);

  return withDb(async (db) => {
    const [rows] = await db.query<ProspectRow[]>(
      `SELECT p.*,
              (SELECT COUNT(*) FROM prospect_emails e
                WHERE e.prospect_id = p.id AND e.status = 'sent') AS email_count,
              (SELECT c.outcome FROM prospect_calls c
                WHERE c.prospect_id = p.id ORDER BY c.called_at DESC LIMIT 1) AS last_call_outcome,
              (SELECT DATE_FORMAT(c.called_at, '%Y-%m-%d') FROM prospect_calls c
                WHERE c.prospect_id = p.id ORDER BY c.called_at DESC LIMIT 1) AS last_call_at
         FROM prospects p
       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
       ORDER BY ${
         sort === "worst-site"
           ? // Unscanned last: a row with no score is not evidence of a good
             // site, just of one we have not looked at yet.
             "site_score IS NULL ASC, site_score ASC, reviews ASC"
           : // On the contacted list the useful order is what happened last,
             // not who is most worth ringing.
             "emailed_at IS NULL ASC, emailed_at DESC, FIELD(status, 'interested', 'new', 'no-answer', 'called', 'customer', 'not-interested'), reviews ASC"
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
  changes: { status?: ProspectStatus; notes?: string; siteScore?: number; email?: string },
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
  // Typed in by hand, when the scanner could not find one or found the wrong
  // one. It wins over anything a later scan turns up, which is what the
  // NULLIF/COALESCE in saveProspectScan is there to guarantee.
  if (changes.email !== undefined) {
    sets.push("email = ?");
    params.push(changes.email.trim().slice(0, 200) || null);
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
      // Keeps anything already there: a corrected address typed in by hand
      // must not be overwritten by a rescan of the page. NULLIF as well as
      // COALESCE, because an empty string is not an address — without it a
      // row that once stored "" would refuse every address found afterwards
      // and look, from the page, exactly like a scan that found nothing.
      `UPDATE prospects
         SET site_score = ?,
             site_findings = ?,
             email = COALESCE(NULLIF(email, ''), ?),
             scanned_at = NOW()
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

/**
 * Every town there is a prospect in, with how many, commonest first.
 *
 * Built from the data rather than from the list of areas on the search form,
 * so the filter only ever offers somewhere there is actually something to
 * look at.
 */
export async function listTowns(
  filters: ProspectFilters = {},
): Promise<{ town: string; n: number }[] | null> {
  const { where, params } = whereFor({ ...filters, town: "" });
  const clauses = [...where, "town IS NOT NULL", "town <> ''"];
  return withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { town: string; n: number })[]>(
      `SELECT town, COUNT(*) AS n FROM prospects
        WHERE ${clauses.join(" AND ")}
        GROUP BY town
        ORDER BY n DESC, town ASC
        LIMIT 60`,
      params,
    );
    return rows.map((r) => ({ town: r.town, n: Number(r.n) }));
  });
}

/**
 * Marks for re-scanning everything that came back without a score or without
 * an address.
 *
 * The scanner only looks at prospects it has never seen, which is right —
 * nobody wants every batch re-fetching the whole list. But it means an
 * improvement to the scanner never reaches the businesses already in the
 * list, and three landed in one day: reading the contact page, decoding
 * obfuscated addresses, and a user agent that firewalls stop rejecting.
 *
 * Only the rows that failed. Anything with both a score and an address is
 * left alone, because re-fetching a site to confirm what we already know is
 * somebody else's bandwidth spent for nothing.
 *
 * Touches scanned_at and nothing else: status, notes, emails sent and the
 * sequence are all untouched.
 */
export async function requeueUnresolved(): Promise<number> {
  const changed = await withDb(async (db) => {
    const [res] = await db.execute<ResultSetHeader>(
      `UPDATE prospects
          SET scanned_at = NULL
        WHERE website IS NOT NULL AND website <> ''
          AND scanned_at IS NOT NULL
          AND (site_score IS NULL OR email IS NULL OR email = '')`,
    );
    return res.affectedRows;
  });
  return changed ?? 0;
}

/**
 * Companies off the register that still have no way to be contacted.
 *
 * They arrive with a name and a registered address, because that is all the
 * register holds. Until a phone number is attached they sit on the call list
 * as something nobody can act on.
 */
export async function listUncontactable(limit = 5): Promise<Prospect[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<ProspectRow[]>(
      `SELECT * FROM prospects
        WHERE place_id LIKE 'ch:%'
          AND listing_checked_at IS NULL
          AND (phone IS NULL OR phone = '')
          AND (website IS NULL OR website = '')
        ORDER BY created_at DESC
        LIMIT ?`,
      [limit],
    );
    return rows.map(toProspect);
  });
}

/**
 * Attaches what Google knows to a company we found on the register.
 *
 * Only fills what is empty. A phone number typed in by hand, or a website
 * someone corrected, is not overwritten by a lookup — the same rule the scan
 * follows for addresses.
 */
export async function attachListing(
  id: number,
  found: {
    phone: string;
    websiteUri: string;
    mapsUri: string;
    category: string;
    reviews: number;
    rating: number | null;
  },
): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `UPDATE prospects
          SET phone = COALESCE(NULLIF(phone, ''), ?),
              website = COALESCE(NULLIF(website, ''), ?),
              maps_uri = COALESCE(NULLIF(maps_uri, ''), ?),
              category = COALESCE(NULLIF(category, ''), ?),
              reviews = GREATEST(reviews, ?),
              rating = COALESCE(rating, ?)
        WHERE id = ?`,
      [
        found.phone.slice(0, 60) || null,
        found.websiteUri.slice(0, 255) || null,
        found.mapsUri.slice(0, 500) || null,
        found.category.slice(0, 120) || null,
        found.reviews,
        found.rating,
        id,
      ],
    );
  }).catch(() => null);
}

/** Stamps a company as looked up, found or not, so the next batch moves on
 *  rather than asking Google the same question forever. */
export async function markListingChecked(id: number): Promise<void> {
  await withDb(async (db) => {
    await db.execute("UPDATE prospects SET listing_checked_at = NOW() WHERE id = ?", [id]);
  }).catch(() => null);
}

/**
 * Writes down a call.
 *
 * Also moves the row on, because a call that leaves the list looking
 * untouched is a call somebody else makes again tomorrow. The outcome sets
 * the status where there is an obvious mapping and leaves it alone where
 * there is not — "no answer" is not a judgement about the business, so it
 * does not overwrite "interested".
 */
export async function logCall(
  id: number,
  call: {
    outcome: CallOutcome;
    notes: string;
    minutes: number | null;
    caller: string;
    callbackAt: string;
  },
): Promise<boolean> {
  const done = await withDb(async (db) => {
    await db.execute(
      `INSERT INTO prospect_calls (prospect_id, outcome, notes, minutes, caller)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        call.outcome,
        call.notes.slice(0, 4000) || null,
        call.minutes && call.minutes > 0 ? Math.min(255, call.minutes) : null,
        call.caller.slice(0, 60) || null,
      ],
    );

    // Anything where a human was on the other end counts as called, which
    // includes getting the gatekeeper — you rang, you just did not get the
    // person. A wrong number says nothing about the business, so it leaves
    // the status alone.
    const status =
      call.outcome === "not-interested"
        ? "not-interested"
        : call.outcome === "spoke" || call.outcome === "call-back" || call.outcome === "gatekeeper"
          ? "called"
          : call.outcome === "no-answer" || call.outcome === "voicemail"
            ? "no-answer"
            : null;

    await db.execute(
      `UPDATE prospects
          SET called_at = NOW(),
              callback_at = ?,
              status = CASE
                -- A decision already made is not undone by a later call that
                -- went to voicemail.
                WHEN status IN ('interested', 'customer') THEN status
                WHEN ? IS NULL THEN status
                ELSE ?
              END
        WHERE id = ?`,
      [call.callbackAt || null, status, status, id],
    );
    return true;
  });
  return done ?? false;
}

/** Every call made to one business, newest first. */
export async function listProspectCalls(id: number): Promise<ProspectCall[] | null> {
  return withDb(async (db) => {
    const [rows] = await db.query<
      (RowDataPacket & {
        outcome: string;
        notes: string | null;
        minutes: number | null;
        caller: string | null;
        called_at: string;
      })[]
    >(
      `SELECT outcome, notes, minutes, caller, called_at
         FROM prospect_calls WHERE prospect_id = ?
        ORDER BY called_at DESC LIMIT 25`,
      [id],
    );
    return rows.map((r) => ({
      outcome: (isCallOutcome(r.outcome) ? r.outcome : "spoke") as CallOutcome,
      notes: r.notes ?? "",
      minutes: r.minutes === null ? null : Number(r.minutes),
      caller: r.caller ?? "",
      calledAt: String(r.called_at),
    }));
  });
}

/** Specific prospects, built exactly the way the call list builds them, so a
 *  row shown anywhere else is the same row rather than a thinner copy. */
export async function listProspectsByIds(ids: number[]): Promise<Prospect[] | null> {
  if (ids.length === 0) return [];
  const clean = ids.filter((id) => Number.isInteger(id) && id > 0).slice(0, 100);
  if (clean.length === 0) return [];

  return withDb(async (db) => {
    const [rows] = await db.query<ProspectRow[]>(
      `SELECT p.*,
              (SELECT COUNT(*) FROM prospect_emails e
                WHERE e.prospect_id = p.id AND e.status = 'sent') AS email_count,
              (SELECT c.outcome FROM prospect_calls c
                WHERE c.prospect_id = p.id ORDER BY c.called_at DESC LIMIT 1) AS last_call_outcome,
              (SELECT DATE_FORMAT(c.called_at, '%Y-%m-%d') FROM prospect_calls c
                WHERE c.prospect_id = p.id ORDER BY c.called_at DESC LIMIT 1) AS last_call_at
         FROM prospects p
        WHERE p.id IN (${clean.map(() => "?").join(",")})
        ORDER BY FIELD(p.id, ${clean.map(() => "?").join(",")})`,
      [...clean, ...clean],
    );
    return rows.map(toProspect);
  });
}
