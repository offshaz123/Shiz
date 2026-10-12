"use client";

import { useState } from "react";
import { announcement } from "@/lib/site";

// Slim offer bar above the header, with a button to copy the code.
export function AnnouncementBar() {
  const [copied, setCopied] = useState(false);
  if (!announcement) return null;
  const { text, code } = announcement;
  return (
    <div className="gold-deep px-4 py-2 text-center text-sm">
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
