"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Tells the server which page is being looked at.
 *
 * Sends nothing identifying — see the note in /api/track. It fires on first
 * load and on every client-side navigation, and it never blocks rendering or
 * reports a failure: a missed view is worth nothing, and a visitor should
 * never see a problem because a counter didn't increment.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    // React runs effects twice in development, and a client-side navigation
    // can re-render this; neither should count as a second visit.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
