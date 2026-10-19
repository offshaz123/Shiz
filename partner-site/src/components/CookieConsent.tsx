"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/**
 * The cookie banner, and the thing it actually controls.
 *
 * Analytics load only after someone accepts, and not before — that is the
 * requirement under PECR, and a banner that loads the tag first and asks
 * afterwards is worse than no banner at all.
 *
 * Two rules the ICO is explicit about and that are easy to get wrong:
 *
 *  - Reject must be exactly as easy as accept. Both are buttons, same size,
 *    same row. No "manage preferences" maze standing in for a no.
 *  - No cookie wall. The site works identically whichever you choose, and
 *    dismissing without choosing sets nothing.
 *
 * The choice itself lives in localStorage rather than a cookie. Storing a
 * record of what someone consented to is strictly necessary for providing the
 * service they asked for, so it needs no consent of its own.
 */
const STORAGE_KEY = "ovaropay.cookie-consent";
const EVENT = "ovaropay:cookie-settings";

/** Set at build time. With no ID configured, nothing is ever loaded. */
const ANALYTICS_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type Choice = "accepted" | "rejected" | null;

function read(): Choice {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    // Private browsing, or storage blocked. Treat it as no choice made.
    return null;
  }
}

function loadAnalytics() {
  if (!ANALYTICS_ID) return;
  if (document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ANALYTICS_ID}',{anonymize_ip:true});`;
  document.head.appendChild(inline);
}

/** Lets the footer's "Cookie settings" link reopen the banner. */
export function openCookieSettings() {
  window.dispatchEvent(new Event(EVENT));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = read();
    if (choice === "accepted") loadAnalytics();

    // Deferred to after the first paint: the banner is fixed to the bottom of
    // the viewport, and showing it during hydration makes the page shift under
    // whatever the reader has already started reading.
    const frame =
      choice === null ? window.requestAnimationFrame(() => setOpen(true)) : null;

    const reopen = () => setOpen(true);
    window.addEventListener(EVENT, reopen);

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener(EVENT, reopen);
    };
  }, []);

  const decide = useCallback((choice: Exclude<Choice, null>) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Nothing to do — the choice holds for this page view either way.
    }
    if (choice === "accepted") loadAnalytics();
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-5"
    >
      <div className="glass mx-auto max-w-3xl rounded-2xl p-5 sm:p-6">
        <p className="text-sm font-semibold">Cookies on this site</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          We use cookies that are needed to make the site work, and — only if you say yes —
          analytics cookies that tell us which pages people read. We do not use advertising
          cookies and we do not track you across other sites. You can change your mind at any
          time from the footer.{" "}
          <Link href="/cookies" className="font-semibold text-accent-2 underline-offset-4 hover:underline">
            Cookie policy
          </Link>
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => decide("accepted")} className="btn btn-primary flex-1">
            Accept analytics cookies
          </button>
          <button type="button" onClick={() => decide("rejected")} className="btn btn-ghost flex-1">
            Reject analytics cookies
          </button>
        </div>
      </div>
    </div>
  );
}
