"use client";

import { useState } from "react";
import { announcement } from "@/lib/site";
import { FREE_DELIVERY_FROM, money } from "@/lib/plates";

// Slim offer bar above the header: free delivery, and the discount code with
// a button to copy it.
export function AnnouncementBar() {
  const [copied, setCopied] = useState(false);
  const delivery = <span className="font-bold">🚚 FREE tracked delivery from {money(FREE_DELIVERY_FROM)}</span>;
  if (!announcement)
    return <div className="gold-deep px-4 py-2 text-center text-sm">{delivery}</div>;
  const { text, code } = announcement;
  return (
    <div className="gold-deep px-4 py-2 text-center text-sm">
      <span className="block sm:inline">{delivery}</span>
      <span className="mx-2 hidden opacity-70 sm:inline">|</span>
      <span className="font-semibold">{text}</span>
      <span className="mx-1.5 opacity-70">·</span>
      use code{" "}
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(code).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-md border border-dashed border-white/70 px-2 py-0.5 font-bold tracking-wider hover:bg-white/15"
        aria-label={`Copy discount code ${code}`}
      >
        {copied ? "Copied ✓" : code}
      </button>{" "}
      at checkout
    </div>
  );
}
