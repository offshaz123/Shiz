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

  // Who can sign into the admin besides Walid.
  //
  // Added when the first person other than him started working the call
  // list. Before it there was one shared password, which meant the "caller"
  // box on a logged call was whatever somebody typed, and no way at all to
  // answer "what did he actually do today".
  //
  // The owner is not a row here. He signs in with ADMIN_PASSWORD and sees
  // everything, so there is no row to delete by accident and no way to lock
  // him out of his own system.
  `CREATE TABLE IF NOT EXISTS staff (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    -- What they type to sign in. Lowercased on the way in so "Sam" and
    -- "sam" are the same person rather than a mystery failed login.
    username VARCHAR(40) NOT NULL,
    -- scrypt, salt and hash together. Never the password itself.
    pass_hash VARCHAR(255) NOT NULL,
    -- Comma-separated page keys from admin-pages.ts. A short fixed list
    -- read back whole and never queried, so a join table would be a table
    -- for the sake of it.
    pages VARCHAR(255) NOT NULL DEFAULT '',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_username (username)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One row per sitting at the system.
  //
  // Walid asked to know when somebody signed in, when they signed out and
  // how long they were actually on it. The action log answers what they
  // did; this answers how long they were there to do it, which is a
  // different question and the one he asked second.
  //
  // last_seen_at is touched as they move around, so a session that ends by
  // somebody closing the laptop still has an honest length. A session with
  // no sign-out is reported as "still open" rather than being silently
  // closed at the last page load — those are different facts and the
  // second one is a guess.
  `CREATE TABLE IF NOT EXISTS staff_sessions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id INT UNSIGNED NULL,
    who VARCHAR(80) NOT NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME NULL,
    -- "signed-out" when they pressed the button, left null while open.
    ended_reason VARCHAR(20) NULL,
    PRIMARY KEY (id),
    KEY idx_staff_started (staff_id, started_at),
    KEY idx_open (staff_id, ended_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // What everybody has done, in the order they did it.
  //
  // Walid asked to be able to see whether somebody is working or "mocking
  // around". This records facts and timestamps and nothing else: what was
  // done, to whom, and when. There is deliberately no score and no verdict
  // — a number claiming to measure effort would be invented, and the first
  // time it was unfair about somebody it would be worthless.
  //
  // The owner's own actions are recorded too, with staff_id NULL. A log
  // that only watches the staff is a log somebody learns to distrust.
  `CREATE TABLE IF NOT EXISTS staff_actions (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    staff_id INT UNSIGNED NULL,
    -- Their name as it was at the time, kept alongside the id so the log
    -- still reads properly after somebody is renamed or removed.
    who VARCHAR(80) NOT NULL,
    action VARCHAR(40) NOT NULL,
    subject VARCHAR(160) NULL,
    detail VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_who_when (staff_id, created_at),
    KEY idx_when (created_at)
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

  // An invoice a client sends to their own customer.
  //
  // Money is held in pence as a whole number. A price kept as a float is
  // a price that eventually adds up to 1p out, and the one place a penny
  // matters is the document somebody is being asked to pay.
  //
  // The customer is copied onto the invoice rather than referenced. An
  // invoice is a record of what was sent on a day: if their customer later
  // moves or changes their name, last quarter's invoice must still say
  // what it said when it went.
  `CREATE TABLE IF NOT EXISTS client_invoices (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    client_id INT UNSIGNED NOT NULL,
    lead_id INT UNSIGNED NULL,
    /** Counts from 1 per client, never reused, never renumbered. */
    number INT UNSIGNED NOT NULL,
    customer_name VARCHAR(160) NOT NULL,
    customer_email VARCHAR(200) NULL,
    customer_address TEXT NULL,
    issued_on DATE NOT NULL,
    due_on DATE NULL,
    /** Percent. Zero for the many sole traders who are not registered. */
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    sent_at DATETIME NULL,
    paid_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uniq_client_number (client_id, number),
    KEY idx_client_status (client_id, status),
    CONSTRAINT fk_invoices_client FOREIGN KEY (client_id)
      REFERENCES clients (id) ON DELETE CASCADE,
    CONSTRAINT fk_invoices_lead FOREIGN KEY (lead_id)
      REFERENCES client_leads (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // One line on one invoice. Its own table rather than a blob of JSON,
  // because "what did we charge for door seals last year" is a question
  // somebody will ask and a blob cannot answer.
  `CREATE TABLE IF NOT EXISTS client_invoice_lines (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    invoice_id INT UNSIGNED NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_pence INT NOT NULL DEFAULT 0,
    position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_invoice (invoice_id, position),
    CONSTRAINT fk_lines_invoice FOREIGN KEY (invoice_id)
      REFERENCES client_invoices (id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // A client's own logo, held as bytes.
  //
  // In the database rather than on disk because every deploy replaces the
  // site's files: a logo written into the app directory would vanish the
  // next time anything was pushed, and it would vanish silently, showing
  // up as a broken image on an invoice already sent to a customer.
  //
  // Its own table rather than a column on clients, so that the hundreds of
  // queries that read a client do not drag a quarter of a megabyte of
  // image along with them.
  `CREATE TABLE IF NOT EXISTS client_logos (
    client_id INT UNSIGNED NOT NULL,
    mime VARCHAR(40) NOT NULL,
    bytes MEDIUMBLOB NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (client_id),
    CONSTRAINT fk_logo_client FOREIGN KEY (client_id)
      REFERENCES clients (id) ON DELETE CASCADE
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
  // The instant reply a new enquiry gets.
  //
  // The highest-value automation a local business has, and the one that
  // moves the reply-time figure from days to minutes. Somebody who fills
  // in a form at nine at night has usually filled in three others, and the
  // first business to answer is the one still in the running at breakfast.
  //
  // Off until switched on, with wording the client can change: an
  // auto-reply that does not sound like them is worse than none.
  {
    table: "clients",
    column: "auto_reply_on",
    definition: "TINYINT(1) NOT NULL DEFAULT 0 AFTER default_lead_value",
  },
  {
    table: "clients",
    column: "auto_reply_text",
    definition: "TEXT NULL AFTER auto_reply_on",
  },
  // Stamped each time a client signs in. The one honest answer to "are
  // they actually using it", which matters before a renewal call: a client
  // who has not opened their dashboard in two months did not read the
  // figures we keep pointing them at.
  {
    table: "clients",
    column: "last_login_at",
    definition: "DATETIME NULL",
  },
  // Their logo, so the portal reads as their system rather than ours.
  {
    table: "clients",
    column: "logo_url",
    definition: "VARCHAR(500) NULL AFTER name",
  },
  // Stamped when the instant reply went, so it can never go twice and so
  // the dashboard can tell an auto-reply from a human one.
  {
    table: "client_leads",
    column: "auto_replied_at",
    definition: "DATETIME NULL AFTER first_replied_at",
  },
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

  // What has to appear on an invoice they send: who they are, where they
  // are, and how somebody pays them. Blank until they fill it in, and the
  // invoice page says plainly what is missing rather than printing a
  // document with a hole in it.
  {
    table: "clients",
    column: "business_address",
    definition: "TEXT NULL",
  },
  {
    table: "clients",
    column: "business_phone",
    definition: "VARCHAR(60) NULL",
  },
  {
    table: "clients",
    column: "vat_number",
    definition: "VARCHAR(40) NULL",
  },
  // Free text rather than sort code and account number in their own
  // columns: some are paid by bank transfer, some by card link, some on
  // the day in cash, and a form that insists on a sort code is a form
  // half of them cannot finish.
  {
    table: "clients",
    column: "payment_details",
    definition: "TEXT NULL",
  },

  // The address in parts rather than as one box of text. A single box
  // means everybody formats it differently and the invoice shows whatever
  // they did; separate boxes mean the invoice decides, and a postcode
  // typed as "m124wd" still prints as "M12 4WD".
  { table: "clients", column: "address_line1", definition: "VARCHAR(160) NULL" },
  { table: "clients", column: "address_line2", definition: "VARCHAR(160) NULL" },
  { table: "clients", column: "city", definition: "VARCHAR(100) NULL" },
  { table: "clients", column: "postcode", definition: "VARCHAR(16) NULL" },
  { table: "clients", column: "country", definition: "VARCHAR(80) NULL" },
  { table: "clients", column: "business_website", definition: "VARCHAR(200) NULL" },
  // What prints at the top of an invoice, when that is not the name we
  // know them by. We file them as "Auto Wrap Manchester"; the invoice may
  // need to say "A W Manchester Ltd".
  { table: "clients", column: "invoice_name", definition: "VARCHAR(160) NULL" },

  // Bank details in their own boxes rather than as one block of text.
  // Somebody typing their sort code into a free box writes it six
  // different ways; in a box of its own it prints as 00-00-00 whatever
  // they typed, and the invoice can label each line so the customer's
  // banking app gets the right number in the right field.
  { table: "clients", column: "bank_account_name", definition: "VARCHAR(160) NULL" },
  { table: "clients", column: "bank_sort_code", definition: "VARCHAR(20) NULL" },
  { table: "clients", column: "bank_account_number", definition: "VARCHAR(34) NULL" },

  // The customer's company, when there is one. "Mrs J Whitfield" and
  // "Whitfield Joinery Ltd" are two different lines on an invoice, and a
  // business being billed needs its own name on the document.
  {
    table: "client_invoices",
    column: "customer_company",
    definition: "VARCHAR(160) NULL AFTER customer_name",
  },

  // A discount, either a percentage or an amount off. Two columns rather
  // than one with a meaning that changes: a single column holding pence
  // sometimes and a rate other times is the kind of thing that reads
  // fine and then charges somebody 20p instead of 20%.
  {
    table: "client_invoices",
    column: "discount_kind",
    definition: "VARCHAR(10) NOT NULL DEFAULT 'none'",
  },
  {
    table: "client_invoices",
    column: "discount_percent",
    definition: "DECIMAL(5,2) NOT NULL DEFAULT 0",
  },
  {
    table: "client_invoices",
    column: "discount_pence",
    definition: "INT NOT NULL DEFAULT 0",
  },

  // How the money arrived. Most of these businesses are paid when the job
  // is finished, standing next to the customer, so an invoice is usually a
  // receipt rather than a request — and a receipt that does not say how it
  // was paid is no use to the person keeping the books.
  {
    table: "client_invoices",
    column: "paid_method",
    definition: "VARCHAR(20) NULL",
  },

  // A quote and an invoice are the same document with a different word on
  // it, the same lines, the same totals and the same template, so they
  // share a table. What differs is the word, when it runs out, and whether
  // it has been accepted.
  {
    table: "client_invoices",
    column: "kind",
    definition: "VARCHAR(10) NOT NULL DEFAULT 'invoice'",
  },
  {
    table: "client_invoices",
    column: "valid_until",
    definition: "DATE NULL",
  },
  {
    table: "client_invoices",
    column: "accepted_at",
    definition: "DATETIME NULL",
  },
  // The invoice a quote turned into, so neither can be made twice and the
  // quote can point at what became of it.
  {
    table: "client_invoices",
    column: "became_invoice_id",
    definition: "INT UNSIGNED NULL",
  },

  // Money taken before the job is finished — a deposit on booking, or a
  // part payment. Common in the trades and currently impossible to
  // record: an invoice was all or nothing.
  //
  // Its own date because it is taken on a different day from the rest,
  // and the takings figures have to count it on the day it actually
  // arrived rather than on the day the balance was settled.
  {
    table: "client_invoices",
    column: "deposit_pence",
    definition: "INT NOT NULL DEFAULT 0",
  },
  {
    table: "client_invoices",
    column: "deposit_method",
    definition: "VARCHAR(20) NULL",
  },
  {
    table: "client_invoices",
    column: "deposit_at",
    definition: "DATETIME NULL",
  },

  // What line of work they are in, so the ideas page talks about their
  // trade rather than about businesses in general. Set from the admin
  // side; blank falls back to advice anybody can use.
  {
    table: "clients",
    column: "trade",
    definition: "VARCHAR(40) NULL",
  },

  // What their own website scored when we last looked, and the handful of
  // things most worth fixing. Stored rather than scanned on every page
  // view: a scan is a dozen requests to somebody else's server and the
  // answer does not change hour to hour.
  //
  // The issues are kept as JSON because they are a short list read back
  // whole and never queried — a table for five rows that nobody filters
  // is a table for the sake of it.
  {
    table: "clients",
    column: "site_score",
    definition: "TINYINT UNSIGNED NULL",
  },
  {
    table: "clients",
    column: "site_issues",
    definition: "TEXT NULL",
  },
  {
    table: "clients",
    column: "site_scanned_at",
    definition: "DATETIME NULL",
  },
  // Which countries a member of staff works.
  //
  // Separate from the page switches because it is a different question:
  // the pages decide what kind of thing somebody can do, this decides
  // whose businesses they can do it to. Walid wanted to be able to hand
  // somebody the American list without the British one, or the reverse.
  //
  // Empty means both, so every account that existed before this keeps
  // working rather than silently losing its list.
  {
    table: "staff",
    column: "regions",
    definition: "VARCHAR(40) NOT NULL DEFAULT '' AFTER pages",
  },
  // Which country this business is in.
  //
  // One list with a column rather than two sets of tables. Everything
  // downstream — the call list, the scanner, the three emails, the counts
  // on the overview — then works for both markets by passing a region
  // instead of being written twice, and the second copy is always the one
  // that stops being maintained.
  //
  // Everything found before the United States was added is British, which
  // is what the default says.
  {
    table: "prospects",
    column: "region",
    definition: "VARCHAR(2) NOT NULL DEFAULT 'uk' AFTER industry",
  },
  // A published email address that does not work.
  //
  // Set when a bounce for it arrives in the inbox, or when a sweep finds the
  // domain has no mail server at all. Nothing is ever sent to a row with
  // this set, and the call list says so rather than saying "no reply" — the
  // two are opposite openings on a phone call.
  //
  // The address itself is left in place deliberately. Clearing it would lose
  // the only thing that explains why this business is on the call list and
  // not in the email sequence.
  {
    table: "prospects",
    column: "email_dead_at",
    definition: "DATETIME NULL AFTER email",
  },
  {
    table: "prospects",
    column: "email_dead_reason",
    definition: "VARCHAR(200) NULL AFTER email_dead_at",
  },
  // When the address's domain was last asked whether it can receive mail at
  // all. Drives the sweep over rows scanned before that check existed: it is
  // how the sweep knows which rows it has already done, and it means a
  // one-off job can run a few at a time off the back of an existing cron
  // rather than needing a job of its own.
  {
    table: "prospects",
    column: "mx_checked_at",
    definition: "DATETIME NULL AFTER email_dead_reason",
  },
];

/**
 * Indexes that have to change rather than simply appear.
 *
 * Only one so far, and it is the reason this exists: quotes and invoices
 * count from 1 separately, so quote 0007 and invoice 0007 both have to be
 * allowed. The old key said a client could not have two documents with the
 * same number at all, which was right when there was only one kind.
 *
 * Gapless invoice numbering matters here. An accountant asked why invoice
 * 12 is missing does not want to hear that it was a quote.
 */
const CHANGED_INDEXES: {
  table: string;
  /** Dropped only if it exists. */
  drop: string;
  add: string;
  definition: string;
}[] = [
  {
    table: "client_invoices",
    drop: "uniq_client_number",
    add: "uniq_client_kind_number",
    definition: "UNIQUE KEY uniq_client_kind_number (client_id, kind, number)",
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

  for (const { table, drop, add, definition } of CHANGED_INDEXES) {
    const [rows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS n FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
      [table, add],
    );
    if ((rows[0]?.n ?? 0) > 0) continue;

    // Dropped first and separately: on a database that never had the old
    // key, the drop fails and the add must still run.
    await db.query(`ALTER TABLE \`${table}\` DROP INDEX \`${drop}\``).catch(() => null);
    await db.query(`ALTER TABLE \`${table}\` ADD ${definition}`);
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
