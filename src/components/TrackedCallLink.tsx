"use client";

import type { ReactNode } from "react";
import { siteConfig, trackingConfig } from "@/lib/site-config";

// A tel: link that reports the click as a conversion before the dialler
// opens. On a call-first landing page this is the main conversion, so without
// it Google Ads would only ever see the (rare) form submissions. No-ops until
// the relevant IDs in `trackingConfig` are filled in.
export function TrackedCallLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  function handleClick() {
    const { googleAdsConversionId, googleAdsCallConversionLabel, metaPixelId } = trackingConfig;

    if (googleAdsConversionId && googleAdsCallConversionLabel && typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: `${googleAdsConversionId}/${googleAdsCallConversionLabel}`,
      });
    }

    if (metaPixelId && typeof window.fbq === "function") {
      window.fbq("track", "Contact");
    }
  }

  return (
    <a href={`tel:${siteConfig.phoneE164}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
