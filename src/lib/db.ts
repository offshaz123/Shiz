import mysql from "mysql2/promise";
import type { RowDataPacket } from "mysql2";

/**
 * The MySQL connection, and the schema it expects.
 *
 * Everything here is written so the site works with no database at all. The
 * credentials live in Hostinger's environment variables; if they are missing
 * — local development, a preview build, a mistyped variable name — `withDb`
 * hands back null and the caller carries on without a record. A lead still
 * gets emailed, a visitor still gets their report. Losing the row is bad.
 * Losing the customer because the database was down would be worse.
 *
 * The tables create themselves on first use. There is no migration tool on
 * shared hosting and no way to run SQL against this database remotely, so
 * `CREATE TABLE IF NOT EXISTS` on connect is the honest answer: it is
 * idempotent, it costs one round trip per process, and it means nobody has to
 * remember to paste SQL into phpMyAdmin after a deploy.
 */

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

function createPool(): mysql.Pool | null {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = process.env;
  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASS) return null;

  return mysql.createPool({
    host: DB_HOST,
    // Hostinger's Node apps reach MySQL on the loopback address. "localhost"
    // makes the driver try a unix socket that is not there.
    port: Number(DB_PORT) || 3306,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASS,
    waitForConnections: true,
    // Shared hosting caps concurrent connections well below what a default
    // pool would open, and this site's traffic needs nowhere near that.
    connectionLimit: 4,
    queueLimit: 0,
    enableKeepAlive: true,
  });
}

const SCHEMA = [
  // Someone who ran a scan. One row per submission, not per person: if they
  // come back and check a second site that is a second row, and a second
  // chance to follow up.
  `CREATE TABLE IF NOT EXISTS scan_leads (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(60) NOT NULL,
    website VARCHAR(255) NOT NULL,
    marketing_consent TINYINT(1) NOT NULL DEFAULT 0,
    score TINYINT UNSIGNED NULL,
    audit_json MEDIUMTEXT NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'scan',
    referrer VARCHAR(255) NULL,
    contacted TINYINT(1) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    unsubscribed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_created (created_at),
    KEY idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One row per follow-up email actually sent. The admin page reads this to
  // show what a lead has had, and the sequence reads it to know what is due.
  // The unique key is what stops a retried cron run emailing twice.
  `CREATE TABLE IF NOT EXISTS lead_emails (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    lead_id INT UNSIGNED NOT NULL,
    step TINYINT UNSIGNED NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    error TEXT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_lead_step (lead_id, step),
    CONSTRAINT fk_lead_emails_lead FOREIGN KEY (lead_id)
      REFERENCES scan_leads (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Reviews people have left. Nothing appears on the site until Walid
  // approves it — a review waiting for approval is not a review we show.
  // There is deliberately no seeding here: an empty table shows an empty
  // section, because inventing a testimonial is the one thing this site
  // must never do.
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    business VARCHAR(160) NULL,
    rating TINYINT UNSIGNED NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    source VARCHAR(40) NOT NULL DEFAULT 'website',
    email VARCHAR(200) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_status (status, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Page views. No cookie, no identifier that survives the visit — just what
  // was looked at and roughly where it came from, which is all the admin page
  // needs to answer "is anyone reading the pricing page".
  `CREATE TABLE IF NOT EXISTS page_views (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    path VARCHAR(255) NOT NULL,
    referrer VARCHAR(255) NULL,
    country VARCHAR(2) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_created (created_at),
    KEY idx_path (path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Every time the follow-up scheduler runs, what it did.
  //
  // This exists because the follow-up sequence sat dead for a week and
  // nothing anywhere said so. The cron job was listed in hPanel, on a
  // sensible schedule, and Hostinger's "View Output" showed an empty box
  // that never finished loading. From outside, a scheduler that runs and
  // finds nothing to do is indistinguishable from one that never runs — and
  // the second one costs you every lead you don't follow up.
  //
  // So the site keeps its own record. A row here means the job ran and
  // reached the end. No rows, or none since yesterday, means it didn't, and
  // the admin page says so in plain words rather than leaving it to be
  // noticed.
  `CREATE TABLE IF NOT EXISTS cron_runs (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    job VARCHAR(40) NOT NULL DEFAULT 'follow-ups',
    sent SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    failed SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    skipped SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    considered SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    detail VARCHAR(400) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // The businesses who pay us, which the site had no record of at all.
  //
  // Everything else in this database is about our own marketing: who we
  // found, who we wrote to, who replied. A paying client appeared nowhere,
  // which is why there was nothing to put on a client dashboard.
  //
  // `slug` is what appears in their login and their lead form URL, so it is
  // unique and never reused. The password is stored as a hash with its own
  // salt rather than in the open: these are other people's credentials, and
  // a database dump should not hand somebody every client's login.
  `CREATE TABLE IF NOT EXISTS clients (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(60) NOT NULL,
    name VARCHAR(160) NOT NULL,
    contact_email VARCHAR(200) NULL,
    password_hash VARCHAR(255) NULL,
    password_salt VARCHAR(64) NULL,
    /** Switched off rather than deleted: their leads must survive the end
     *  of the relationship, because they were their leads. */
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_slug (slug)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One enquiry that came in for a client.
  //
  // `source` is the whole point of the table. "Forty enquiries" is a number
  // nobody can act on; "twenty-eight from Google, nine from the map listing,
  // three from Instagram" decides where next month's budget goes.
  //
  // `first_replied_at` is how long the client took to answer. It is the
  // cheapest of the four numbers to improve and the one nobody measures,
  // and it can only be recorded here because nowhere else knows.
  `CREATE TABLE IF NOT EXISTS client_leads (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_id INT UNSIGNED NOT NULL,
    name VARCHAR(160) NULL,
    email VARCHAR(200) NULL,
    phone VARCHAR(60) NULL,
    message TEXT NULL,
    source VARCHAR(40) NOT NULL DEFAULT 'website',
    /** Where it landed, for a client with more than one page running. */
    landing_page VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    first_replied_at DATETIME NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_client_created (client_id, created_at),
    KEY idx_client_source (client_id, source),
    CONSTRAINT fk_client_leads_client FOREIGN KEY (client_id)
      REFERENCES clients (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // What a client spent on advertising in a given month, per channel.
  //
  // Entered by hand for now. Cost per enquiry is the single most useful
  // figure in small business marketing and it cannot be worked out without
  // this, and the Google Ads API needs a developer token that takes weeks
  // to be approved. A number typed in once a month beats an empty panel
  // waiting on an application.
  //
  // Keyed on client, month and channel so re-entering a figure corrects it
  // rather than adding a second one.
  `CREATE TABLE IF NOT EXISTS client_spend (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_id INT UNSIGNED NOT NULL,
    /** First day of the month it belongs to. */
    month DATE NOT NULL,
    channel VARCHAR(40) NOT NULL DEFAULT 'google',
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_client_month_channel (client_id, month, channel),
    CONSTRAINT fk_client_spend_client FOREIGN KEY (client_id)
      REFERENCES clients (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // A job in a client's diary.
  //
  // The thing a local business actually runs its week on. An enquiry is
  // only worth anything once it is a time in a diary, and until now the
  // dashboard could show the enquiry and then lost sight of it.
  //
  // `lead_id` is optional and ON DELETE SET NULL: most bookings come from
  // an enquiry, some are regulars who just ring up, and a booking must
  // outlive the enquiry record it came from either way.
  //
  // Times are stored as a date and a time rather than one DATETIME because
  // the reminders work on whole days — "tomorrow's jobs", "today's jobs" —
  // and a date column makes that a comparison rather than a range.
  `CREATE TABLE IF NOT EXISTS client_bookings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_id INT UNSIGNED NOT NULL,
    lead_id INT UNSIGNED NULL,
    customer_name VARCHAR(160) NOT NULL,
    phone VARCHAR(60) NULL,
    email VARCHAR(200) NULL,
    job VARCHAR(255) NULL,
    notes TEXT NULL,
    booked_on DATE NOT NULL,
    starts_at TIME NULL,
    duration_minutes SMALLINT UNSIGNED NULL,
    price DECIMAL(10,2) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'booked',
    /** Stamped when the day-before reminder went, so it cannot go twice. */
    reminded_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_client_day (client_id, booked_on),
    KEY idx_reminders (booked_on, reminded_at),
    CONSTRAINT fk_bookings_client FOREIGN KEY (client_id)
      REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_lead FOREIGN KEY (lead_id)
      REFERENCES client_leads (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // Businesses we might ring, and what happened when we did.
  //
  // Keyed on Google's own place ID so the same business found twice — once
  // searching "detailing in Romford" and again searching "valeting in
  // Romford" — is one row that keeps whatever was written on it, rather than
  // a fresh blank entry that loses the fact it was already called.
  //
  // The listing figures are refreshed on every search; the status, the notes
  // and when it was called are ours and are never overwritten by one.
  `CREATE TABLE IF NOT EXISTS prospects (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    place_id VARCHAR(190) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(60) NULL,
    website VARCHAR(255) NULL,
    address VARCHAR(255) NULL,
    category VARCHAR(120) NULL,
    maps_uri VARCHAR(500) NULL,
    reviews SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(2,1) NULL,
    site_score DECIMAL(3,1) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    notes TEXT NULL,
    called_at DATETIME NULL,
    found_for VARCHAR(160) NULL,
    industry VARCHAR(40) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_place (place_id),
    KEY idx_status (status),
    KEY idx_reviews (reviews)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One row per phone call, with what came of it.
  //
  // Notes on a prospect are a single field that gets rewritten, so the third
  // call overwrites the first two and the history of a conversation exists
  // only in somebody's memory. That is survivable with one person and
  // impossible with two: a worker needs to see what was said last time
  // before they dial, and Walid needs to see what was said at all.
  `CREATE TABLE IF NOT EXISTS prospect_calls (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    prospect_id INT UNSIGNED NOT NULL,
    outcome VARCHAR(20) NOT NULL,
    notes TEXT NULL,
    minutes TINYINT UNSIGNED NULL,
    -- Who made the call. One shared login today, so this is whatever was
    -- typed; it becomes real the day there are separate accounts.
    caller VARCHAR(60) NULL,
    called_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_prospect (prospect_id, called_at),
    CONSTRAINT fk_prospect_calls_prospect FOREIGN KEY (prospect_id)
      REFERENCES prospects (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One row per outreach email sent from the admin page, with the text that
  // went out.
  //
  // Kept because the mail is sent by the server rather than from a mail
  // client, so there is no Sent folder holding the only copy. Without this
  // the record of what was said to whom would live nowhere, which matters
  // both for picking up a conversation and for being able to show, if anyone
  // ever asks, exactly what was sent and when.
  `CREATE TABLE IF NOT EXISTS prospect_emails (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    prospect_id INT UNSIGNED NOT NULL,
    recipient VARCHAR(200) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body MEDIUMTEXT NOT NULL,
    step TINYINT UNSIGNED NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    error TEXT NULL,
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_prospect (prospect_id, sent_at),
    CONSTRAINT fk_prospect_emails_prospect FOREIGN KEY (prospect_id)
      REFERENCES prospects (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

/**
 * Columns added after the table first shipped.
 *
 * MySQL has no ADD COLUMN IF NOT EXISTS — that is a MariaDB extension, and
 * Hostinger runs MySQL — so each one is checked against information_schema
 * before it is added. Same idempotence as the CREATE TABLEs above, so a
 * database created before these columns existed catches up on next connect
 * and a fresh one does nothing.
 */
const ADDED_COLUMNS: {
  table: string;
  column: string;
  definition: string;
  /** Run once, immediately after the column is added, to fill it in for rows
   *  that existed before it. Never run again. */
  backfill?: string;
}[] = [
  { table: "scan_leads", column: "audit_json", definition: "MEDIUMTEXT NULL AFTER score" },
  { table: "scan_leads", column: "unsubscribed_at", definition: "DATETIME NULL AFTER notes" },
  { table: "prospects", column: "industry", definition: "VARCHAR(40) NULL AFTER found_for" },
  // Soft delete. A row taken off the call list goes to the deleted folder
  // rather than out of the database, because the usual reason for pressing
  // delete is a mis-aimed bulk action, and the usual thing wanted ten seconds
  // later is it back. Nothing is ever actually destroyed here.
  { table: "prospects", column: "deleted_at", definition: "DATETIME NULL" },
  // What the scanner found on their site, so the call list can show why they
  // are worth ringing before anyone dials. JSON, because it is only ever read
  // back whole and never queried into.
  { table: "prospects", column: "site_findings", definition: "TEXT NULL AFTER site_score" },
  { table: "prospects", column: "scanned_at", definition: "DATETIME NULL AFTER site_findings" },
  // Taken off their own website during the scan, because Places never
  // returns one. Generic business inboxes are preferred over personal ones.
  { table: "prospects", column: "email", definition: "VARCHAR(200) NULL AFTER phone" },
  // When an email was last sent to them from the admin page, so the call list
  // shows at a glance who has already been written to.
  { table: "prospects", column: "emailed_at", definition: "DATETIME NULL AFTER called_at" },
  // The three-email sequence. It starts only when Walid sends the first one
  // himself, which is what `sequence_started_at` records — nothing here can
  // write to somebody who has not been written to by hand first.
  { table: "prospects", column: "sequence_started_at", definition: "DATETIME NULL AFTER emailed_at" },
  { table: "prospects", column: "sequence_stopped_at", definition: "DATETIME NULL AFTER sequence_started_at" },
  { table: "prospects", column: "sequence_stop_reason", definition: "VARCHAR(40) NULL AFTER sequence_stopped_at" },
  // When they wrote back. A follow-up landing after a reply is the thing that
  // makes this look like a machine, so the sequence stops on sight of one.
  { table: "prospects", column: "replied_at", definition: "DATETIME NULL AFTER sequence_stop_reason" },
  // Honoured absolutely, by the same unsubscribe page the audit follow-ups
  // use. Nothing is ever sent to a row with this set.
  { table: "prospects", column: "unsubscribed_at", definition: "DATETIME NULL AFTER replied_at" },
  // Added at the same time as the sequence: rows written before it exists
  // default to step 1, which is what they were.
  { table: "prospect_emails", column: "step", definition: "TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER body" },
  // The town a prospect was found in, so the list can be worked one area at a
  // time — which is how the ringing actually happens, and how a business
  // hears that you know the place rather than that you found them in a list.
  //
  // Written from the town box on the search form. The backfill reads it off
  // the search that found each existing row: those are all of the form
  // "nail salons in Barking", so whatever follows the last " in " is the
  // town. Rows from a free-text search that does not look like that keep an
  // empty town and simply never match a town filter, which is right —
  // guessing a location onto a business is worse than having none.
  // When to ring them back. The single most expensive field on the row: more
  // leads go cold from a forgotten callback than from a bad pitch, and until
  // now "ring Thursday" lived in a free-text note where nothing could find it.
  { table: "prospects", column: "callback_at", definition: "DATETIME NULL AFTER called_at" },
  // When we last asked Google for a phone number and website for a company
  // that came off the register. Set whether or not anything was found, so a
  // business Google has never heard of is asked about once and then left
  // alone rather than costing a lookup on every batch.
  {
    table: "prospects",
    column: "listing_checked_at",
    definition: "DATETIME NULL AFTER scanned_at",
  },
  {
    table: "prospects",
    column: "town",
    definition: "VARCHAR(80) NULL AFTER industry",
    backfill: `UPDATE prospects
                  SET town = TRIM(SUBSTRING_INDEX(found_for, ' in ', -1))
                WHERE (town IS NULL OR town = '')
                  AND found_for LIKE '% in %'`,
  },
  // Who sent it: the cron, or Walid pressing send.
  //
  // Needed because the first email now sends itself. Before that the step
  // number answered this on its own — step 1 was always a person, steps 2
  // and 3 were always the scheduler — and now step 1 can be either, so
  // "what has the site sent on its own?" is a question the table could no
  // longer answer. The admin page is supposed to show exactly that.
  //
  // Defaults to 'auto' rather than 'hand' on purpose. Every caller passes a
  // value explicitly, so the default only matters if one is ever added that
  // forgets to — and a hand-sent email mislabelled as automatic is a much
  // smaller problem than automatic sending hidden under a label that says a
  // person did it.
  //
  // The backfill is exactly right rather than a guess: every row that
  // existed before this column did was sent under the old rule, so step 1
  // was a person and anything later was the scheduler.
  // What a lead is worth to this business, on average.
  //
  // Set once per client, and every enquiry that arrives inherits it. The
  // alternative is asking somebody to type a figure on every lead, which
  // sounds reasonable and in practice means the revenue column stays empty
  // forever: nobody does admin on the ten enquiries they did not win.
  //
  // One number set at setup is a worse estimate than ten typed by hand and
  // a far better one than nothing, and the per-lead figure is still there
  // for the job that was plainly not average.
  {
    table: "clients",
    column: "default_lead_value",
    definition: "DECIMAL(10,2) NULL AFTER review_requests_on",
  },
  // What the job was worth.
  //
  // The figure that turns a board into a business. Enquiries and cost per
  // enquiry say what marketing cost; this is the only thing that says what
  // it brought back, and "you spent six hundred and won four thousand two
  // hundred" is the sentence every one of these conversations is actually
  // about.
  //
  // On the lead rather than the booking, because a quote is worth tracking
  // before anybody has booked anything in, and a lost quote's value is
  // worth knowing too.
  {
    table: "client_leads",
    column: "value",
    definition: "DECIMAL(10,2) NULL AFTER status",
  },
  // Where a client's customers are asked to leave a review.
  //
  // Their own Google review link, which is per business and cannot be
  // guessed. No link means no review requests go out for that client,
  // which is the right default: an email asking somebody to leave a review
  // with nowhere to leave it is worse than no email.
  {
    table: "clients",
    column: "review_link",
    definition: "VARCHAR(500) NULL AFTER contact_email",
  },
  // Off unless switched on. Asking a client's customers for anything is
  // the client's call to make, not ours to assume.
  {
    table: "clients",
    column: "review_requests_on",
    definition: "TINYINT(1) NOT NULL DEFAULT 0 AFTER review_link",
  },
  // Stamped when the ask went, so one job can only ever produce one.
  {
    table: "client_bookings",
    column: "review_sent_at",
    definition: "DATETIME NULL AFTER reminded_at",
  },
  {
    table: "prospect_emails",
    column: "sent_by",
    definition: "VARCHAR(6) NOT NULL DEFAULT 'auto' AFTER status",
    backfill: `UPDATE prospect_emails
                  SET sent_by = CASE WHEN step = 1 THEN 'hand' ELSE 'auto' END`,
  },
];

interface CountRow extends RowDataPacket {
  n: number;
}

async function ensureSchema(db: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA) {
    await db.query(statement);
  }

  for (const { table, column, definition, backfill } of ADDED_COLUMNS) {
    const [rows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    if ((rows[0]?.n ?? 0) === 0) {
      await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      // Only here, inside the branch that just created the column. A
      // backfill that ran on every connect would be a table scan on every
      // cold start for the life of the site.
      if (backfill) await db.query(backfill).catch(() => null);
    }
  }
}

/**
 * Runs `fn` against the database, or returns null if there isn't one.
 *
 * Never throws. A caller that gets null knows only that nothing was recorded,
 * which is the one thing it needs to decide what to tell the visitor.
 */
export async function withDb<T>(fn: (db: mysql.Pool) => Promise<T>): Promise<T | null> {
  if (!pool) {
    pool = createPool();
    if (!pool) return null;
  }

  // Held as a promise so concurrent requests during a cold start wait on one
  // round of CREATE TABLE rather than racing each other through it.
  if (!schemaReady) {
    const db = pool;
    schemaReady = ensureSchema(db).catch((err) => {
      // Let the next request try again rather than wedging the process on a
      // transient connection failure during startup.
      schemaReady = null;
      throw err;
    });
  }

  try {
    await schemaReady;
    return await fn(pool);
  } catch (err) {
    console.error("Database error:", err);
    return null;
  }
}

/** Whether credentials are configured at all. For the admin page's status line. */
export function isDbConfigured(): boolean {
  const { DB_HOST, DB_NAME, DB_USER, DB_PASS } = process.env;
  return Boolean(DB_HOST && DB_NAME && DB_USER && DB_PASS);
}
