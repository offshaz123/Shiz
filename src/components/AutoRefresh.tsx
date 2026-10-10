"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Reloads the page's data every few seconds, for a while, so a customer sees
// "Payment received" as soon as Stripe confirms it without pressing refresh.
export function AutoRefresh({ seconds = 3, times = 20 }: { seconds?: number; times?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      if (++n > times) clearInterval(id);
      else router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds, times]);
  return null;
}
