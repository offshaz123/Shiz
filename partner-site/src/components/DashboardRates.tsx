"use client";

import { currencies } from "@/lib/brand";
import { Flag } from "@/components/Flag";
import { formatRate, useRates } from "@/lib/useRates";

/**
 * Today's reference rates, for somebody signed in.
 *
 * Same source and the same caveats as the public page: European Central Bank
 * mid-market reference rates, published once a working day, NOT a quote and
 * NOT our pricing. Being logged in does not turn a reference rate into an
 * offer, and the card says so.
 */
const SHOWN = ["USD", "EUR", "CHF", "SEK", "PLN", "CZK"];

export function DashboardRates() {
  const live = useRates();
  const rows = SHOWN.map((code) => ({
    code,
    iso: currencies.find((currency) => currency.code === code)?.iso ?? "",
    rate: live?.rates?.[code],
  }));

  return (
    <div className="card p-6 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold">Today&rsquo;s rates</h2>
        <span className="text-xs text-muted">
          {live?.live && live.date
            ? new Date(live.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
            : "loading…"}
        </span>
      </div>

      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {rows.map((row) => (
          <li
            key={row.code}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5"
          >
            <span className="flex items-center gap-2.5 text-sm font-medium">
              {row.iso && <Flag code={row.iso} className="h-4 w-6 border border-border" />}
              GBP → {row.code}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {row.rate ? formatRate(row.rate) : "—"}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Mid-market reference rates from the European Central Bank. Not a quote — the
        rate you are given is quoted before you commit, and will differ.
      </p>
    </div>
  );
}
