"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { AuditResult, Severity } from "@/lib/site-audit";
import { ScanProgress } from "./ScanProgress";
import { ScanSupportButton } from "./ScanSupportButton";
import { LeadForm } from "./LeadForm";

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

const RANK = { critical: 0, warning: 1, good: 2 } as const;

/** Minimum time the progress runs for, so it reads as a scan rather than a flash. */
const MIN_RUN_MS = 6500;

export function ScanRunner() {
  const params = useSearchParams();
  const target = params.get("url") ?? "";
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState("");
  const [settled, setSettled] = useState(false);

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

  const domain = (result?.finalUrl ?? target)
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // No address in the link at all: knowable without running anything.
  if (!target) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">We couldn&apos;t scan that</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{ERRORS.invalid_url}</p>
        <Link
          href="/free-audit"
          className="brand-gradient-bg mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          Try another address
        </Link>
      </div>
    );
  }

  if (!settled) {
    return (
      <div>
        <p className="text-sm text-muted">Scanning</p>
        <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {domain}
        </h1>
        <div className="mt-8">
          <ScanProgress done={false} />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="rounded-3xl border border-border bg-surface p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">We couldn&apos;t scan that</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{error}</p>
        <Link
          href="/free-audit"
          className="brand-gradient-bg mt-7 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
        >
          Try another address
        </Link>
      </div>
    );
  }

  const ordered = [...result.checks].sort((a, b) => RANK[a.severity] - RANK[b.severity]);
  const tone =
    result.score >= 80 ? "text-emerald-500" : result.score >= 55 ? "text-amber-500" : "text-red-500";

  return (
    <div>
      <p className="text-sm text-muted">Report for</p>
      <h1 className="mt-1 break-all text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {domain}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <div className="rounded-3xl border border-border bg-surface p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Overall score</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-5xl font-bold tracking-tight ${tone}`}>
                    {result.score}
                  </span>
                  <span className="text-lg text-muted">/ 100</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
          </div>

          <ul className="mt-5 space-y-3">
            {ordered.map((check) => (
              <li
                key={check.id}
                className={`rounded-2xl border bg-surface p-5 ${TONE[check.severity].ring}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TONE[check.severity].dot}`}
                  />
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2 className="font-semibold text-foreground">{check.label}</h2>
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

          <p className="mt-5 text-xs leading-relaxed text-muted">
            We read your page the way a browser first loads it. A tag that only fires after a
            cookie banner is accepted won&apos;t show up here, so if something says missing and
            you believe it&apos;s installed, it&apos;s worth checking rather than assuming either
            of us is right.
          </p>
        </div>

        <aside className="lg:sticky lg:top-24">
          <ScanSupportButton domain={domain} score={result.score} />
        </aside>
      </div>

      <section className="mt-16 rounded-3xl border border-brand-pink/35 bg-surface p-7 sm:p-9">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Want the parts a scanner can&apos;t see?
          </h2>
          <p className="mt-3 leading-relaxed text-muted">
            This checked your page code. It can&apos;t tell you whether your Google listing is set
            up properly, where your enquiries go once they arrive, or what your competitors are
            already running. We go through that by hand and it&apos;s also free.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <LeadForm compact askWebsite source={`Website scan: ${domain}`} submitLabel="Get My Full Audit" />
        </div>
      </section>
    </div>
  );
}
