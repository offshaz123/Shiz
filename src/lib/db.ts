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
const ADDED_COLUMNS: { table: string; column: string; definition: string }[] = [
  { table: "scan_leads", column: "audit_json", definition: "MEDIUMTEXT NULL AFTER score" },
  { table: "scan_leads", column: "unsubscribed_at", definition: "DATETIME NULL AFTER notes" },
];

interface CountRow extends RowDataPacket {
  n: number;
}

async function ensureSchema(db: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA) {
    await db.query(statement);
  }

  for (const { table, column, definition } of ADDED_COLUMNS) {
    const [rows] = await db.query<CountRow[]>(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    if ((rows[0]?.n ?? 0) === 0) {
      await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
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
