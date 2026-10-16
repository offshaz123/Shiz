"use client";

import { useEffect } from "react";

// Tells us someone opened their "complete your order" page (shown on
// Insights). Sent from the browser so email link scanners don't count.
export function CameBack({ orderRef, token }: { orderRef: string; token: string }) {
  useEffect(() => {
    const body = new FormData();
    body.set("ref", orderRef);
    body.set("t", token);
    body.set("seen", "1");
    fetch("/api/order/resume", { method: "POST", body }).catch(() => {});
  }, [orderRef, token]);
  return null;
}
