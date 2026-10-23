import { randomBytes } from "node:crypto";
import { execute, isDbConfigured, query } from "./db";

// What ads cost, for Admin → Money and Insights. Counted VAT included: the
// shop isn't VAT registered, so the VAT can't be claimed back.
//  - TikTok (and anything else): payments typed in on Admin → Money.
//  - Google Ads: sent every day by a script inside the Google Ads account
//    (googleAdsScript below), what was spent each day.
//  - Meta: read live from Meta's Marketing API with META_ADS_TOKEN, as before.

export const AD_PLATFORMS = { tiktok: "TikTok", google: "Google Ads", meta: "Meta ads", other: "Other ads" } as const;
export type AdPlatform = keyof typeof AD_PLATFORMS;
export const isAdPlatform = (v: unknown): v is AdPlatform => typeof v === "string" && v in AD_PLATFORMS;

export type AdPayment = { id: number; day: string; platform: AdPlatform; amount: number; note: string };

// Pence, for the dates. metaError says why Meta's spend couldn't be read.
export type AdSpend = { spend: number; byPlatform: Record<AdPlatform, number>; metaError: string | null };

const VAT = 1.2;

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// Payments from `from` up to (not including) `to`, newest first.
export async function adPayments(from: Date, to: Date): Promise<AdPayment[]> {
  if (!isDbConfigured()) return [];
  const rows = await query<{ id: number; day: string; platform: string; amount: number; note: string }>(
    "SELECT id, DATE_FORMAT(day, '%Y-%m-%d') AS day, platform, amount, note FROM ad_spend WHERE day >= ? AND day < ? ORDER BY day DESC, id DESC",
    [ymd(from), ymd(to)],
  );
  return rows.map((r) => ({ ...r, platform: isAdPlatform(r.platform) ? r.platform : "other", amount: Number(r.amount) }));
}

export async function adSpend(from: Date, to: Date): Promise<AdSpend> {
  const byPlatform: Record<AdPlatform, number> = { tiktok: 0, google: 0, meta: 0, other: 0 };
  for (const p of await adPayments(from, to)) byPlatform[p.platform] += p.amount;
  let metaError: string | null = null;
  try {
    byPlatform.meta += await metaSpend(from, to);
  } catch (err) {
    metaError = err instanceof Error ? err.message : "Couldn't reach Meta";
  }
  return { spend: Object.values(byPlatform).reduce((n, v) => n + v, 0), byPlatform, metaError };
}

// Meta (Facebook and Instagram) ads between two dates, VAT added, read live
// from Meta (Meta's own figures leave VAT out). 0 if META_ADS_TOKEN isn't set.
const metaCache = new Map<string, { at: number; pence: number }>();
async function metaSpend(from: Date, to: Date) {
  const token = process.env.META_ADS_TOKEN?.trim();
  if (!token) return 0;
  const key = `${ymd(from)}_${ymd(to)}`;
  const hit = metaCache.get(key);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return hit.pence;
  const account = (process.env.META_AD_ACCOUNT_ID || "1077776095076022").replace(/^act_/, "");
  const until = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    fields: "spend",
    level: "account",
    time_range: JSON.stringify({ since: ymd(from), until: ymd(until < from ? from : until) }),
    access_token: token,
  });
  const res = await fetch(`https://graph.facebook.com/${process.env.META_GRAPH_VERSION || "v23.0"}/act_${account}/insights?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const json = await res.json().catch(() => ({}));
  // Never show the token, even if Meta repeats it back.
  if (!res.ok) throw new Error(String(json?.error?.message ?? `Meta said ${res.status}`).replace(/access_token=[^&\s]+/g, "access_token=…").slice(0, 200));
  const pence = Math.round((Number(json?.data?.[0]?.spend) || 0) * 100 * VAT);
  metaCache.set(key, { at: Date.now(), pence });
  return pence;
}

export async function addAdPayment(p: Omit<AdPayment, "id">) {
  await execute("INSERT INTO ad_spend (day, platform, amount, note) VALUES (?, ?, ?, ?)", [p.day, p.platform, p.amount, p.note]);
}

export async function deleteAdPayment(id: number) {
  await execute("DELETE FROM ad_spend WHERE id = ?", [id]);
}


// Google Ads: the script in the Google Ads account sends what was spent on
// each of the last 30 days (Google's figures leave VAT out). Each day's
// figure replaces what it sent before, as Google can adjust recent days.
const GOOGLE_NOTE = "Automatic from Google Ads";

export async function saveGoogleSpend(days: { date: string; cost: number }[]) {
  for (const d of days) {
    await execute("DELETE FROM ad_spend WHERE platform = 'google' AND day = ? AND note = ?", [d.date, GOOGLE_NOTE]);
    const pence = Math.round(d.cost * 100 * VAT);
    if (pence > 0) await addAdPayment({ day: d.date, platform: "google", amount: pence, note: GOOGLE_NOTE });
  }
}

// The secret the Google Ads script sends, made once and kept in the database.
export async function googleAdsKey() {
  const rows = await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'google_ads_key'");
  if (rows[0]) return rows[0].value;
  await execute("INSERT IGNORE INTO app_settings (name, value) VALUES ('google_ads_key', ?)", [randomBytes(24).toString("hex")]);
  return (await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'google_ads_key'"))[0].value;
}

// Pasted once into Google Ads → Tools → Bulk actions → Scripts, set to run daily.
export function googleAdsScript(siteUrl: string, key: string) {
  return `// PlatedUp: sends what Google Ads spent each day to your admin (Money page).
function main() {
  var rows = AdsApp.search("SELECT segments.date, metrics.cost_micros FROM customer WHERE segments.date DURING LAST_30_DAYS");
  var days = [];
  while (rows.hasNext()) {
    var r = rows.next();
    days.push({ date: r.segments.date, cost: Number(r.metrics.costMicros) / 1000000 });
  }
  var res = UrlFetchApp.fetch(${JSON.stringify(`${siteUrl}/api/ad-spend/google`)}, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "Bearer ${key}" },
    payload: JSON.stringify({ days: days }),
    muteHttpExceptions: true,
  });
  Logger.log(res.getResponseCode() + " " + res.getContentText());
}
`;
}
