"use client";

import { useState } from "react";
import { projectedScore, type AuditResult, type AuditCheck } from "@/lib/site-audit";

/**
 * The scanner, as a thing to show someone across a desk.
 *
 * Separate from the main admin page on purpose: this gets turned towards a
 * customer, and the leads list, their phone numbers and our own traffic
 * figures have no business being on that screen.
 *
 * Two sites can be scanned side by side, which is the version that actually
 * persuades — a prospect's own site next to one that scores well says more
 * than any explanation of what the numbers mean.
 *
 * The projection ticks a check and shows what the score would become. It
 * projects a SCORE and nothing else. No lead counts, no revenue, no "this
 * would get you X more calls", because none of that is knowable from a page
 * scan and inventing it in front of a customer is the fastest way to deserve
 * not being believed.
 */

const ERRORS: Record<string, string> = {
  invalid_url: "That doesn't look like a web address.",
  unreachable: "Couldn't load that site.",
  not_html: "That address didn't return a web page.",
  dns_failed: "Couldn't find that domain.",
  blocked_address: "That address can't be scanned.",
  too_many_redirects: "That site redirected too many times.",
};

type Slot = { url: string; result: AuditResult | null; error: string; loading: boolean };

const EMPTY: Slot = { url: "", result: null, error: "", loading: false };

function tone(score: number): string {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
}

function Dot({ severity }: { severity: string }) {
  const colour =
    severity === "good"
      ? "bg-emerald-500"
      : severity === "warning"
        ? "bg-amber-500"
        : severity === "critical"
          ? "bg-red-500"
          : "bg-muted/40";
  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${colour}`} />;
}

function host(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function AdminScanner() {
  const [a, setA] = useState<Slot>(EMPTY);
  const [b, setB] = useState<Slot>(EMPTY);
  const [comparing, setComparing] = useState(false);
  /** Checks the customer has agreed we'd fix, for the projected score. */
  const [fixed, setFixed] = useState<Set<string>>(new Set());

  async function scan(slot: Slot, set: (s: Slot) => void) {
    if (!slot.url.trim()) return;
    set({ ...slot, loading: true, error: "", result: null });
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: slot.url.trim() }),
      });
      const data = await res.json();
      if (res.ok) set({ ...slot, loading: false, error: "", result: data as AuditResult });
      else set({ ...slot, loading: false, result: null, error: ERRORS[data?.error] ?? "Something went wrong." });
    } catch {
      set({ ...slot, loading: false, result: null, error: "Something went wrong." });
    }
  }

  function runAll() {
    setFixed(new Set());
    void scan(a, setA);
    if (comparing) void scan(b, setB);
  }

  function toggleFix(id: string) {
    setFixed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="scan-a" className="mb-1.5 block text-sm text-muted">
            Website to scan
          </label>
          <input
            id="scan-a"
            value={a.url}
            onChange={(e) => setA({ ...a, url: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && runAll()}
            placeholder="theirbusiness.co.uk"
            className={field}
          />
        </div>

        {comparing && (
          <div className="flex-1">
            <label htmlFor="scan-b" className="mb-1.5 block text-sm text-muted">
              Compare with
            </label>
            <input
              id="scan-b"
              value={b.url}
              onChange={(e) => setB({ ...b, url: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && runAll()}
              placeholder="acompetitor.co.uk"
              className={field}
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={runAll}
            disabled={a.loading || b.loading}
            className="brand-gradient-bg rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {a.loading || b.loading ? "Scanning…" : "Scan"}
          </button>
          <button
            type="button"
            onClick={() => {
              setComparing((v) => !v);
              if (comparing) setB(EMPTY);
            }}
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted hover:text-foreground"
          >
            {comparing ? "Just one" : "Compare"}
          </button>
        </div>
      </div>

      {(a.error || b.error) && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
          {a.error || b.error}
        </p>
      )}

      {a.result && (
        <div className={`mt-10 grid gap-8 ${b.result ? "lg:grid-cols-2" : ""}`}>
          <Report
            result={a.result}
            other={b.result}
            fixed={fixed}
            onToggleFix={toggleFix}
            projectable
          />
          {b.result && <Report result={b.result} other={a.result} fixed={fixed} />}
        </div>
      )}
    </div>
  );
}

function Report({
  result,
  other,
  fixed,
  onToggleFix,
  projectable = false,
}: {
  result: AuditResult;
  other: AuditResult | null;
  fixed: Set<string>;
  onToggleFix?: (id: string) => void;
  projectable?: boolean;
}) {
  const projected = projectable ? projectedScore(result.categories, fixed) : result.score;
  const lifted = projectable && fixed.size > 0 && projected !== result.score;

  const problems: AuditCheck[] = result.categories
    .flatMap((c) => c.checks)
    .filter((c) => c.severity === "critical" || c.severity === "warning");

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-all font-semibold text-foreground">{host(result.finalUrl)}</h2>
          <p className="mt-1 text-xs text-muted">
            {result.pagesFound}+ pages · {result.words.toLocaleString()} words on this page
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className={`text-4xl font-bold ${tone(result.score)}`}>
            {result.score.toFixed(1)}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-muted">website</div>
          {lifted && (
            <div className="mt-1 text-sm font-semibold text-emerald-500">
              → {projected.toFixed(1)} if fixed
            </div>
          )}
          {result.googleScore !== undefined && (
            <div className="mt-2 border-t border-border pt-2">
              <span className={`text-xl font-bold ${tone(result.googleScore)}`}>
                {result.googleScore.toFixed(1)}
              </span>
              <div className="text-[11px] uppercase tracking-wide text-muted">google</div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span>
          <strong className="text-foreground">{result.counts.critical}</strong> need fixing
        </span>
        <span>
          <strong className="text-foreground">{result.counts.warning}</strong> worth a look
        </span>
        <span>
          <strong className="text-foreground">{result.counts.good}</strong> fine
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {result.categories
          .filter((c) => c.score >= 0)
          .map((cat) => {
            const rival = other?.categories.find((c) => c.id === cat.id);
            const wins = rival && rival.score >= 0 ? cat.score > rival.score : false;
            const loses = rival && rival.score >= 0 ? cat.score < rival.score : false;
            return (
              <div key={cat.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted">{cat.name}</span>
                <span className="flex items-center gap-2">
                  {wins && <span className="text-[11px] font-semibold text-emerald-500">ahead</span>}
                  {loses && <span className="text-[11px] font-semibold text-red-500">behind</span>}
                  <strong className={tone(cat.score)}>{cat.score.toFixed(1)}</strong>
                </span>
              </div>
            );
          })}
      </div>

      {result.googleBusiness && <GoogleListing business={result.googleBusiness} />}

      {problems.length > 0 && (
        <div className="mt-7 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">
            What&apos;s wrong, and what it costs them
          </h3>
          {onToggleFix && (
            <p className="mt-1 text-xs text-muted">
              Tick what we&apos;d fix to show the score it would reach.
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-3">
            {problems.map((check) => (
              <li key={check.id} className="flex items-start gap-3">
                {onToggleFix ? (
                  <input
                    type="checkbox"
                    checked={fixed.has(check.id)}
                    onChange={() => onToggleFix(check.id)}
                    aria-label={`Fix ${check.label}`}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand-pink)]"
                  />
                ) : (
                  <Dot severity={check.severity} />
                )}
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground">{check.label}</span>
                  <span className="text-sm text-muted"> — {check.value}</span>
                  {check.why && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{check.why}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * The Google listing we matched to the scanned domain.
 *
 * This block exists for one practical reason: when the scanner is being used
 * to work out who to ring, the phone number and the listing itself are the
 * two things needed next, and reading them out of a list of pass-or-fail rows
 * is slower than it needs to be.
 */
function GoogleListing({
  business,
}: {
  business: NonNullable<AuditResult["googleBusiness"]>;
}) {
  const stars =
    business.rating === null ? "No rating yet" : `${business.rating.toFixed(1)} out of 5`;

  return (
    <div className="mt-7 rounded-xl border border-border bg-background p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-sm font-semibold text-foreground">Their Google listing</h3>
        <span className="text-xs text-muted">
          {business.reviews === 1 ? "1 review" : `${business.reviews} reviews`} · {stars}
        </span>
      </div>

      <p className="mt-2 text-sm text-foreground">{business.name}</p>
      {business.category && <p className="text-xs text-muted">{business.category}</p>}
      {business.address && <p className="mt-1 text-xs text-muted">{business.address}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {business.phone && (
          <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="font-semibold text-foreground underline">
            {business.phone}
          </a>
        )}
        {business.mapsUri && (
          <a
            href={business.mapsUri}
            target="_blank"
            rel="noreferrer noopener"
            className="text-muted underline"
          >
            Open on Google Maps
          </a>
        )}
      </div>

      {business.closed && (
        <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-foreground">
          Google has this marked as closed.
        </p>
      )}
    </div>
  );
}
