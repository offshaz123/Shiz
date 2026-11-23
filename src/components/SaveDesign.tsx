"use client";

import { useState } from "react";
import { type PlateConfig, defaultConfig, plateText } from "@/lib/plates";
import { site } from "@/lib/site";

// A link that opens the builder on exactly this plate (read by DesignFromLink).
// Only what differs from a new plate goes in it, so it stays short.
export function designLink(c: PlateConfig) {
  const q = new URLSearchParams();
  const text = plateText(c);
  if (text) q.set("reg", text);
  if (c.type === "show") q.set("type", "show");
  for (const k of ["style", "size", "which", "material", "badge", "border", "fixing"] as const)
    if (c[k] !== defaultConfig[k]) q.set(k, c[k]);
  return `${site.url}/design${q.size ? `?${q}` : ""}`;
}

// "Save my design": people often leave to ask someone or compare before
// buying. This lets them keep the plate they made (WhatsApp, Messages, email,
// or the link copied) and come straight back to it, without starting again.
export function SaveDesign({ config }: { config: PlateConfig }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const url = designLink(config);
  const text = `My ${config.type === "show" ? "show plate" : "number plates"} design from PlatedUp${plateText(config) ? ` (${plateText(config)})` : ""}`;

  const save = async () => {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: "My PlatedUp plate", text, url });
        return;
      } catch (err) {
        // Closing the share sheet isn't an error worth showing.
        if ((err as Error)?.name === "AbortError") return;
      }
    }
    setOpen((v) => !v);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <div className="mt-3">
      <button type="button" onClick={save} className="btn btn-white w-full rounded-lg text-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        Save or send my design
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
          <a className="btn btn-white rounded-lg px-2" href={`https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a className="btn btn-white rounded-lg px-2" href={`mailto:?subject=${encodeURIComponent("My PlatedUp plate design")}&body=${encodeURIComponent(`${text}:\n${url}`)}`}>
            Email
          </a>
          <button type="button" className="btn btn-white rounded-lg px-2" onClick={copy}>
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
