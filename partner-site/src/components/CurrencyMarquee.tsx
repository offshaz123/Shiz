import { currencies } from "@/lib/brand";

/**
 * A slow-moving line of the supported currencies.
 *
 * The list is rendered twice so the loop is seamless. It stops entirely for
 * anyone who has asked for reduced motion, and the whole strip is hidden from
 * assistive tech — the same currencies are listed as real text on the
 * multi-currency accounts page.
 */
export function CurrencyMarquee() {
  const run = [...currencies, ...currencies];

  return (
    <div
      className="marquee-mask relative overflow-hidden border-y border-border bg-surface py-5"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max gap-3">
        {run.map((currency, index) => (
          <span
            key={`${currency.code}-${index}`}
            className="flex shrink-0 items-baseline gap-2.5 rounded-full border border-border bg-background px-5 py-2.5"
          >
            <span className="font-mono text-sm font-semibold">{currency.code}</span>
            <span className="text-xs text-muted">{currency.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
