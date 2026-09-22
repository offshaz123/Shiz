/**
 * The notifications that surface over the hero globe.
 *
 * Pure CSS: every pill runs the same 16-second cycle on a different delay, so
 * one rises as the last one leaves. No timers, no hydration, nothing to run on
 * the main thread. Under reduced motion they simply sit there, all visible.
 *
 * The figures are illustrative and the hero says so underneath. They are
 * deliberately the kind of movement this account is actually for — a supplier
 * settled, a payroll run, a conversion quoted — rather than invented customers
 * with first names, which would imply a customer base we do not yet have.
 */
const pills = [
  { label: "GBP → USD", value: "1.2684", note: "quoted", position: "-top-6 left-2 lg:-left-10" },
  { label: "Supplier paid", value: "$53,020", note: "same day", position: "top-[34%] -right-2 lg:-right-10" },
  { label: "GBP → EUR", value: "1.1742", note: "quoted", position: "bottom-[14%] left-0 lg:-left-14" },
  { label: "Payroll sent", value: "42 people", note: "one file", position: "-bottom-7 right-3 lg:right-6" },
] as const;

export function RatePills() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {pills.map((pill, index) => (
        <div
          key={pill.label}
          className={`animate-pill absolute ${pill.position}`}
          style={{ animationDelay: `${index * 4}s` }}
        >
          <div className="glass flex items-center gap-3 rounded-full py-2 pl-3 pr-4">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent" fill="none" aria-hidden="true">
                <path
                  d="M5 12h14m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-xs text-muted">{pill.label}</span>
              <span className="font-mono text-sm font-semibold">{pill.value}</span>
              <span className="text-[11px] text-accent-2">{pill.note}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
