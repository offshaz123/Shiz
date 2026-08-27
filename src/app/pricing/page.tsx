import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/StructuredData";
import { siteConfig, tintServices, repairServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for window tinting, dechroming, brakes, servicing, polishing, ceramic detailing and number plates — 10% off ceramic tint, 15% off with a valid Blue NHS card.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Exclusive Tints & Repairs",
    description:
      "Transparent pricing for window tinting, dechroming, brakes, servicing, polishing, ceramic detailing and number plates — 10% off ceramic tint, 15% off with a valid Blue NHS card.",
  },
};

const faqs = [
  {
    question: "Is the ceramic tint discount and lifetime warranty genuine?",
    answer:
      "Yes — every ceramic tint job currently comes with 10% off and a lifetime warranty against bubbling, peeling and fading, for as long as you own the vehicle.",
  },
  {
    question: "How does the Blue NHS card discount work?",
    answer:
      "Show a valid Blue Light Card (NHS) at the time of booking and get 15% off any service — tints or repairs. Discounts cannot be combined with other offers.",
  },
  {
    question: "Do you give quotes before booking?",
    answer:
      "Always. Every price above is a starting point — the exact cost depends on your vehicle's glass size and condition. Send us your reg or vehicle details on WhatsApp or through the quote form for an exact price.",
  },
  {
    question: "Do you offer any warranty on repairs?",
    answer:
      "All parts we fit are covered by their manufacturer warranty, and our workmanship is guaranteed — if something isn't right after a repair, bring it back and we'll sort it.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Pricing", url: `${siteConfig.url}/pricing` },
        ]}
      />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Pricing
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Straightforward pricing, no surprises
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            10% off ceramic tint with a lifetime warranty, and 15% off any service with a valid
            Blue NHS card.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <h2 className="text-2xl font-bold text-foreground">Window Tints</h2>
        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          {tintServices.map((s, i) => (
            <div
              key={s.slug}
              className={`flex flex-wrap items-center justify-between gap-3 p-6 ${
                i % 2 === 0 ? "bg-surface" : "bg-background"
              }`}
            >
              <div>
                <p className="font-semibold text-foreground">
                  {s.name}
                  {s.badge && (
                    <span className="ml-2 rounded-full bg-brand/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                      {s.badge}
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">{s.tagline}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-bold text-foreground">{s.fromPrice}</p>
                <Link
                  href={`/quote?service=${encodeURIComponent(s.name)}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/60"
                >
                  Get Quote
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <h2 className="text-2xl font-bold text-foreground">Repairs, Servicing &amp; Detailing</h2>
        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          {repairServices.map((s, i) => (
            <div
              key={s.slug}
              className={`flex flex-wrap items-center justify-between gap-3 p-6 ${
                i % 2 === 0 ? "bg-surface" : "bg-background"
              }`}
            >
              <div>
                <p className="font-semibold text-foreground">{s.name}</p>
                <p className="text-sm text-muted">{s.tagline}</p>
              </div>
              <div className="flex items-center gap-4">
                {s.fromPrice && (
                  <p className="text-lg font-bold text-foreground">
                    {s.priceLabel !== "" && "From "}
                    {s.fromPrice}
                  </p>
                )}
                <Link
                  href={s.ctaHref ?? `/quote?service=${encodeURIComponent(s.name)}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand/60"
                >
                  {s.ctaLabel ?? "Get Quote"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              FAQs
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pricing questions
            </h2>
          </div>
          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-background p-6">
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <FaqJsonLd items={faqs} />
      </section>
    </div>
  );
}
