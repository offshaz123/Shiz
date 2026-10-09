import mysql from "mysql2/promise";

// MySQL connection (Hostinger: hPanel → Databases → MySQL Databases, host is
// usually "localhost"). Tables are created automatically on first use.

export function isDbConfigured() {
  return Boolean(process.env.DB_NAME && process.env.DB_USER);
}

let pool: mysql.Pool | null = null;
let ready: Promise<void> | null = null;

function getPool() {
  if (!isDbConfigured()) throw new Error("Database is not configured");
  pool ??= mysql.createPool({
    // Node can resolve "localhost" to the IPv6 address ::1, while MySQL on
    // shared hosting usually only listens on 127.0.0.1, so use that directly.
    host: !process.env.DB_HOST || process.env.DB_HOST === "localhost" ? "127.0.0.1" : process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    charset: "utf8mb4",
    dateStrings: false,
  });
  return pool;
}

const schema = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(40) NOT NULL DEFAULT '',
    address1 VARCHAR(200) NOT NULL DEFAULT '',
    address2 VARCHAR(200) NOT NULL DEFAULT '',
    town VARCHAR(100) NOT NULL DEFAULT '',
    postcode VARCHAR(12) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token CHAR(64) PRIMARY KEY,
    user_id INT NULL,
    is_admin TINYINT NOT NULL DEFAULT 0,
    expires_at DATETIME NOT NULL,
    INDEX (user_id)
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ref VARCHAR(20) NOT NULL UNIQUE,
    user_id INT NULL,
    status VARCHAR(20) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(190) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    address1 VARCHAR(200) NOT NULL,
    address2 VARCHAR(200) NOT NULL DEFAULT '',
    town VARCHAR(100) NOT NULL,
    postcode VARCHAR(12) NOT NULL,
    items LONGTEXT NOT NULL,
    delivery_name VARCHAR(100) NOT NULL,
    delivery_price INT NOT NULL,
    subtotal INT NOT NULL,
    total INT NOT NULL,
    amount_paid INT NULL,
    card_brand VARCHAR(30) NULL,
    card_last4 VARCHAR(4) NULL,
    stripe_session_id VARCHAR(255) NULL,
    docs_status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at DATETIME NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (user_id), INDEX (email), INDEX (status), INDEX (created_at)
  ) CHARACTER SET utf8mb4`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    kind VARCHAR(30) NOT NULL,
    filename VARCHAR(200) NOT NULL,
    mime VARCHAR(100) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX (order_id)
  ) CHARACTER SET utf8mb4`,
];

async function ensureSchema() {
  ready ??= (async () => {
    const p = getPool();
    for (const sql of schema) await p.query(sql);
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

type Params = (string | number | boolean | Date | Buffer | null)[];

export async function query<T = mysql.RowDataPacket>(sql: string, params: Params = []) {
  await ensureSchema();
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

export async function execute(sql: string, params: Params = []) {
  await ensureSchema();
  const [result] = await getPool().query(sql, params);
  return result as mysql.ResultSetHeader;
}
