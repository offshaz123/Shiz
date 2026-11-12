"use client";

/**
 * The report being written, beside the box you type your address into.
 *
 * The scanner section was a heading, a paragraph and one input in the middle
 * of a very large empty space, which made the strongest thing on the site
 * look like the least finished. This shows what comes back: a score dial
 * filling, then the checks landing one at a time.
 *
 * It is an illustration of the shape of the report, not a real result and
 * not anyone's real site — so there are no figures in it beyond the dial,
 * and the dial is explicitly labelled as an example.
 *
 * Loops, because somebody reading the paragraph beside it should still see
 * it working when they look up.
 */

const CHECKS = [
  { label: "Facebook & Instagram tracking", state: "bad" },
  { label: "Google Analytics", state: "good" },
  { label: "Loads fast on a phone", state: "warn" },
  { label: "Google Business Profile", state: "good" },
  { label: "Easy to contact", state: "bad" },
] as const;

const TONE = {
  good: { ring: "border-emerald-500/60 bg-emerald-500/10", dot: "bg-emerald-400" },
  warn: { ring: "border-amber-500/60 bg-amber-500/10", dot: "bg-amber-400" },
  bad: { ring: "border-red-500/60 bg-red-500/10", dot: "bg-red-400" },
};

export function ScanPreview() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7">
      <div className="flex items-center gap-2 text-[11px] font-medium text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-pink/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
        </span>
        Checking the site
      </div>

      {/* The dial. A conic gradient swept by a mask, so there is no SVG arc
          maths and no JavaScript — just one element turning. */}
      <div className="mt-5 flex items-center gap-5">
        <div className="scan-dial relative h-24 w-24 shrink-0">
          <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-full bg-surface">
            <span className="scan-score text-2xl font-bold tracking-tight text-foreground">
              6.4
            </span>
            <span className="text-[9px] uppercase tracking-wide text-muted">out of 10</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Five things checked</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            What is tracking, how Google reads the pages, how fast it is on a phone, and how
            easy you are to contact.
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {CHECKS.map((check, i) => (
          <li
            key={check.label}
            className="scan-row flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
            style={{ animationDelay: `${0.9 + i * 0.45}s` }}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${TONE[check.state].ring}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${TONE[check.state].dot}`} />
            </span>
            <span className="text-xs text-foreground">{check.label}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        An example of the shape of the report, not a real result. Yours is run against your own
        address and emailed to you.
      </p>
    </div>
  );
}
