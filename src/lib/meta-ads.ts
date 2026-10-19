import { tracking } from "./site";

// How much was spent on Meta (Facebook and Instagram) ads and what it brought
// in, read live from Meta's Marketing API for the admin Money and Insights
// pages. Only reads.
//
// Needs META_ADS_TOKEN in the Hostinger settings: a token with the "ads_read"
// permission for the ad account (Business settings → System users).

const accountId = () => (process.env.META_AD_ACCOUNT_ID || tracking.metaAdAccountId).replace(/^act_/, "");

export function isMetaAdsConfigured() {
  return Boolean(process.env.META_ADS_TOKEN && accountId());
}

export type AdSpend = {
  // Pence.
  spend: number;
  impressions: number;
  clicks: number;
  // The steps from an ad to a sale, as the Meta Pixel saw them.
  linkClicks: number;
  landingViews: number;
  addToCart: number;
  checkouts: number;
  purchases: number;
};

export type AdRow = AdSpend & { name: string; ctr: number };

const ymd = (d: Date) => d.toISOString().slice(0, 10);

type Action = { action_type?: string; value?: string };

// Meta can report the same step under two names; take the larger, never add.
function count(actions: Action[], ...types: string[]) {
  return actions.filter((a) => a.action_type && types.includes(a.action_type)).reduce((n, a) => Math.max(n, Number(a.value) || 0), 0);
}

function parse(row: Record<string, unknown>): AdSpend {
  const actions: Action[] = Array.isArray(row.actions) ? (row.actions as Action[]) : [];
  return {
    spend: Math.round((Number(row.spend) || 0) * 100),
    impressions: Number(row.impressions) || 0,
    clicks: Number(row.clicks) || 0,
    linkClicks: Number(row.inline_link_clicks) || count(actions, "link_click"),
    landingViews: count(actions, "landing_page_view", "omni_landing_page_view"),
    addToCart: count(actions, "offsite_conversion.fb_pixel_add_to_cart", "add_to_cart", "omni_add_to_cart"),
    checkouts: count(actions, "offsite_conversion.fb_pixel_initiate_checkout", "initiate_checkout", "omni_initiated_checkout"),
    purchases: count(actions, "offsite_conversion.fb_pixel_purchase", "purchase", "omni_purchase"),
  };
}

async function insights(from: Date, to: Date, level: "account" | "ad") {
  const version = process.env.META_GRAPH_VERSION || "v23.0";
  const params = new URLSearchParams({
    fields: `${level === "ad" ? "ad_name," : ""}spend,impressions,clicks,inline_link_clicks,ctr,actions`,
    level,
    limit: "100",
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
  return (Array.isArray(json.data) ? json.data : []) as Record<string, unknown>[];
}

// A light request that only works with a valid token (for the admin status bar).
export async function checkMetaAds() {
  const today = new Date();
  await insights(today, today, "account");
}

// Spend between two days (both included).
export async function adSpend(from: Date, to: Date): Promise<AdSpend> {
  const rows = await insights(from, to, "account");
  return parse(rows[0] ?? {});
}

// The same figures for each ad, biggest spend first.
export async function adsByAd(from: Date, to: Date): Promise<AdRow[]> {
  const rows = await insights(from, to, "ad");
  return rows
    .map((r) => ({ ...parse(r), name: String(r.ad_name ?? "Ad"), ctr: Number(r.ctr) || 0 }))
    .sort((a, b) => b.spend - a.spend);
}
