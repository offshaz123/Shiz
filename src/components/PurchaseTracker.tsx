"use client";

import { useEffect } from "react";
import { tracking } from "@/lib/site";
import { type CartItem } from "@/lib/plates";
import { trackPurchase, whenTagsReady } from "@/lib/track";

const googleAdsSendTo =
  tracking.googleAdsId && tracking.googleAdsPurchaseLabel ? `${tracking.googleAdsId}/${tracking.googleAdsPurchaseLabel}` : "";

// Tells Google and TikTok about a paid order, once per order on this device
// (the thank-you page can be refreshed or revisited).
export function PurchaseTracker({ orderRef, value, items }: { orderRef: string; value: number; items: Pick<CartItem, "type" | "style" | "qty">[] }) {
  useEffect(() => {
    const key = `pu-purchase-${orderRef}`;
    try {
      if (localStorage.getItem(key)) return;
    } catch {}
    return whenTagsReady(() => {
      trackPurchase({ ref: orderRef, value, items, googleAdsSendTo });
      try {
        localStorage.setItem(key, "1");
      } catch {}
    });
  }, [orderRef, value, items]);
  return null;
}
