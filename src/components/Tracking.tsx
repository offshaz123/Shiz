"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { tracking } from "@/lib/site";
import { CONSENT_COOKIE, readConsent, saveConsent, saveSource, saveTikTokClick, visitSource } from "@/lib/track";

const googleIds = [tracking.googleAnalyticsId, tracking.googleAdsId].filter(Boolean);
const anyTags = Boolean(tracking.tiktokPixelId || tracking.clarityId || googleIds.length);
const GRANTED = { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" };
const DENIED = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };

// Opens the cookie banner again (the "Cookie settings" link in the footer).
export const OPEN_COOKIE_SETTINGS = "pu-cookie-settings";

// Asks for cookie consent (UK law). The Google tag loads straight away in
// Google's consent mode: until "Accept" is pressed it sets no cookies and only
// sends Google cookie-free signals (so Google Ads can see the tag and estimate
// sales). The TikTok Pixel and Microsoft Clarity load only after "Accept".
export function Tracking() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<"yes" | "no" | null | "unknown">("unknown");
  const [open, setOpen] = useState(false);
  const firstPage = useRef(true);
  const admin = pathname.startsWith("/admin");

  // Count the visit by where it came from (Admin → Insights). Only a number
  // per day and source: nothing about the visitor, and nothing saved on their device.
  useEffect(() => {
    const source = visitSource();
    if (source && !window.location.pathname.startsWith("/admin"))
      fetch("/api/visit", { method: "POST", body: source, keepalive: true }).catch(() => {});
  }, []);

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

  // TikTok counts the first page itself; count each page moved to after that.
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    (window as unknown as { ttq?: { page: () => void } }).ttq?.page();
  }, [pathname]);

  // A visitor from a TikTok ad arrives with ?ttclid=…; once they've accepted
  // cookies, keep it so the paid order can be matched to the ad, and note
  // where they came from for their order.
  useEffect(() => {
    if (consent === "yes") {
      saveTikTokClick();
      saveSource();
    }
  }, [consent, pathname]);

  if (!anyTags || admin || consent === "unknown") return null;

  const choose = (choice: "yes" | "no") => {
    const was = consent;
    saveConsent(choice);
    setOpen(false);
    if (choice === "yes") {
      (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", GRANTED);
      saveTikTokClick();
      saveSource();
    }
    // Tags already running can't be unloaded; a fresh page stops them.
    if (was === "yes" && choice === "no") window.location.reload();
  };

  return (
    <>
      {consent === "yes" && tracking.tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load(${JSON.stringify(tracking.tiktokPixelId)});ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
      {consent === "yes" && tracking.clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(tracking.clarityId)});`}
        </Script>
      )}
      {googleIds.length > 0 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleIds[0]}`} strategy="afterInteractive" />
          <Script id="google-tag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',${JSON.stringify(consent === "yes" ? GRANTED : DENIED)});gtag('set','ads_data_redaction',${consent !== "yes"});gtag('js',new Date());${googleIds.map((id) => `gtag('config',${JSON.stringify(id)});`).join("")}`}
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
            We&apos;d like to use cookies to see how people find and use our site, and to measure our adverts on Google and TikTok. Essential cookies
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
