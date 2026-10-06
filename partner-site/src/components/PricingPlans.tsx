import Link from "next/link";
import { plans } from "@/content/pricing";

/**
 * The three tiers as cards.
 *
 * Gold is marked because it is genuinely the one most of this customer base
 * lands on, not as a sales device — the chooser underneath shows the
 * arithmetic, and if Bronze is cheaper for you it says so.
 */
export function PricingPlans() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
      {plans.map((plan) => (
        /* The badge hangs over the top edge, so it cannot live inside the
           card: .card sets overflow:hidden and clipped it in half. It is a
           sibling in a relative wrapper instead. */
        <div key={plan.name} className={`relative ${plan.featured ? "lg:-mt-4" : ""}`}>
          {plan.featured && (
            <span className="absolute -top-3 left-6 z-10 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-accent">
              Most businesses
            </span>
          )}

          <div
            className={`card flex h-full flex-col p-6 sm:p-7 ${
              plan.featured ? "border-accent shadow-[var(--shadow-lift)] lg:pb-10" : ""
            }`}
          >
          <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{plan.forWho}</p>

          <p className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold tracking-tight">
              {plan.monthly}
            </span>
            <span className="text-sm text-muted">a month, ex VAT</span>
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">{plan.blurb}</p>

          <dl className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
            {plan.highlights.map((item) => (
              <div key={item.label} className="flex items-baseline justify-between gap-4">
                <dt className="text-muted">{item.label}</dt>
                <dd className="shrink-0 font-mono text-[13px] font-semibold">{item.value}</dd>
              </div>
            ))}
          </dl>

          {/* The spacing lives on the wrapper, not the button: mt-auto on a
              .btn would push it down but pt-8 on one just makes a lopsided
              button. The three cards carry different amounts of copy, and
              without this their buttons sit at three different heights. */}
          <div className="mt-auto pt-8">
            <Link
              href="/contact"
              className={`w-full ${plan.featured ? "btn btn-primary" : "btn btn-ghost"}`}
            >
              Talk to us about {plan.name}
            </Link>
          </div>
          </div>
        </div>
      ))}
    </div>
  );
}
