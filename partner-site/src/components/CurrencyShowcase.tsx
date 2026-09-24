"use client";

import { useRates } from "@/lib/useRates";

import { useCallback, useEffect, useState } from "react";
import { currencies } from "@/lib/brand";
import { Flag } from "@/components/Flag";

/**
 * The multi-currency demonstration: one payment, landing in whichever currency
 * you pick.
 *
 * It cycles on its own so the section is alive before anyone touches it, and a
 * tap takes over — the cycle restarts from whatever you chose rather than
 * yanking the card away a second later.
 *
 * The rates are LIVE mid-market reference rates from the European Central
 * Bank, refreshed through /api/rates. The figures below are the fallback the
 * card ships with, used until the fetch lands and if it ever fails — the
 * layout must never depend on rates having arrived.
 *
 * Live or not, these are a reference rate and not a quote, and the card says
 * so on its face. We introduce customers to a regulated firm; we do not
 * price foreign exchange, and a number that reads like an offer would stray
 * into a permission that is not ours.
 */
const AMOUNT_GBP = 1240;

const FALLBACK: Record<string, number> = {
  GBP: 1,
  USD: 1.2684,
  EUR: 1.1742,
  CAD: 1.735,
  CHF: 1.118,
  DKK: 8.76,
  NOK: 13.42,
  SEK: 13.18,
  PLN: 5.12,
  CZK: 29.15,
  HUF: 462,
  RON: 5.84,
};

/** The line that pops up under the card, in step with the currency shown. */
const NOTES: Record<string, string> = {
  GBP: "Retailer payment cleared",
  USD: "Supplier in Shenzhen paid",
  EUR: "Invoice settled in Rotterdam",
  CAD: "Distributor paid in Toronto",
  CHF: "Contractor paid in Zurich",
  DKK: "Freight invoice settled",
  NOK: "Supplier paid in Oslo",
  SEK: "Payroll run in Stockholm",
  PLN: "Warehouse invoice settled",
  CZK: "Supplier paid in Brno",
  HUF: "Contractor paid in Budapest",
  RON: "Payroll run in Bucharest",
};

const SHOWN = currencies.filter((currency) => currency.code !== "GBP").slice(0, 6);

function format(code: string, rates: Record<string, number>) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "HUF" ? 0 : 2,
  }).format(AMOUNT_GBP * rates[code]);
}

export function CurrencyShowcase() {
  const [index, setIndex] = useState(0);
  const active = SHOWN[index];

  // Live rates when they land, the shipped figures until then. The component
  // must render correctly either way: the page is static and reaches the
  // browser before this resolves.
  const live = useRates();
  const rates =
    live && Object.keys(live.rates).length > 1 ? live.rates : FALLBACK;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SHOWN.length);
    }, 3800);
    return () => clearInterval(timer);
    // Re-armed by `index` so a tap restarts the dwell rather than cutting it short.
  }, [index]);

  const select = useCallback((next: number) => setIndex(next), []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-center">
      <div>
        <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Multi-currency accounts
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Eleven foreign currencies alongside sterling on one account in your own company name.
          Receive, convert through real-time FX, and pay out from the currency balance.
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {SHOWN.map((currency, position) => {
            const selected = position === index;
            return (
              <button
                key={currency.code}
                type="button"
                onClick={() => select(position)}
                aria-pressed={selected}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border-accent bg-accent-soft text-accent-2"
                    : "border-border bg-card text-muted hover:border-accent/60 hover:text-foreground"
                }`}
              >
                <Flag code={currency.iso} className="h-3 w-[18px]" />
                {currency.code}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted">
          Tap a currency to see the same payment land in it. It cycles on its own if you don&rsquo;t.
        </p>
      </div>

      <div className="relative">
        <div className="card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              Incoming payment
            </p>
            <span className="flex items-center gap-2 rounded-full bg-accent-soft py-1 pl-2 pr-3 font-mono text-[11px] font-semibold text-accent-2">
              <Flag code={active.iso} className="h-3 w-[18px]" />
              {active.code}
            </span>
          </div>

          <dl className="mt-6 space-y-3 border-b border-border pb-5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">From</dt>
              <dd className="font-medium">Your GBP balance</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Converted</dt>
              <dd className="font-mono">
                £{AMOUNT_GBP.toLocaleString("en-GB")} at {rates[active.code].toLocaleString("en-GB", { maximumFractionDigits: 4 })}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Lands in</dt>
              <dd className="font-medium">{active.country}</dd>
            </div>
          </dl>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            They receive
          </p>
          {/* Keyed on the code so the amount re-enters on every change. */}
          <p
            key={active.code}
            className="font-display animate-amount mt-2 text-4xl font-semibold tracking-tight"
          >
            {format(active.code, rates)}
          </p>
          <p className="mt-2 text-sm text-accent-2">Rate shown before you commit.</p>

          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted">
            {live?.live && live.date ? (
              <>
                <span className="font-semibold text-foreground">
                  Mid-market reference rate,{" "}
                  {new Date(live.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>{" "}
                (European Central Bank). Not a quote — the rate you are given is quoted
                before you commit, and will differ.
              </>
            ) : (
              <>
                Indicative mid-market rates, not a live quote. The rate you are given is
                quoted before you commit.
              </>
            )}
          </p>
        </div>

        <div
          key={`note-${active.code}`}
          className="glass absolute -bottom-4 left-4 flex items-center gap-2.5 rounded-full py-2 pl-3 pr-4 sm:left-8"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft">
            <svg viewBox="0 0 20 20" className="h-3 w-3 text-accent" fill="none" aria-hidden="true">
              <path
                d="m4 10.5 4 4 8-9"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="whitespace-nowrap text-xs font-medium">{NOTES[active.code]}</span>
        </div>
      </div>
    </div>
  );
}
