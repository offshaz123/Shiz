"use client";

import { useState } from "react";

/**
 * What an FX margin costs you, driven by your own number.
 *
 * This replaced a static four-bar chart. The argument was always the strongest
 * one on the page and it was being made about hypothetical businesses; a
 * visitor who types their own monthly volume is reading about themselves,
 * which is a different thing entirely.
 *
 * CAREFUL — this is arithmetic, not a quote, and the copy has to keep saying
 * so. We introduce customers to a regulated firm; we do not price FX. The
 * comparison is between a TYPICAL high-street margin and a TIGHTER one, both
 * named as illustrative, with no claim that either is what you would be
 * offered. Do not relabel the lower figure as "our rate".
 */

const TYPICAL = 0.025;
const TIGHTER = 0.008;

const STEPS = [25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];

const money = (value: number, pence = false) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: pence ? 2 : 0,
  }).format(value);

export function SpreadCalculator() {
  const [volume, setVolume] = useState(100_000);

  const typical = volume * TYPICAL;
  const tighter = volume * TIGHTER;
  const saved = typical - tighter;

  return (
    <figure className="card p-6 sm:p-8">
      <figcaption>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          What is the margin costing you?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Move the slider to roughly what you convert in a month.
        </p>
      </figcaption>

      <div className="mt-7">
        <label htmlFor="spread-volume" className="flex items-baseline justify-between gap-4">
          <span className="text-sm font-medium text-muted">Converted each month</span>
          <span className="font-display text-2xl font-semibold tabular-nums">
            {money(volume)}
          </span>
        </label>

        <input
          id="spread-volume"
          type="range"
          min={10_000}
          max={1_000_000}
          step={5_000}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="spread-slider mt-4 w-full"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {STEPS.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setVolume(step)}
              aria-pressed={volume === step}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                volume === step
                  ? "border-accent bg-accent-soft text-accent-2"
                  : "border-border text-muted hover:border-accent/60 hover:text-foreground"
              }`}
            >
              {step >= 1_000_000 ? "£1m" : `£${step / 1000}k`}
            </button>
          ))}
        </div>
      </div>

      {/* The two costs, side by side. */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { label: "At a typical 2.5% margin", value: typical, tone: "bad" as const },
          { label: "At a tighter 0.8% margin", value: tighter, tone: "good" as const },
        ].map((row) => (
          <div
            key={row.label}
            className={`rounded-2xl border p-5 ${
              row.tone === "bad"
                ? "border-[#e0537a]/25 bg-[#e0537a]/[0.06]"
                : "border-[#0e9f6e]/25 bg-[#0e9f6e]/[0.06]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {row.label}
            </p>
            <p
              className={`font-display mt-2.5 text-3xl font-semibold tabular-nums ${
                row.tone === "bad" ? "text-[#b03357]" : "text-[#0b7a54]"
              }`}
            >
              {money(row.value)}
            </p>
            <p className="mt-1 text-xs text-muted">a month</p>
          </div>
        ))}
      </div>

      {/* The difference, which is the point. */}
      <div className="mt-4 rounded-2xl bg-ink p-5 text-on-ink">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-ink/55">
          The difference
        </p>
        <p className="font-display mt-2 text-4xl font-semibold tabular-nums">
          {money(saved)}
          <span className="ml-2 align-middle text-base font-medium text-on-ink/60">a month</span>
        </p>
        <p className="mt-2 text-sm text-on-ink/70">
          {money(saved * 12)} over a year, on the same volume.
        </p>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted">
        Arithmetic, not a quote. 2.5% and 0.8% are illustrative margins, not an offer
        and not a rate you have been given — what you would actually pay depends on the
        corridor and the volume, and we would price one real transaction against what
        you pay now before anyone commits to anything.
      </p>
    </figure>
  );
}
