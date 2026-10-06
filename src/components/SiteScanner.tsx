"use client";

import { useState } from "react";
import Link from "next/link";
import type { AuditResult, Severity } from "@/lib/site-audit";

const ERRORS: Record<string, string> = {
  invalid_url: "That doesn't look like a web address. Try something like yourbusiness.co.uk",
  unreachable: "We couldn't load that site. Check the address and try again.",
  not_html: "That address didn't return a web page.",
  dns_failed: "We couldn't find that domain. Check the spelling.",
  blocked_address: "That address can't be scanned.",
  unsupported_port: "That address can't be scanned.",
  unsupported_protocol: "That address can't be scanned.",
  too_many_redirects: "That site redirected too many times for us to follow.",
};

const TONE: Record<Severity, { ring: string; dot: string; label: string }> = {
  critical: { ring: "border-red-500/40", dot: "bg-red-500", label: "Needs fixing" },
  warning: { ring: "border-amber-500/40", dot: "bg-amber-500", label: "Worth a look" },
  good: { ring: "border-emerald-500/30", dot: "bg-emerald-500", label: "Fine" },
};

function Gauge({ score }: { score: number }) {
  const tone = score >= 80 ? "text-emerald-500" : score >= 55 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-5xl font-bold tracking-tight ${tone}`}>{score}</span>
      <span className="text-lg text-muted">/ 100</span>
    </div>
  );
}

export function SiteScanner() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AuditResult | null>(null);

  async function scan(event: React.FormEvent) {
    event.preventDefault();
    if (state === "scanning" || !url.trim()) return;
    setState("scanning");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data?.error] ?? "Something went wrong. Try again in a minute.");
        setState("error");
        return;
      }
      setResult(data as AuditResult);
      setState("done");
    } catch {
      setError("Something went wrong. Try again in a minute.");
      setState("error");
    }
  }

  const ordered = result
    ? [...result.checks].sort((a, b) => {
        const rank = { critical: 0, warning: 1, good: 2 };
        return rank[a.severity] - rank[b.severity];
      })
    : [];

  return (
    <div>
      <form onSubmit={scan} className="flex flex-col gap-3 sm:flex-row">
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
          disabled={state === "scanning"}
          className="brand-gradient-bg shrink-0 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {state === "scanning" ? "Scanning…" : "Scan My Site"}
        </button>
      </form>

      <p className="mt-2.5 text-xs text-muted">
        Free, instant, and we don&apos;t ask for your email to show you the results.
      </p>

      {state === "error" && (
        <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      {state === "scanning" && (
        <p className="mt-5 text-sm text-muted">
          Loading the page and checking it the way Google and Meta would. Takes a few seconds.
        </p>
      )}

      {result && (
        <div className="mt-8">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Result for</p>
                <p className="font-semibold text-foreground">
                  {result.finalUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </p>
              </div>
              <Gauge score={result.score} />
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="text-muted">
                <strong className="text-foreground">{result.counts.critical}</strong> need fixing
              </span>
              <span className="text-muted">
                <strong className="text-foreground">{result.counts.warning}</strong> worth a look
              </span>
              <span className="text-muted">
                <strong className="text-foreground">{result.counts.good}</strong> fine
              </span>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {ordered.map((check) => (
              <li
                key={check.id}
                className={`rounded-2xl border bg-background p-5 ${TONE[check.severity].ring}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE[check.severity].dot}`}
                  />
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-semibold text-foreground">{check.label}</h3>
                      <span className="text-xs font-medium uppercase tracking-wide text-muted">
                        {TONE[check.severity].label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{check.detail}</p>
                    {check.why && (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{check.why}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-brand-pink/35 bg-background p-6">
            <h3 className="font-semibold text-foreground">
              Want these fixed, or the parts a scanner can&apos;t see?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              This checks what&apos;s in your page code. It can&apos;t tell you whether your
              Google listing is set up properly, where your enquiries go once they arrive, or what
              your competitors are running. That part we do by hand, and it&apos;s also free.
            </p>
            <Link
              href="/contact"
              className="brand-gradient-bg mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
            >
              Get the full audit
            </Link>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted">
            One caveat worth knowing: we read your page the way a browser first loads it. A tag
            that only fires after a cookie banner is accepted won&apos;t show up here, so if
            something says missing and you believe it&apos;s installed, it&apos;s worth checking
            rather than assuming either of us is right.
          </p>
        </div>
      )}
    </div>
  );
}
