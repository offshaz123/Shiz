import Link from "next/link";
import { brand } from "@/lib/brand";

/**
 * The mark is the O of OvaroPay drawn as a split ring: one arc in ink, one in
 * copper, with a gap at each join. It reads as the letter and as a cycle —
 * money going out and coming back — which is the whole product in one glyph.
 *
 * The ring is a single circle with a dash pattern rather than two hand-plotted
 * arcs, so the two halves always meet exactly. Circumference is 2 * PI * 7.5,
 * about 47.12; a 19 / 4.56 dash gives two arcs and two even gaps.
 */
function Mark({ className = "" }: { className?: string }) {
  const dash = "19 4.56";
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="7.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray={dash}
      />
      <circle
        cx="12"
        cy="12"
        r="7.5"
        stroke="var(--accent)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray={dash}
        strokeDashoffset="-23.56"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label={`${brand.name} home`}
    >
      <Mark className="h-8 w-8 text-foreground transition-transform group-hover:rotate-45" />
      <span className="font-display text-[19px] font-semibold tracking-tight">
        {brand.shortName}
      </span>
    </Link>
  );
}
