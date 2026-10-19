import { execute, isDbConfigured, query } from "./db";
import { LAUNCH_RISE, type PriceChange, type StyleId, getPriceChanges, setPriceChanges, styles } from "./plates";

// Loads the price changes from Admin → Prices into the price list, at most
// every 30 seconds. Call before working out prices on the server.

let loadedAt = 0;

export async function loadPriceChanges(force = false) {
  if (!isDbConfigured()) return;
  if (!force && Date.now() - loadedAt < 30_000) return;
  try {
    // The launch price rise goes into the table once, so it can be changed in the admin like any other.
    const seeded = await execute("INSERT IGNORE INTO weekly_reports (week) VALUES ('pricesdb')");
    if (seeded.affectedRows === 1)
      for (const c of LAUNCH_RISE)
        await execute("INSERT INTO price_changes (style, pair, single, starts_at) VALUES (?, ?, ?, ?)", [c.style, c.pair, c.single, new Date(c.startsAt)]);
    const rows = await query<{ id: number; style: string; pair: number; single: number; starts_at: Date }>(
      "SELECT id, style, pair, single, starts_at FROM price_changes ORDER BY starts_at",
    );
    setPriceChanges(
      rows
        .filter((r) => styles.some((s) => s.id === r.style))
        .map((r) => ({ id: r.id, style: r.style as StyleId, pair: r.pair, single: r.single, startsAt: new Date(r.starts_at).getTime() })),
    );
    loadedAt = Date.now();
  } catch (err) {
    console.error("Loading prices failed", err);
  }
}

export async function addPriceChange(c: Omit<PriceChange, "id">) {
  await execute("INSERT INTO price_changes (style, pair, single, starts_at) VALUES (?, ?, ?, ?)", [c.style, c.pair, c.single, new Date(c.startsAt)]);
  await loadPriceChanges(true);
}

// Only changes that haven't started can be cancelled.
export async function cancelPriceChange(id: number) {
  const res = await execute("DELETE FROM price_changes WHERE id = ? AND starts_at > NOW()", [id]);
  await loadPriceChanges(true);
  return res.affectedRows === 1;
}

// Changes that haven't started yet, soonest first.
export function futureChanges() {
  const now = Date.now();
  return getPriceChanges()
    .filter((c) => c.startsAt > now)
    .sort((a, b) => a.startsAt - b.startsAt);
}
