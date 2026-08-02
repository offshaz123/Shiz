import "server-only";
import mysql from "mysql2/promise";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS enquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NULL,
    email VARCHAR(190) NULL,
    service_category VARCHAR(80) NULL,
    message TEXT NULL,
    channel ENUM('web_form','phone_call','whatsapp','walk_in','chat_bot') NOT NULL DEFAULT 'web_form',
    status ENUM('new','contacted','booked','completed','cancelled') NOT NULL DEFAULT 'new',
    notes TEXT NULL,
    INDEX idx_enquiries_channel (channel),
    INDEX idx_enquiries_status (status),
    INDEX idx_enquiries_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    role ENUM('user','assistant') NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_session (session_id),
    INDEX idx_chat_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

let pool: mysql.Pool | null = null;
let schemaReady: Promise<void> | null = null;

function createPool(): mysql.Pool {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error(
      "Database is not configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in the environment (see README)."
    );
  }
  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    dateStrings: true,
  });
}

async function ensureSchema(p: mysql.Pool): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await p.query(statement);
  }
}

export async function getPool(): Promise<mysql.Pool> {
  if (!pool) pool = createPool();
  if (!schemaReady) schemaReady = ensureSchema(pool);
  await schemaReady;
  return pool;
}

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T> {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows as T;
}
