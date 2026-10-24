"use client";

import type { AuditCategory } from "@/lib/site-audit";

/**
 * The browser window that assembles itself beside a running scan.
 *
 * Deliberately plain: divs, a border and CSS transitions. No SVG paths, no
 * canvas, no animation library and nothing looping, so it costs effectively
 * nothing to render and stops moving the moment it has finished.
 *
 * The badges are real. The scan usually answers well before the loading
 * sequence ends, so the parent hands us the finished categories and a count of
 * how many to show; we reveal results we already hold rather than inventing a
 * plausible-looking animation.
 */

type Slot = {
  id: string;
  /** Where this check lives on a page, in plain words. */
  label: string;
};

/** The order badges appear in, top of the page downwards. */
const SLOTS: Slot[] = [
  { id: "fundamentals", label: "Secure & mobile" },
  { id: "tracking", label: "Tracking" },
  { id: "seo", label: "Headings" },
  { id: "contact", label: "Contact" },
  { id: "presence", label: "Reviews" },
];

function verdict(score: number): "good" | "warn" | "bad" {
  if (score >= 7) return "good";
  if (score >= 4) return "warn";
  return "bad";
}

const TONE = {
  good: { dot: "bg-emerald-500", ring: "ring-emerald-500/40" },
  warn: { dot: "bg-amber-500", ring: "ring-amber-500/40" },
  bad: { dot: "bg-red-500", ring: "ring-red-500/40" },
} as const;

function Badge({ state }: { state: "pending" | "good" | "warn" | "bad" }) {
  if (state === "pending") {
    return (
      <span
        aria-hidden
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/25 ring-4 ring-muted/10"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted" />
      </span>
    );
  }
  const tone = TONE[state];
  return (
    <span
      aria-hidden
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ${tone.dot} ${tone.ring}`}
    >
      {state === "good" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : state === "bad" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="text-[12px] font-bold leading-none text-white">!</span>
      )}
    </span>
  );
}

/** One wireframe row with its badge and caption pinned to the right. */
function Row({
  slot,
  state,
  shown,
  children,
}: {
  slot: Slot;
  state: "pending" | "good" | "warn" | "bad";
  shown: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">{children}</div>
      <div
        className={`flex items-center gap-2 transition-opacity duration-500 motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        <Badge state={state} />
        <span className="hidden w-[76px] text-[11px] leading-tight text-muted sm:block">
          {slot.label}
        </span>
      </div>
    </div>
  );
}

export function ScanBrowserFrame({
  url,
  categories,
  revealed,
}: {
  url: string;
  /** Finished results, once the scan has answered. */
  categories?: AuditCategory[];
  /** How many of the five slots to show so far, 0–5. */
  revealed: number;
}) {
  const byId = new Map((categories ?? []).map((c) => [c.id, c]));

  function stateFor(index: number, id: string): "pending" | "good" | "warn" | "bad" {
    if (index >= revealed) return "pending";
    const category = byId.get(id);
    if (!category) return "pending";
    return verdict(category.score);
  }

  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-black/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-surface px-3 py-1.5">
          <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 shrink-0 text-muted" aria-hidden>
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="truncate text-[11px] text-muted">{host || "yourbusiness.co.uk"}</span>
        </div>
      </div>

      {/* Wireframe page, with the badges pinning on as results arrive */}
      <div className="flex flex-col gap-5 p-5 sm:p-6">
        <Row slot={SLOTS[0]} state={stateFor(0, "fundamentals")} shown={revealed > 0}>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-muted/30" />
            <div className="h-2 w-16 rounded bg-muted/30" />
            <div className="ml-auto flex gap-1.5">
              <div className="h-2 w-8 rounded bg-muted/20" />
              <div className="h-2 w-8 rounded bg-muted/20" />
            </div>
          </div>
        </Row>

        <Row slot={SLOTS[1]} state={stateFor(1, "tracking")} shown={revealed > 1}>
          <div className="rounded-lg border border-dashed border-border px-3 py-2">
            <div className="h-1.5 w-20 rounded bg-muted/25" />
          </div>
        </Row>

        <Row slot={SLOTS[2]} state={stateFor(2, "seo")} shown={revealed > 2}>
          <div className="flex flex-col gap-2">
            <div className="h-3.5 w-3/5 rounded bg-muted/35" />
            <div className="h-2 w-4/5 rounded bg-muted/20" />
            <div className="h-2 w-2/3 rounded bg-muted/20" />
          </div>
        </Row>

        <Row slot={SLOTS[3]} state={stateFor(3, "contact")} shown={revealed > 3}>
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-md bg-brand-pink/25" />
            <div className="h-6 w-16 rounded-md bg-muted/20" />
          </div>
        </Row>

        <Row slot={SLOTS[4]} state={stateFor(4, "presence")} shown={revealed > 4}>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3 w-3 rounded-sm bg-muted/25" />
            ))}
          </div>
        </Row>
      </div>
    </div>
  );
}
