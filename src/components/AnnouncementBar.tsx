"use client";

import { useState } from "react";
import { announcement } from "@/lib/site";
import { FREE_DELIVERY_FROM, money } from "@/lib/plates";

// Slim offer bar above the header: free delivery, and the discount code with
// a button to copy it. One line on phones, so it doesn't push the page down.
export function AnnouncementBar() {
  const [copied, setCopied] = useState(false);
  const delivery = (
    <span className="font-bold">
      🚚 FREE <span className="hidden sm:inline">tracked </span>delivery from {money(FREE_DELIVERY_FROM)}
    </span>
  );
  if (!announcement)
    return <div className="gold-deep px-3 py-1.5 text-center text-xs sm:py-2 sm:text-sm">{delivery}</div>;
  const { text, code } = announcement;
  // "10% OFF your first order" → "10% OFF" on phones.
  const short = text.match(/^\S+\s+OFF/i)?.[0] ?? text;
  return (
    <div className="gold-deep whitespace-nowrap px-3 py-1.5 text-center text-xs sm:whitespace-normal sm:py-2 sm:text-sm">
      {delivery}
      <span className="mx-1.5 opacity-70 sm:mx-2">·</span>
      <span className="font-semibold">
        <span className="sm:hidden">{short}:</span>
        <span className="hidden sm:inline">{text} · use code</span>
      </span>{" "}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-md border border-dashed border-white/70 px-1.5 py-0.5 font-bold tracking-wider hover:bg-white/15 sm:px-2"
        aria-label={`Copy discount code ${code}`}
      >
        {copied ? "Copied ✓" : code}
      </button>
      <span className="hidden sm:inline"> at checkout</span>
    </div>
  );
}
