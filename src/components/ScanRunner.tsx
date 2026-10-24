"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AuditResult, Severity } from "@/lib/site-audit";
import { ScanProgress } from "./ScanProgress";
import { ScanBrowserFrame } from "./ScanBrowserFrame";
import { ScanLeadForm, type ScanLead } from "./ScanLeadForm";
import { ScanSupportButton } from "./ScanSupportButton";

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

/** The scan returns far quicker than anyone can read what it's doing. */
const MIN_RUN_MS = 17_000;

function StatusIcon({ severity }: { severity: Severity }) {
  if (severity === "good") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (severity === "warning") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500">
        <span className="text-[11px] font-bold leading-none text-white">!</span>
      </span>
    );
  }
  if (severity === "critical") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500">
        <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/30">
      <span className="text-[11px] font-bold leading-none text-muted">···</span>
    </span>
  );
}

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, score / 10));
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const colour = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
        {score.toFixed(1)}
      </span>
    </span>
  );
}

export function ScanRunner() {
  const params = useSearchParams();
  /** Prefilled from the homepage box; the form is still the gate. */
  const initialUrl = params.get("url") ?? "";
  const [lead, setLead] = useState<ScanLead | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [settled, setSettled] = useState(false);
  /** How many of the browser frame's five slots have been revealed. */
  const [revealed, setRevealed] = useState(0);

  const target = lead?.website ?? "";

  // Reveal one slot per fifth of the loading sequence. The scan itself usually
  // answers long before this finishes, so what gets revealed is the real
  // result rather than a guess dressed up as one.
  useEffect(() => {
    if (!target) return;
    const step = MIN_RUN_MS / 5;
    const timers = [1, 2, 3, 4, 5].map((n) =>
      setTimeout(() => setRevealed(n), step * n),
    );
    return () => timers.forEach(clearTimeout);
  }, [target]);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    const startedAt = Date.now();

    (async () => {
      let payload: AuditResult | null = null;
      let message = "";
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const data = await res.json();
        if (res.ok) payload = data as AuditResult;
        else message = ERRORS[data?.error] ?? "Something went wrong. Try again in a minute.";
      } catch {
        message = "Something went wrong. Try again in a minute.";
      }

      const wait = Math.max(0, MIN_RUN_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (cancelled) return;
        if (payload) setResult(payload);
        else setError(message);
        setSettled(true);
      }, wait);
    })();

    return () => {
      cancelled = true;
    };
  }, [target]);

  const domain = (result?.finalUrl ?? target).replace(/^https?:\/\//, "").replace(/\/$/, "");

  // The gate. Nothing runs until we have the details.
  if (!lead) {
    return (
      <ScanLeadForm
        initialUrl={initialUrl}
        onStart={(captured) => {
          setLead(captured);
          // Record it, but never block the scan on it — if this fails the
          // visitor still gets what they came for.
          void fetch("/api/scan-lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(captured),
          }).catch(() => {});
        }}
      />
    );
  }

  if (settled && (error || !result)) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">We couldn&apos;t scan that</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{error || ERRORS.invalid_url}</p>
        <Link
          href="/free-audit"
          className="brand-gradient-bg mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          Try another address
        </Link>
      </div>
    );
  }

  if (!settled || !result) {
    return (
      <div>
        <p className="text-sm text-muted">Scan in progress</p>
        <h1 className="mt-1 break-all text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {domain}
        </h1>
        <p className="mt-2 text-sm text-muted">Takes about twenty seconds.</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-14">
          <ScanProgress done={false} />
          <div className="lg:sticky lg:top-28">
            <ScanBrowserFrame
              url={domain}
              categories={result?.categories}
              revealed={revealed}
            />
            <p className="mt-3 text-center text-xs text-muted">
              Checking five areas of your site.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tone =
    result.score >= 7 ? "text-emerald-500" : result.score >= 4 ? "text-amber-500" : "text-red-500";

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-sm text-muted">Your report</p>
          <h1 className="mt-1 break-all text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {domain}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {result.pagesFound}+ pages found · checked just now
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-surface px-7 py-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Overall</p>
          <p className={`mt-1 text-5xl font-bold tracking-tight ${tone}`}>
            {result.score.toFixed(1)}
          </p>
          <p className="text-sm text-muted">out of 10</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_21rem] lg:items-start">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {result.categories.map((cat) => (
            <section key={cat.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <header className="flex items-center justify-between gap-4 border-b border-border bg-background px-5 py-4">
                <h2 className="font-semibold text-foreground">{cat.name}</h2>
                {cat.score >= 0 && <ScoreRing score={cat.score} />}
              </header>
              <ul className="divide-y divide-border">
                {cat.checks.map((check) => (
                  <li key={check.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <StatusIcon severity={check.severity} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <span className="font-medium text-foreground">{check.label}</span>
                          <span className="text-sm text-muted">{check.value}</span>
                        </div>
                        {check.why && (
                          <p className="mt-1.5 text-sm leading-relaxed text-muted">{check.why}</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <ScanSupportButton domain={domain} score={result.score} />
          <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-xs leading-relaxed text-muted">
            We read your page the way a browser first loads it. A tag that only fires after a
            cookie banner is accepted won&apos;t show up here, so if something says missing and
            you believe it&apos;s installed, it&apos;s worth checking rather than assuming either
            of us is right.
          </p>
        </aside>
      </div>
    </div>
  );
}
