"use client";

import { useState } from "react";

// A block of text with a Copy button (e.g. the Google Ads script on Admin → Money).
export function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="btn btn-gold"
        onClick={() =>
          navigator.clipboard
            .writeText(text)
            .then(() => setCopied(true))
            .catch(() => setCopied(false))
        }
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
      <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-surface p-3 text-xs">{text}</pre>
    </div>
  );
}
