"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/Icon";
import { IconTile } from "@/components/IconTile";

/**
 * "Who it is built for" — three audiences behind a tab switcher.
 *
 * The reference site puts a stock photograph of a person beside each tab. We
 * put the shape of the money instead: where it comes in, what happens to it,
 * where it goes. That is the thing that differs between these three, and it is
 * ours rather than a stock library's.
 */
const tabs = [
  {
    key: "Importers",
    icon: "box",
    tone: 1,
    title: "Collect here, pay abroad",
    body: "You buy stock overseas and sell it in the UK. Money comes in constantly from a spread of buyers and goes out in large lumps to suppliers who invoice in someone else's currency.",
    points: [
      "Named account, so retailers pay your company rather than a reference",
      "A rate quoted before you commit, so a purchase order can be priced",
      "Same-day settlement where the corridor and cut-off allow it",
    ],
    href: "/solutions/business-payments",
    linkLabel: "Business payments",
    flow: { from: "GB", fromLabel: "UK buyers", to: "CN", toLabel: "Your supplier", middle: "Convert" },
  },
  {
    key: "Freelancers",
    icon: "code",
    tone: 3,
    title: "Get paid abroad, draw down here",
    body: "You invoice clients outside the UK and get paid in their currency. The same three moves as an importer, running the other way round — in from overseas, held, converted when you choose.",
    points: [
      "Receive client and marketplace earnings in the currency they pay in",
      "Hold the balance until the rate suits you rather than converting on arrival",
      "Draw down to sterling, or pay out from the balance directly",
    ],
    href: "/solutions/freelancers",
    linkLabel: "Freelancer accounts",
    flow: { from: "US", fromLabel: "Your clients", to: "GB", toLabel: "Your account", middle: "Hold" },
  },
  {
    key: "Payroll",
    icon: "team",
    tone: 4,
    title: "Pay everyone on the day",
    body: "A distributed team, a contractor network or a large domestic roster. Payroll is the least forgiving payment there is: it clears on the day it is supposed to or somebody does not turn up.",
    points: [
      "One file, however many people are on it",
      "Paid in the currency each person is actually paid in",
      "Built for volume rather than for the occasional transfer",
    ],
    href: "/solutions/global-payroll",
    linkLabel: "Global payroll",
    flow: { from: "GB", fromLabel: "Your account", to: "PL", toLabel: "Your team", middle: "Pay run" },
  },
];

export function BuiltFor() {
  const [index, setIndex] = useState(0);
  const tab = tabs[index];

  return (
    <div>
      <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2 rounded-full border border-border bg-card p-1.5">
        {tabs.map((item, position) => {
          const active = position === index;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setIndex(position)}
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-ink text-on-ink" : "text-muted hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              {item.key}
            </button>
          );
        })}
      </div>

      <div key={tab.key} className="card animate-amount mt-8 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:p-10">
        <div>
          <IconTile name={tab.icon} tone={tab.tone} />
          <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            {tab.title}
          </h3>
          <p className="mt-4 text-base leading-relaxed text-muted">{tab.body}</p>

          <ul className="mt-6 space-y-3">
            {tab.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                  <svg viewBox="0 0 20 20" className="h-3 w-3 text-accent-2" fill="none" aria-hidden="true">
                    <path
                      d="m4 10.5 4 4 8-9"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link href={tab.href} className="btn btn-primary mt-8">
            {tab.linkLabel}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* The shape of the money, rather than a photograph of somebody. */}
        <div className="surface-tint relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8">
          <div className="ledger-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-3">
            {[
              { flag: tab.flow.from, label: tab.flow.fromLabel },
              null,
              { flag: tab.flow.to, label: tab.flow.toLabel },
            ].map((node) =>
              node ? (
                <div key={node.label} className="flex flex-1 flex-col items-center gap-3 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                    <Flag code={node.flag} className="h-6 w-9" />
                  </span>
                  <span className="text-xs font-semibold leading-tight">{node.label}</span>
                </div>
              ) : (
                <div key="middle" className="flex flex-1 flex-col items-center gap-2 text-center">
                  <svg viewBox="0 0 80 12" className="h-3 w-full text-accent" fill="none" aria-hidden="true">
                    <path
                      d="M2 6h70m0 0-6-4m6 4-6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="3 4"
                    />
                  </svg>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent-2">
                    {tab.flow.middle}
                  </span>
                </div>
              )
            )}
          </div>

          <p className="relative mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted">
            The same account underneath all three. What changes is which way the money runs and what
            happens to it in the middle.
          </p>
        </div>
      </div>
    </div>
  );
}
