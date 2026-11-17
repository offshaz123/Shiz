"use client";

import { useEffect, useSyncExternalStore } from "react";

// Visit recordings (Microsoft Clarity) must never see the admin. Clarity is
// only loaded on shop pages, but once loaded it keeps recording when the
// owner moves on to /admin without a full page load (e.g. after logging in).
// Then the admin shows nothing at all, Clarity is told to stop, and the page
// loads afresh: the shop's tags aren't loaded on admin pages, so it comes
// back without Clarity.
const clarityRunning = () => typeof (window as unknown as { clarity?: unknown }).clarity === "function";
const noop = () => () => {};

export function AdminBlank({ children }: { children: React.ReactNode }) {
  const recording = useSyncExternalStore(noop, clarityRunning, () => false);

  useEffect(() => {
    if (!recording) return;
    try {
      (window as unknown as { clarity: (cmd: string) => void }).clarity("stop");
    } catch {}
    window.location.reload();
  }, [recording]);

  if (recording) return null;
  return <div data-clarity-mask="true">{children}</div>;
}
