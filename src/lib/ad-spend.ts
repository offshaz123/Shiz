import { execute, isDbConfigured, query } from "./db";

// What was paid for ads, typed in on Admin → Money from the TikTok and Google
// bills. Counted as what came off the card, VAT included: the shop isn't VAT
// registered, so the VAT can't be claimed back.

export const AD_PLATFORMS = { tiktok: "TikTok", google: "Google Ads", other: "Other ads" } as const;
export type AdPlatform = keyof typeof AD_PLATFORMS;
export const isAdPlatform = (v: unknown): v is AdPlatform => typeof v === "string" && v in AD_PLATFORMS;

export type AdPayment = { id: number; day: string; platform: AdPlatform; amount: number; note: string };

// Pence, for the dates.
export type AdSpend = { spend: number; byPlatform: Record<AdPlatform, number> };

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
  const byPlatform: Record<AdPlatform, number> = { tiktok: 0, google: 0, other: 0 };
  for (const p of await adPayments(from, to)) byPlatform[p.platform] += p.amount;
  return { spend: byPlatform.tiktok + byPlatform.google + byPlatform.other, byPlatform };
}

export async function addAdPayment(p: Omit<AdPayment, "id">) {
  await execute("INSERT INTO ad_spend (day, platform, amount, note) VALUES (?, ?, ?, ?)", [p.day, p.platform, p.amount, p.note]);
}

export async function deleteAdPayment(id: number) {
  await execute("DELETE FROM ad_spend WHERE id = ?", [id]);
}
