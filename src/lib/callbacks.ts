import type { RowDataPacket } from "mysql2";
import { withDb } from "./db";
import type { Region } from "./regions";

/**
 * The diary: who asked to be rung back, and when.
 *
 * A promise to ring somebody at half nine on Thursday is the most
 * valuable thing said on any of these calls, and until now it lived as
 * a single date on a row in a list of two hundred. The only way to
 * find out what the day held was to read the whole list.
 *
 * So it gets a diary of its own, by day and in time order, for the
 * person who has to keep the promise and for the person who wants to
 * know whether it was kept.
 */

export type Callback = {
  prospectId: number;
  business: string;
  phone: string;
  /** "2026-11-25 09:30:00" as the database holds it. */
  at: string;
  /** Just the day, for grouping. */
  day: string;
  /** "09:30". */
  time: string;
  region: Region;
  status: string;
  /** Who said they would ring, when we know. */
  promisedBy: string;
  /** What they said last time, so the call can open properly. */
  notes: string;
  /** True once that moment has gone by. */
  overdue: boolean;
};

export type DiaryDay = {
  /** "2026-11-25". */
  day: string;
  /** "Today", "Tomorrow", or "Thu 27 Nov". */
  label: string;
  calls: Callback[];
};

interface Row extends RowDataPacket {
  id: number;
  name: string;
  phone: string | null;
  callback_at: string;
  region: string;
  status: string;
  caller: string | null;
  notes: string | null;
}

function dayWords(day: string, today: string, tomorrow: string): string {
  if (day === today) return "Today";
  if (day === tomorrow) return "Tomorrow";
  const when = new Date(`${day}T12:00:00`);
  return when.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

/**
 * Every callback from the start of today onwards, plus anything
 * already missed, which belongs at the top rather than hidden.
 */
export async function diary(options: { regions?: Region[]; days?: number } = {}): Promise<
  { missed: Callback[]; days: DiaryDay[] } | null
> {
  const { regions, days = 21 } = options;

  const rows = await withDb(async (db) => {
    const where: string[] = [
      "p.deleted_at IS NULL",
      "p.callback_at IS NOT NULL",
      "p.status NOT IN ('customer', 'not-interested')",
      "p.callback_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)",
      "p.callback_at < DATE_ADD(CURDATE(), INTERVAL ? DAY)",
    ];
    const params: (string | number)[] = [days];

    if (regions && regions.length > 0) {
      where.push(`p.region IN (${regions.map(() => "?").join(", ")})`);
      params.push(...regions);
    }

    const [found] = await db.query<Row[]>(
      `SELECT p.id, p.name, p.phone, p.callback_at, p.region, p.status,
              c.caller, c.notes
         FROM prospects p
         -- The last call made to them, which is where the promise was
         -- made and what the next one should open with.
         LEFT JOIN prospect_calls c
           ON c.id = (SELECT c2.id FROM prospect_calls c2
                       WHERE c2.prospect_id = p.id
                       ORDER BY c2.called_at DESC LIMIT 1)
        WHERE ${where.join(" AND ")}
        ORDER BY p.callback_at ASC`,
      params,
    );
    return found;
  });

  if (!rows) return null;

  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = iso(now);
  const tomorrowKey = iso(new Date(now.getTime() + 86_400_000));

  const all: Callback[] = rows.map((r) => {
    const at = String(r.callback_at);
    const when = new Date(at.replace(" ", "T"));
    return {
      prospectId: Number(r.id),
      business: String(r.name ?? ""),
      phone: String(r.phone ?? ""),
      at,
      day: at.slice(0, 10),
      time: at.slice(11, 16),
      region: (r.region === "us" ? "us" : "uk") as Region,
      status: String(r.status ?? ""),
      promisedBy: String(r.caller ?? ""),
      notes: String(r.notes ?? ""),
      overdue: when.getTime() < now.getTime(),
    };
  });

  // Missed ones are their own list. Left in the day they were promised
  // for, they sit under a heading three weeks back that nobody opens.
  const missed = all.filter((c) => c.day < todayKey);
  const ahead = all.filter((c) => c.day >= todayKey);

  const byDay = new Map<string, Callback[]>();
  for (const call of ahead) {
    const list = byDay.get(call.day) ?? [];
    list.push(call);
    byDay.set(call.day, list);
  }

  return {
    missed,
    days: [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, calls]) => ({ day, label: dayWords(day, todayKey, tomorrowKey), calls })),
  };
}
