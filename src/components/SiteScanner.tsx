"use client";

import { useState } from "react";

/**
 * Takes an address and opens the full report in a new tab, so whoever is
 * scanning keeps the page they were reading. The scan itself runs on /scan.
 */
export function SiteScanner() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function start(event: React.FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    if (!/\./.test(value)) {
      setError("That doesn't look like a web address. Try something like yourbusiness.co.uk");
      return;
    }
    setError("");
    window.open(`/scan?url=${encodeURIComponent(value)}`, "_blank", "noopener");
  }

  return (
    <div>
      <form onSubmit={start} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="scan-url" className="sr-only">
          Your website address
        </label>
        <input
          id="scan-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourbusiness.co.uk"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-5 py-3.5 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none"
        />
        <button
          type="submit"
          className="brand-gradient-bg shrink-0 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02]"
        >
          Scan My Site
        </button>
      </form>

      <p className="mt-2.5 text-xs text-muted">
        Free, takes a few seconds, and we don&apos;t ask for your email to show you the results.
      </p>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
