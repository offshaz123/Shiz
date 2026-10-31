import { currencies } from "@/lib/brand";
import { Flag } from "@/components/Flag";

/**
 * The line of countries and currencies running across the page.
 *
 * It scrolls rather than sitting in a static grid, so it reads as a network
 * rather than a price list. The flags are inlined SVG rather than emoji,
 * which Windows renders as bare letter pairs.
 *
 * The list is rendered twice so the loop is seamless, it stops for anyone who
 * has asked for reduced motion, and the strip is hidden from assistive tech —
 * the same currencies appear as real text on the multi-currency page.
 */
export function CurrencyMarquee() {
  const run = [...currencies, ...currencies];

  return (
    <div className="marquee-mask relative overflow-hidden py-2" aria-hidden="true">
      <div className="animate-marquee flex w-max gap-3">
        {run.map((currency, index) => (
          <span
            key={`${currency.code}-${index}`}
            className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <Flag code={currency.iso} className="h-7 w-[42px] border border-border" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{currency.country}</span>
              <span className="font-mono text-xs text-muted">{currency.code}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
