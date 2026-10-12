import { createHash } from "node:crypto";
import { execute, query } from "./db";
import type { Order } from "./orders";
import { tracking } from "./site";

// Meta Conversions API: tells Meta about a paid order straight from the
// server, so purchases still count when a browser blocks the Pixel (Safari,
// ad blockers). Only for customers who accepted cookies. Meta matches it with
// the Pixel's own Purchase event by the order number, so it's never counted twice.
//
// Needs META_CAPI_TOKEN in the Hostinger settings (Events Manager → your
// Pixel → Settings → Conversions API → Generate access token).

export type AdTracking = {
  consent: boolean;
  fbp: string;
  fbc: string;
  ip: string;
  userAgent: string;
  url: string;
};

function cookie(header: string, name: string) {
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]).slice(0, 300) : "";
}

// What we need from the checkout request to send the purchase later.
export function adTrackingFrom(req: Request, ip: string): AdTracking | null {
  const cookies = req.headers.get("cookie") ?? "";
  if (cookie(cookies, "pu-consent") !== "yes") return null;
  return {
    consent: true,
    fbp: cookie(cookies, "_fbp"),
    fbc: cookie(cookies, "_fbc"),
    ip: ip === "unknown" ? "" : ip,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 400),
    url: (req.headers.get("referer") ?? "").slice(0, 400),
  };
}

export async function saveAdTracking(ref: string, t: AdTracking | null) {
  if (t) await execute("UPDATE orders SET ad_tracking = ? WHERE ref = ?", [JSON.stringify(t), ref]);
}

const hash = (v: string) => (v ? [createHash("sha256").update(v.trim().toLowerCase()).digest("hex")] : undefined);

// UK numbers in international form without "+", as Meta asks: 07123… → 447123…
function phone(raw: string) {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("44")) return d;
  if (d.startsWith("0")) return `44${d.slice(1)}`;
  return d;
}

export async function sendMetaPurchase(order: Order) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !tracking.metaPixelId) return;
  try {
    const rows = await query<{ ad_tracking: string | null }>("SELECT ad_tracking FROM orders WHERE ref = ?", [order.ref]);
    const t = rows[0]?.ad_tracking ? (JSON.parse(rows[0].ad_tracking) as AdTracking) : null;
    if (!t?.consent) return;
    const [first, ...rest] = order.customer_name.trim().split(/\s+/);
    const event = {
      event_name: "Purchase",
      event_time: Math.floor((order.paid_at ? new Date(order.paid_at) : new Date()).getTime() / 1000),
      event_id: order.ref,
      action_source: "website",
      event_source_url: t.url || undefined,
      user_data: {
        em: hash(order.email),
        ph: hash(phone(order.phone)),
        fn: hash(first ?? ""),
        ln: hash(rest.join(" ")),
        ct: hash(order.town.replace(/\s+/g, "")),
        zp: hash(order.postcode.replace(/\s+/g, "")),
        country: hash("gb"),
        client_ip_address: t.ip || undefined,
        client_user_agent: t.userAgent || undefined,
        fbp: t.fbp || undefined,
        fbc: t.fbc || undefined,
      },
      custom_data: {
        currency: "GBP",
        value: (order.amount_paid ?? order.total) / 100,
        order_id: order.ref,
        content_type: "product",
        contents: order.items.map((i) => ({ id: `${i.type}-${i.style}`, quantity: i.qty })),
      },
    };
    const version = process.env.META_GRAPH_VERSION || "v23.0";
    const res = await fetch(`https://graph.facebook.com/${version}/${tracking.metaPixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        access_token: token,
        // Set META_TEST_EVENT_CODE to see these in Events Manager → Test events.
        ...(process.env.META_TEST_EVENT_CODE && { test_event_code: process.env.META_TEST_EVENT_CODE }),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error(`Meta purchase for ${order.ref} not accepted`, res.status, (await res.text()).slice(0, 500));
  } catch (err) {
    console.error(`Sending Meta purchase for ${order.ref} failed`, err);
  }
}
