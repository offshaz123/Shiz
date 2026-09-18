import Link from "next/link";
import type { PricingGroup, PricingPlan } from "@/content/pricing";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Feature({ text }: { text: string }) {
  if (text.endsWith(":")) {
    return (
      <li className="pt-0.5 text-sm font-semibold text-foreground">{text}</li>
    );
  }
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <CheckIcon />
      <span className="text-muted">{text}</span>
    </li>
  );
}

function PlanCard({ plan, wide }: { plan: PricingPlan; wide?: boolean }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-8 ${
        plan.popular
          ? "border-transparent bg-surface shadow-2xl shadow-black/10 ring-2 ring-brand-pink"
          : "border-border bg-surface"
      }`}
    >
      {plan.popular && !wide && (
        <span className="brand-gradient-bg absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-md">
          Most Popular
        </span>
      )}

      <div className={wide ? "sm:flex sm:items-start sm:justify-between sm:gap-8" : undefined}>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</span>
            {plan.priceSuffix && <span className="text-sm text-muted">{plan.priceSuffix}</span>}
          </div>
          {plan.term && (
            <span className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
              {plan.term}
            </span>
          )}
          <p className={`mt-3 text-sm text-muted ${wide ? "max-w-xl" : ""}`}>{plan.tagline}</p>
        </div>

        {wide && (
          <Link
            href="/contact"
            className="brand-gradient-bg mt-6 inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] sm:mt-1"
          >
            {plan.ctaLabel ?? "Get Started"}
          </Link>
        )}
      </div>

      <ul
        className={`mt-6 flex-1 space-y-3 ${
          wide ? "sm:columns-2 sm:gap-x-10 sm:space-y-0 [&>li]:mb-3 [&>li]:break-inside-avoid" : ""
        }`}
      >
        {plan.features.map((f) => (
          <Feature key={f} text={f} />
        ))}
      </ul>

      {!wide && (
        <Link
          href="/contact"
          className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
            plan.popular
              ? "brand-gradient-bg text-white shadow-lg shadow-black/10"
              : "border border-border text-foreground"
          }`}
        >
          {plan.ctaLabel ?? "Get Started"}
        </Link>
      )}
    </div>
  );
}

export function PricingSection({
  group,
  headingLevel = "h2",
  className = "",
}: {
  group: PricingGroup;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  const wide = group.plans.length === 1;

  return (
    <section id={group.id} className={`scroll-mt-28 ${className}`}>
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            {group.eyebrow}
          </span>
          <Heading className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {group.title}
          </Heading>
          <p className="mt-4 leading-relaxed text-muted">{group.intro}</p>
          <Link
            href={`/services/${group.serviceSlug}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink hover:underline"
          >
            {group.serviceLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className={`mt-12 grid gap-6 ${wide ? "" : "lg:grid-cols-3"}`}>
          {group.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} wide={wide} />
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">{group.footnote}</p>
      </div>
    </section>
  );
}
