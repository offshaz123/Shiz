"use client";

import { useEffect } from "react";

/**
 * Opens the print dialog once the page has settled.
 *
 * A frame is waited for because printing the instant React mounts can
 * catch the page before the fonts and the logo have landed, and a PDF
 * with the logo missing is worse than one that took half a second
 * longer.
 *
 * Only once. Coming back to this page with the browser's Back button
 * should not fire the dialog at somebody who has finished with it.
 */
export function PrintOnLoad() {
  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (!cancelled) window.print();
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  return null;
}
