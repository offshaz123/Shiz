"use client";

import { openCookieSettings } from "@/components/CookieConsent";

/** Reopens the cookie banner so a choice can be changed. */
export function CookieSettingsLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  );
}
