import { currencies } from "@/lib/brand";
import { currencyFlags } from "@/lib/brand";
import { Flag } from "@/components/Flag";

/**
 * The product visual: a multi-currency IBAN with balances sitting on it.
 *
 * The figures are illustrative and the card says so — the same caveat our
 * provider puts on its own demo dashboard. Nothing here is a real account.
 */
export function BalanceCard() {
  const rows = [
    { code: "GBP", amount: "1,240.00" },
    { code: "USD", amount: "850.00" },
    { code: "EUR", amount: "300.00" },
    { code: "CAD", amount: "210.00" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface-2/70 p-5 backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        Multi-currency IBAN
      </p>
      <ul className="mt-5 space-y-2.5">
        {rows.map((row) => (
          <li
            key={row.code}
            className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3"
          >
            <span className="flex items-center gap-2 font-mono text-sm font-semibold">
              <Flag code={currencyFlags[row.code]} className="h-3 w-[18px]" />
              {row.code}
            </span>
            <span className="text-sm tabular-nums text-muted">{row.amount}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-muted">
        Illustrative balances, not a real customer account. {currencies.length} currencies are
        supported on one IBAN.
      </p>
    </div>
  );
}
