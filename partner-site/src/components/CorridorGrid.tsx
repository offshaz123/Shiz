import { currencies } from "@/lib/brand";
import { Flag } from "@/components/Flag";

/**
 * Every country whose currency the account holds, as cards.
 *
 * The scrolling line elsewhere on the page is the same data in motion; this is
 * it standing still, for the reader who wants to check whether their own
 * currency is on the list rather than wait for it to come round.
 */
export function CorridorGrid() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {currencies.map((currency) => (
        <li
          key={currency.code}
          className="card flex items-center gap-3 p-4"
        >
          <Flag code={currency.iso} className="h-7 w-[42px] border border-border" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{currency.country}</span>
            <span className="font-mono text-xs text-muted">{currency.code}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
