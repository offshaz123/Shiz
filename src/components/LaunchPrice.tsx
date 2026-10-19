import { type StyleId, changeDay, money, upcomingPrice } from "@/lib/plates";

// "Goes up to £49.99 on 10 November" next to a style with a price rise
// scheduled in Admin → Prices. Shows nothing otherwise.
export function LaunchPrice({ id, which = "pair", extra = 0, className = "" }: { id: StyleId; which?: "pair" | "single"; extra?: number; className?: string }) {
  const next = upcomingPrice(id);
  if (!next) return null;
  return (
    <span className={`block text-xs font-semibold text-[#b42318] ${className}`}>
      Goes up to {money(next[which] + extra)} on {changeDay(next.startsAt)}
    </span>
  );
}
