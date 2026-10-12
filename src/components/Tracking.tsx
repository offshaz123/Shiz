"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { tracking } from "@/lib/site";
import { CONSENT_COOKIE, readConsent, saveConsent } from "@/lib/track";

const googleIds = [tracking.googleAnalyticsId, tracking.googleAdsId].filter(Boolean);
const anyTags = Boolean(tracking.metaPixelId || googleIds.length);

// Opens the cookie banner again (the "Cookie settings" link in the footer).
export const OPEN_COOKIE_SETTINGS = "pu-cookie-settings";

// Asks for cookie consent (UK law), then loads the Meta Pixel and Google tag.
// Nothing is loaded, and no advert cookies are set, until "Accept" is pressed.
export function Tracking() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"yes" | "no" | null | "unknown">("unknown");
  const [open, setOpen] = useState(false);
  const firstPage = useRef(true);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_COOKIE, sync);
    window.addEventListener(OPEN_COOKIE_SETTINGS, reopen);
    return () => {
      window.removeEventListener(CONSENT_COOKIE, sync);
      window.removeEventListener(OPEN_COOKIE_SETTINGS, reopen);
    };
  }, []);

  // Meta counts the first page itself; count each page moved to after that.
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "PageView");
  }, [pathname]);

  if (!anyTags || admin || consent === "unknown") return null;

  const choose = (choice: "yes" | "no") => {
    const was = consent;
    saveConsent(choice);
    setOpen(false);
    // Tags already running can't be unloaded; a fresh page stops them.
    if (was === "yes" && choice === "no") window.location.reload();
  };

  return (
    <>
      {consent === "yes" && tracking.metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(tracking.metaPixelId)});fbq('track','PageView');`}
        </Script>
      )}
      {consent === "yes" && googleIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleIds[0]}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('js',new Date());${googleIds.map((id) => `gtag('config',${JSON.stringify(id)});`).join("")}`}
          </Script>
        </>
      )}

      {(consent === null || open) && (
        <div
          role="dialog"
          aria-label="Cookie choices"
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-2xl border border-line bg-white p-4 shadow-2xl sm:p-5"
        >
          <p className="text-sm leading-relaxed">
            We&apos;d like to use cookies to see how people find us and to measure our adverts on Meta and Google. Essential cookies
            (your basket and login) are always on.{" "}
            <Link href="/privacy-policy#cookies" className="font-semibold underline">
              More about cookies
            </Link>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="btn btn-white" onClick={() => choose("no")}>
              Reject
            </button>
            <button type="button" className="btn btn-gold" onClick={() => choose("yes")}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function CookieSettingsLink({ className }: { className?: string }) {
  if (!anyTags) return null;
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}>
      Cookie settings
    </button>
  );
}
