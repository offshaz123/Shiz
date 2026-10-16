import { tracking } from "./site";

// How much was spent on Meta (Facebook and Instagram) ads, read live from
// Meta's Marketing API for the admin Money page. Only reads.
//
// Needs META_ADS_TOKEN in the Hostinger settings: a token with the "ads_read"
// permission for the ad account (Business settings → System users).

const accountId = () => (process.env.META_AD_ACCOUNT_ID || tracking.metaAdAccountId).replace(/^act_/, "");

export function isMetaAdsConfigured() {
  return Boolean(process.env.META_ADS_TOKEN && accountId());
}

export type AdSpend = { spend: number; impressions: number; clicks: number; purchases: number };

const ymd = (d: Date) => d.toISOString().slice(0, 10);

// Spend between two days (both included), in pence.
export async function adSpend(from: Date, to: Date): Promise<AdSpend> {
  const version = process.env.META_GRAPH_VERSION || "v23.0";
  const params = new URLSearchParams({
    fields: "spend,impressions,clicks,actions",
    level: "account",
    time_range: JSON.stringify({ since: ymd(from), until: ymd(to) }),
    access_token: (process.env.META_ADS_TOKEN ?? "").trim(),
  });
  const res = await fetch(`https://graph.facebook.com/${version}/act_${accountId()}/insights?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = String(json?.error?.message ?? `Meta said ${res.status}`);
    // Never show the token, even if Meta repeats it back.
    throw new Error(msg.replace(/access_token=[^&\s]+/g, "access_token=…").slice(0, 300));
  }
  const row = Array.isArray(json.data) && json.data[0] ? json.data[0] : {};
  const actions: { action_type?: string; value?: string }[] = Array.isArray(row.actions) ? row.actions : [];
  const purchases = actions
    .filter((a) => a.action_type === "offsite_conversion.fb_pixel_purchase" || a.action_type === "purchase")
    .reduce((n, a) => Math.max(n, Number(a.value) || 0), 0);
  return {
    spend: Math.round((Number(row.spend) || 0) * 100),
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    purchases,
  };
}
