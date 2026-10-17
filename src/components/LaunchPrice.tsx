import { PRICE_RISE, type StyleId, money, upcomingPrice } from "@/lib/plates";

// "Launch price · £49.99 from 10 November" next to a style that's going up.
// Shows nothing once the price has risen.
export function LaunchPrice({ id, which = "pair", extra = 0, className = "" }: { id: StyleId; which?: "pair" | "single"; extra?: number; className?: string }) {
  const next = upcomingPrice(id);
  if (!next) return null;
  return (
    <span className={`block text-xs font-semibold text-[#b42318] ${className}`}>
      Launch price · {money(next[which] + extra)} from {PRICE_RISE.label}
    </span>
  );
}
