import Script from "next/script";
import { trackingConfig } from "@/lib/site-config";

// Loads the Google tag (gtag.js) sitewide when either a GA4 measurement ID or
// a Google Ads conversion ID is configured. Renders nothing until then.
export function GoogleTag() {
  const { ga4MeasurementId, googleAdsConversionId } = trackingConfig;
  const id = ga4MeasurementId || googleAdsConversionId;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-tag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${ga4MeasurementId ? `gtag('config', '${ga4MeasurementId}');` : ""}
          ${googleAdsConversionId ? `gtag('config', '${googleAdsConversionId}');` : ""}
        `}
      </Script>
    </>
  );
}
