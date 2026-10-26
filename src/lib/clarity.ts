import { execute, isDbConfigured, query } from "./db";

// How visitors behave on the site over the last 3 days, from Microsoft
// Clarity's Data Export API, for Admin → Insights. Clarity allows only 10
// requests a day, so the answer is kept for 4 hours (2 requests each time).
//
// Needs CLARITY_API_TOKEN in the Hostinger settings (Clarity → Settings →
// Data Export → Generate new API token).

export type ClarityMetric = { name: string; rows: Record<string, string | number>[] };
export type ClaritySummary = { at: number; overall: ClarityMetric[]; byPage: ClarityMetric[] };

const KEEP = 4 * 60 * 60 * 1000;

export const isClarityConfigured = () => Boolean(process.env.CLARITY_API_TOKEN?.trim());

async function exportData(params: Record<string, string>): Promise<ClarityMetric[]> {
  const res = await fetch(`https://www.clarity.ms/export-data/api/v1/project-live-insights?${new URLSearchParams({ numOfDays: "3", ...params })}`, {
    headers: { Authorization: `Bearer ${process.env.CLARITY_API_TOKEN?.trim()}`, "Content-Type": "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 429) throw new Error("Clarity's daily limit is used up. It'll show again tomorrow.");
  if (res.status === 401 || res.status === 403) throw new Error("Clarity didn't accept the API token. Make a new one in Clarity → Settings → Data Export.");
  if (!res.ok) throw new Error(`Clarity said ${res.status}`);
  const json = await res.json().catch(() => []);
  return (Array.isArray(json) ? json : []).map((m: { metricName?: string; information?: unknown }) => ({
    name: String(m.metricName ?? ""),
    // The database keeps settings as text up to 64KB, so only the busiest rows.
    rows: Array.isArray(m.information) ? (m.information as Record<string, string | number>[]).slice(0, 25) : [],
  }));
}

export async function claritySummary(): Promise<ClaritySummary | { error: string }> {
  if (!isClarityConfigured()) return { error: "Not connected yet: add CLARITY_API_TOKEN in Hostinger (Clarity → Settings → Data Export → Generate new API token)." };
  if (!isDbConfigured()) return { error: "Needs the database" };
  const saved = (await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'clarity_cache'"))[0];
  const cached = saved ? (JSON.parse(saved.value) as ClaritySummary) : null;
  if (cached && Date.now() - cached.at < KEEP) return cached;
  try {
    const [overall, byPage] = await Promise.all([exportData({}), exportData({ dimension1: "URL" })]);
    const fresh = { at: Date.now(), overall, byPage };
    await execute("INSERT INTO app_settings (name, value) VALUES ('clarity_cache', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [JSON.stringify(fresh)]);
    return fresh;
  } catch (err) {
    console.error("Loading Clarity figures failed", err);
    // Show the last figures if there are any, rather than nothing.
    return cached ?? { error: err instanceof Error ? err.message : "Couldn't reach Clarity" };
  }
}
