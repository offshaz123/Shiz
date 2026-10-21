import { createHash } from "node:crypto";
import { loadAdTracking, phone } from "./meta-capi";
import type { Order } from "./orders";
import { tracking } from "./site";

// TikTok Events API: tells TikTok about a paid order straight from the
// server, so sales from TikTok ads still count when a browser blocks the
// Pixel. Only for customers who accepted cookies. TikTok matches it with the
// Pixel's own CompletePayment by the order number, so it's never counted twice.
//
// Needs TIKTOK_ACCESS_TOKEN in the Hostinger settings (TikTok Events Manager →
// the PlatedUp website pixel → Settings → Events API → Generate access token).

const sha = (v: string) => (v ? createHash("sha256").update(v.trim().toLowerCase()).digest("hex") : undefined);

export function isTikTokEventsConfigured() {
  return Boolean(process.env.TIKTOK_ACCESS_TOKEN?.trim() && tracking.tiktokPixelId);
}

export async function sendTikTokPurchase(order: Order) {
  const token = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  if (!token || !tracking.tiktokPixelId) return;
  try {
    const t = await loadAdTracking(order.ref);
    if (!t?.consent) return;
    const event = {
      event: "CompletePayment",
      event_time: Math.floor((order.paid_at ? new Date(order.paid_at) : new Date()).getTime() / 1000),
      event_id: order.ref,
      user: {
        email: sha(order.email),
        // TikTok wants the number with its "+", e.g. +447123…
        phone: sha(`+${phone(order.phone)}`),
        ttp: t.ttp || undefined,
        ttclid: t.ttclid || undefined,
        ip: t.ip || undefined,
        user_agent: t.userAgent || undefined,
      },
      page: t.url ? { url: t.url } : undefined,
      properties: {
        currency: "GBP",
        value: (order.amount_paid ?? order.total) / 100,
        order_id: order.ref,
        content_type: "product",
        contents: order.items.map((i) => ({ content_id: `${i.type}-${i.style}`, quantity: i.qty })),
      },
    };
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": token },
      body: JSON.stringify({
        event_source: "web",
        event_source_id: tracking.tiktokPixelId,
        data: [event],
        // Set TIKTOK_TEST_EVENT_CODE to see these in Events Manager → Test events.
        ...(process.env.TIKTOK_TEST_EVENT_CODE && { test_event_code: process.env.TIKTOK_TEST_EVENT_CODE }),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => null)) as { code?: number; message?: string } | null;
    if (!res.ok || body?.code !== 0) console.error(`TikTok purchase for ${order.ref} not accepted`, res.status, body?.message ?? "");
  } catch (err) {
    console.error(`Sending TikTok purchase for ${order.ref} failed`, err);
  }
}
