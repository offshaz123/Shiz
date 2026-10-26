"use client";

import Script from "next/script";
import { siteConfig } from "@/lib/site-config";
import { useAnalyticsAllowed } from "./CookieConsent";

/**
 * Google Analytics 4, behind the consent banner.
 *
 * Dormant until a measurement ID is set in site-config, so this is safe to
 * ship before the property exists. It renders nothing at all until somebody
 * has actively accepted — no script, no request to Google.
 */
export function GoogleAnalytics() {
  const allowed = useAnalyticsAllowed();
  const id = siteConfig.googleAnalyticsId;

  if (!allowed || !id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
