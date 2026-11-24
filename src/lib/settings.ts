import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";

/**
 * The few things the owner sets that have nowhere else to live.
 *
 * Staff keep their settings on their own row. The owner has no row, so
 * before this his phone extension lived in an environment variable
 * while everybody else typed theirs into a box on the same screen — two
 * ways to do one thing, and the first person to meet it asked why.
 */

export type SettingName = "owner_extension";

export async function getSetting(name: SettingName): Promise<string> {
  const found = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { value: string })[]>(
      "SELECT value FROM settings WHERE name = ? LIMIT 1",
      [name],
    );
    return rows[0]?.value ?? "";
  });
  return found ?? "";
}

export async function setSetting(name: SettingName, value: string): Promise<void> {
  await withDb(async (db) => {
    await db.execute(
      `INSERT INTO settings (name, value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [name, value.slice(0, 255)],
    );
  }).catch(() => null);
}

/**
 * The owner's own phone extension.
 *
 * Read from the database first and from the environment second, so the
 * variable anybody already set keeps working and nothing has to be
 * undone — but the box on the screen wins, because that is the one
 * somebody will reach for.
 */
export async function ownerExtension(): Promise<string> {
  const saved = await getSetting("owner_extension");
  return saved || process.env.ZADARMA_OWNER_EXTENSION || "";
}
