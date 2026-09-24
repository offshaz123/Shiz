"use client";

import { Flag } from "@/components/Flag";
import { formatRate, useRates } from "@/lib/useRates";

/**
 * The activity notifications that surface over the hero.
 *
 * They are positioned against the WHOLE hero band, not against the payment
 * card. That is the difference between this reading as a live product and
 * reading as clutter: the band has four genuinely empty corners — above the
 * badge, above the card, under the card, and the strip along the bottom —
 * and a pill in any of them is legible without covering a single word. When
 * they hung off the card they landed on its top edge and on the figures.
 *
 * Pure CSS: one shared 15-second cycle, a few tenths of a second of stagger
 * so they ripple rather than snap, and seven seconds at the end with none of
 * them on screen at all, which is what gives the globe a moment on its own.
 * No timers, no hydration, nothing on the main thread.
 *
 * Deliberately NOT invented customers. The reference site runs first names
 * and amounts — "Elena R. -CHF 210.00" — which implies a customer base. Ours
 * describes the kind of movement the account is for, which is true today.
 */
const pills = [
  {
    label: "GBP → USD",
    value: "1.2684",
    note: "quoted",
    direction: "flat",
    flags: ["GB", "US"],
    /** Above the badge, in the strip between the header and the headline. */
    position: "left-[2%] top-[3%]",
  },
  {
    label: "Supplier paid",
    value: "$53,020",
    note: "same day",
    direction: "out",
    flags: ["CN"],
    /** Above the card, clear of its top edge. */
    position: "right-[4%] top-[6%]",
  },
  {
    label: "Funds received",
    value: "£48,200",
    note: "cleared",
    direction: "in",
    flags: ["GB"],
    /** Under the card, in the empty half of the right column. */
    position: "right-[6%] bottom-[17%]",
  },
  {
    label: "Payroll sent",
    value: "42 people",
    note: "one file",
    direction: "out",
    flags: ["PL"],
    /** Bottom strip, starting well right of the illustrative-figures note. */
    position: "left-[47%] bottom-[5%]",
  },
] as const;

const arrows = {
  in: { glyph: "↘", className: "text-[#5eead4]" },
  out: { glyph: "↗", className: "text-[#7dd3fc]" },
  flat: { glyph: "", className: "" },
} as const;

export function RatePills() {
  // The first pill carries a real rate once it arrives; the rest describe
  // activity rather than price, so they are unaffected.
  const live = useRates();
  const usd = live?.rates?.USD;

  return (
    // Hidden below lg. On a phone the band has no margins to speak of, so
    // every one of these positions would land on top of the copy.
    <div
      className="pointer-events-none absolute inset-0 z-20 hidden lg:block"
      aria-hidden="true"
    >
      {pills.map((pill, index) => {
        const arrow = arrows[pill.direction];
        return (
          <div
            key={pill.label}
            className={`animate-pill absolute ${pill.position}`}
            style={{ animationDelay: `${index * 0.3}s` }}
          >
            <div className="glass flex items-center gap-3 rounded-full py-2 pl-3 pr-4 shadow-lg shadow-black/20">
              <span className="flex items-center -space-x-1.5">
                {pill.flags.map((flag) => (
                  <Flag
                    key={flag}
                    code={flag}
                    className="h-4 w-6 border border-white/25 shadow-sm"
                  />
                ))}
              </span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="text-xs text-white/60">{pill.label}</span>
                {arrow.glyph && (
                  <span className={`text-xs ${arrow.className}`}>{arrow.glyph}</span>
                )}
                <span className="font-mono text-sm font-semibold">
                  {pill.label === "GBP → USD" && usd ? formatRate(usd) : pill.value}
                </span>
                <span className="text-[11px] text-white/45">
                  {pill.label === "GBP → USD" && usd ? "mid-market" : pill.note}
                </span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
