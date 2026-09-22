import { trustPoints } from "@/lib/brand";

/**
 * The strip directly under the hero. Four plain assurances, gold-ticked —
 * the first thing a wholesaler who has been offboarded twice wants to see.
 */
export function TrustBar() {
  return (
    <div className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((point) => (
          <div key={point.label} className="flex items-center gap-2.5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-gold" aria-hidden="true">
              <path
                d="m4 10.5 4 4 8-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-muted">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
