import { execute, query } from "./db";
import { isSource } from "./sources";

// What the checkout request tells us about where the customer came from and
// which ad, kept with the order. Only for customers who accepted cookies.
// Used to send the paid order to TikTok (tiktok-events.ts) and to show where
// sales came from on Admin → Insights.

export type AdTracking = {
  consent: boolean;
  // TikTok's browser cookie and click id (tiktok-events.ts).
  ttp?: string;
  ttclid?: string;
  ip: string;
  userAgent: string;
  url: string;
};

function cookie(header: string, name: string) {
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]).slice(0, 300) : "";
}

// What we need from the checkout request to send the purchase later.
export function adTrackingFrom(req: Request, ip: string): (AdTracking & { source: string | null }) | null {
  const cookies = req.headers.get("cookie") ?? "";
  if (cookie(cookies, "pu-consent") !== "yes") return null;
  const source = cookie(cookies, "pu-src");
  return {
    consent: true,
    ttp: cookie(cookies, "_ttp"),
    ttclid: cookie(cookies, "pu-ttclid"),
    ip: ip === "unknown" ? "" : ip,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 400),
    url: (req.headers.get("referer") ?? "").slice(0, 400),
    source: isSource(source) ? source : null,
  };
}

export async function loadAdTracking(ref: string) {
  const rows = await query<{ ad_tracking: string | null }>("SELECT ad_tracking FROM orders WHERE ref = ?", [ref]);
  return rows[0]?.ad_tracking ? (JSON.parse(rows[0].ad_tracking) as AdTracking) : null;
}

// `visitSource` is where this visit came from, used when the cookie (kept
// only with consent) doesn't say.
export async function saveAdTracking(ref: string, t: (AdTracking & { source: string | null }) | null, visitSource: string | null = null) {
  if (!t) {
    if (visitSource) await execute("UPDATE orders SET source = ? WHERE ref = ?", [visitSource, ref]);
    return;
  }
  const { source, ...rest } = t;
  await execute("UPDATE orders SET ad_tracking = ?, source = ? WHERE ref = ?", [JSON.stringify(rest), source ?? visitSource, ref]);
}

// UK numbers in international form without "+": 07123… → 447123…
export function phone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("44")) return d;
  if (d.startsWith("0")) return `44${d.slice(1)}`;
  return d;
}
