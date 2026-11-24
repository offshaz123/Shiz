import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";

/**
 * Who sits at a given phone extension.
 *
 * Its own small module rather than another export on staff.ts, because
 * the webhook that needs it runs on a public route and should pull in as
 * little as possible to answer one question.
 */
export async function staffByExtension(
  extension: string,
): Promise<{ id: number; name: string } | null> {
  const clean = (extension ?? "").trim();
  if (!clean) return null;

  const found = await withDb(async (db) => {
    const [rows] = await db.query<(RowDataPacket & { id: number; name: string })[]>(
      "SELECT id, name FROM staff WHERE extension = ? AND active = 1 LIMIT 1",
      [clean],
    );
    return rows[0] ? { id: Number(rows[0].id), name: String(rows[0].name) } : null;
  });
  return found ?? null;
}
