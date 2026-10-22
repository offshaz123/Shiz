// Where a visitor came from, worked out in the browser from the address they
// landed on and the page that sent them. Used to count visits and to note on
// each order where the customer came from (Admin → Insights).

export const SOURCES = {
  google_ads: "Google Ads",
  google_shopping: "Google Shopping (free)",
  google: "Google search (free)",
  tiktok_ads: "TikTok ads",
  tiktok: "TikTok (free)",
  meta: "Instagram / Facebook",
  other: "Other websites",
  direct: "Typed in / bookmark",
  email: "Our emails",
} as const;

export type SourceId = keyof typeof SOURCES;

export const isSource = (v: unknown): v is SourceId => typeof v === "string" && v in SOURCES;

// null when the visitor came from another page of the shop.
export function landingSource(url: URL, referrer: string, shopHost: string): SourceId | null {
  const q = url.searchParams;
  const utm = (q.get("utm_source") ?? "").toLowerCase();
  if (q.has("gclid") || q.has("gbraid") || q.has("wbraid")) return "google_ads";
  if (q.has("ttclid") || utm === "tiktok") return "tiktok_ads";
  if (q.has("srsltid")) return "google_shopping";
  if (utm === "email" || q.has("t")) return url.pathname.startsWith("/complete-order") || utm === "email" ? "email" : null;
  if (utm.includes("google")) return "google_ads";
  if (utm.includes("facebook") || utm.includes("instagram") || utm.includes("meta") || q.has("fbclid")) return "meta";
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {}
  const shop = shopHost.replace(/^www\./, "");
  // Back from paying (Stripe, or the bank's card check) is the same visit.
  if (host === shop || host.endsWith("stripe.com") || url.pathname.startsWith("/order-confirmed")) return null;
  if (!host) return "direct";
  if (/(^|\.)google\./.test(host)) return "google";
  if (host.endsWith("tiktok.com")) return "tiktok";
  if (/(facebook|instagram|fb)\.com$/.test(host) || host === "l.facebook.com" || host === "l.instagram.com") return "meta";
  return "other";
}
