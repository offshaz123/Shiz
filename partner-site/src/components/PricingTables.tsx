"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  businessGroups,
  payrollGroups,
  freelanceRows,
  tierSummary,
  tiers,
} from "@/content/pricing";

/**
 * The rate card, with the three audiences behind a switcher.
 *
 * A switcher rather than three stacked tables: a freelancer has no use for
 * the payroll per-payout line and a payroll bureau does not care about the
 * 1% flat charge, and showing everyone everything is how a price list stops
 * being read at all.
 *
 * On a phone the tier tables turn into one block per tier. A four-column
 * table at 390px is a table nobody reads.
 */
const audiences = [
  { key: "business", label: "Business" },
  { key: "payroll", label: "Payroll companies" },
  { key: "freelance", label: "Freelancers & IT" },
] as const;

type Audience = (typeof audiences)[number]["key"];

function TierTable({ groups }: { groups: typeof businessGroups }) {
  return (
    <>
      {/* Desktop: one table, a column per tier. */}
      <div className="mt-10 hidden overflow-hidden rounded-2xl border border-border md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface">
              <th className="w-[46%] px-5 py-4 text-left font-semibold">Charge</th>
              {tierSummary.map((tier) => (
                <th key={tier.name} className="px-5 py-4 text-left font-semibold">
                  {tier.name}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {tier.monthly} a month
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <tr>
                  <th
                    colSpan={4}
                    className="border-t border-border bg-surface/60 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <td className="px-5 py-3.5">{row.label}</td>
                    {row.values.map((value, index) => (
                      <td
                        key={`${row.label}-${tiers[index]}`}
                        className="px-5 py-3.5 font-mono text-[13px] font-semibold"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: a card per tier. */}
      <div className="mt-8 space-y-5 md:hidden">
        {tierSummary.map((tier, tierIndex) => (
          <div key={tier.name} className="card p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <span className="font-mono text-sm font-semibold">{tier.monthly} a month</span>
            </div>
            <p className="mt-1 text-xs text-muted">{tier.forWho}</p>
            {groups.map((group) => (
              <div key={group.title} className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  {group.title}
                </p>
                <dl className="mt-2 divide-y divide-border border-t border-border">
                  {group.rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 py-2.5 text-sm">
                      <dt className="text-muted">{row.label}</dt>
                      <dd className="shrink-0 font-mono text-[13px] font-semibold">
                        {row.values[tierIndex]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function PricingTables() {
  const [audience, setAudience] = useState<Audience>("business");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Who the pricing is for"
        className="mx-auto grid max-w-xl grid-cols-3 gap-1 rounded-2xl border border-border bg-surface p-1"
      >
        {audiences.map((option) => (
          <button
            key={option.key}
            role="tab"
            type="button"
            aria-selected={audience === option.key}
            onClick={() => setAudience(option.key)}
            className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              audience === option.key
                ? "bg-ink text-on-ink"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {audience === "business" && (
        <>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted">
            A monthly fee, a charge per payment, and a margin on conversion. The charges fall and
            the margin tightens as you move up, so the tier follows the volume rather than the
            other way round.
          </p>
          <TierTable groups={businessGroups} />
        </>
      )}

      {audience === "payroll" && (
        <>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted">
            Priced per payout, so a payroll run of forty costs forty payments rather than a
            percentage of the wage bill. The same three tiers.
          </p>
          <TierTable groups={payrollGroups} />
        </>
      )}

      {audience === "freelance" && (
        <>
          <p className="mx-auto mt-8 max-w-2xl text-center text-base leading-relaxed text-muted">
            No monthly fee and nothing to pay to open the account. You are charged when money
            moves, and not otherwise.
          </p>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {freelanceRows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <span className="block font-medium">{row.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {row.note}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-sm font-semibold">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Processing more than the Platinum tier is built for?{" "}
        <Link href="/contact" className="font-semibold text-accent-2 hover:underline">
          Send us a month of real activity
        </Link>{" "}
        and we will price against it.
      </p>
    </div>
  );
}
