import Link from "next/link";
import { brand } from "@/lib/brand";

/**
 * The mark is the O of OvaroPay drawn as a split ring: one arc in ink, one in
 * accent, with a gap at each join. It reads as the letter and as a cycle —
 * money going out and coming back — which is the whole product in one glyph.
 *
 * Each half is a circle with a dash pattern rather than a hand-plotted arc, so
 * the two always meet exactly. Circumference is 2 * PI * 7.5, about 47.12. Each
 * circle draws ONE arc of 19 and then a gap long enough to carry it back round,
 * and the second is offset by 23.56 — half the ring — so the two arcs sit
 * opposite each other with an even 4.56 gap at each join.
 *
 * It used to be "19 4.56" on both, which draws TWO arcs per circle; offsetting
 * the second by half the ring then landed its arcs exactly on top of the
 * first's, so the ink half was covered and the mark came out one flat colour
 * everywhere it was drawn.
 */
function Mark({ className = "" }: { className?: string }) {
  const dash = "19 28.12";
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
      {/* No colour class. The ink arc is currentColor, so the mark takes the
          colour of whatever it is sitting on: ink on the white header, and the
          light hero ink on the blue panel of the account pages, where
          text-foreground used to leave a near-black arc on near-black. */}
      <Mark className="h-8 w-8 transition-transform group-hover:rotate-45" />
      <span className="font-display text-[19px] font-semibold tracking-tight">
        {brand.shortName}
      </span>
    </Link>
  );
}
