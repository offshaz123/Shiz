"use client";

import { useEffect } from "react";
import { trackingConfig } from "@/lib/site-config";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// Fires the Google Ads conversion and Meta Pixel "Lead" events once, on
// mount — dropped onto /thank-you so a conversion only counts after a
// genuinely successful form submission. No-ops until the relevant IDs in
// `trackingConfig` are filled in.
export function ConversionTracker() {
  useEffect(() => {
    const { googleAdsConversionId, googleAdsConversionLabel, metaPixelId } = trackingConfig;

    if (googleAdsConversionId && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: googleAdsConversionLabel
          ? `${googleAdsConversionId}/${googleAdsConversionLabel}`
          : googleAdsConversionId,
      });
    }

    if (metaPixelId && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  }, []);

  return null;
}
