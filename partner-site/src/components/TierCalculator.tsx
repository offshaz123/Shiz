"use client";

import { useState } from "react";
import Link from "next/link";
import { tierMath } from "@/content/pricing";

/**
 * Which tier is actually cheapest for your month.
 *
 * A published rate card tells you the charges; it does not tell you which
 * row of it you belong on, and that is the only question anybody brings to
 * a pricing page. Two inputs and the arithmetic is done.
 *
 * Platinum is deliberately not given a total. Its conversion margin is
 * quoted rather than published, so a total for it would be a number we made
 * up — it shows its fixed cost and says the rest is quoted.
 */
const money = (value: number) =>
  value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });

/** The payment charges are pennies apiece, so they are shown to the penny. */
const pence = (value: number) =>
  value.toLocaleString("en-GB", { style: "currency", currency: "GBP" });

export function TierCalculator() {
  const [volume, setVolume] = useState(120_000);
  const [payments, setPayments] = useState(40);

  const rows = tierMath.map((tier) => {
    const fixed = tier.monthly + payments * tier.fasterOut;
    const fx = tier.fxMargin === null ? null : volume * tier.fxMargin;
    return { ...tier, fixed, fx, total: fx === null ? null : fixed + fx };
  });

  const priced = rows.filter((row) => row.total !== null) as (typeof rows[number] & {
    total: number;
  })[];
  const cheapest = priced.reduce((a, b) => (b.total < a.total ? b : a));
  const saving = Math.max(...priced.map((r) => r.total)) - cheapest.total;

  return (
    <div className="card p-6 sm:p-8">
      <h3 className="font-display text-xl font-semibold">Which tier is yours?</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Put in roughly what a month looks like. The arithmetic below is the published charges, not
        a quote.
      </p>

      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="tier-volume" className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">Converted each month</span>
            <span className="font-mono text-sm font-semibold">{money(volume)}</span>
          </label>
          <input
            id="tier-volume"
            type="range"
            min={10_000}
            max={1_000_000}
            step={10_000}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
        </div>

        <div>
          <label htmlFor="tier-payments" className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">Payments in and out</span>
            <span className="font-mono text-sm font-semibold">{payments}</span>
          </label>
          <input
            id="tier-payments"
            type="range"
            min={5}
            max={400}
            step={5}
            value={payments}
            onChange={(event) => setPayments(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {rows.map((row) => {
          const best = row.total !== null && row.name === cheapest.name;
          return (
            <div
              key={row.name}
              className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
                best ? "border-accent bg-accent-soft" : "border-border bg-surface"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex items-center gap-2.5 text-sm font-semibold">
                  {row.name}
                  {best && (
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-on-accent">
                      Cheapest for you
                    </span>
                  )}
                </span>
                <span className="font-mono text-lg font-semibold">
                  {row.total === null ? "From " + money(row.fixed) : money(row.total)}
                  <span className="ml-1 text-xs font-normal text-muted">a month</span>
                </span>
              </div>
              {/* Built as a string rather than JSX text. Inline expressions
                  either side of a line break lose the space between them, and
                  "£40in payment charges" is how that shows up. */}
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {[
                  `${money(row.monthly)} account`,
                  `${pence(payments * row.fasterOut)} in payment charges`,
                  row.fx === null
                    ? "conversion quoted against your flow"
                    : `${money(row.fx)} margin on ${money(volume)} converted`,
                ].join(" \u00b7 ")}
              </p>
            </div>
          );
        })}
      </div>

      {saving > 0 && (
        <p className="mt-6 text-sm leading-relaxed">
          At this volume {cheapest.name} costs{" "}
          <span className="font-semibold">{money(saving)} a month less</span> than the most
          expensive of the two published tiers — {money(saving * 12)} over a year.
        </p>
      )}

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Arithmetic, not a quote. It assumes every payment is a Faster Payment and every conversion
        is charged at the published margin; CHAPS, SWIFT and anything that has to be chased are
        charged separately, as set out in the table above. Platinum has no total because its
        conversion margin is quoted rather than published.{" "}
        <Link href="/contact" className="font-semibold text-accent-2 hover:underline">
          Send us a real month
        </Link>{" "}
        and we will price it properly.
      </p>
    </div>
  );
}
