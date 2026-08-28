import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig, repairServices, polishStages, detailingBundle } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Car Repairs, Servicing & Detailing",
  description:
    "Brakes, servicing, machine polishing, ceramic detailing and number plates — straightforward, fixed pricing where we can give it, honest quotes where we can't.",
  alternates: { canonical: "/repairs" },
  openGraph: {
    title: "Car Repairs, Servicing & Detailing | Executive Tints & Repairs",
    description:
      "Brakes, servicing, machine polishing, ceramic detailing and number plates — straightforward, fixed pricing where we can give it, honest quotes where we can't.",
  },
};

export default function RepairsPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Repairs & Servicing", url: `${siteConfig.url}/repairs` },
        ]}
      />
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Repairs, Servicing &amp; Detailing
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Keep your car running smoothly and looking its best
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Brakes and servicing done properly with fixed, upfront pricing, plus machine
            polishing, ceramic detailing and a full range of number plates.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {repairServices.map((service) => (
            <ServiceCard
              key={service.slug}
              name={service.name}
              tagline={service.tagline}
              description={service.description}
              features={service.features.slice(0, 4)}
              fromPrice={service.fromPrice}
              priceLabel={service.priceLabel}
              ctaHref={service.ctaHref ?? `/quote?service=${encodeURIComponent(service.name)}`}
              ctaLabel={service.ctaLabel}
            />
          ))}
        </div>
      </section>

      {/* Polishing stages */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Polishing
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Which polishing stage does your car need?
            </h2>
            <p className="mt-4 text-muted">
              We&apos;ll always confirm the exact price after seeing the car in person — the prices
              below are a starting guide for each stage.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {polishStages.map((stage) => (
              <div key={stage.stage} className="rounded-3xl border border-border bg-background p-7">
                <span className="brand-gradient-bg inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {stage.stage}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{stage.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{stage.description}</p>
                <p className="mt-5 text-sm text-muted">From</p>
                <p className="text-xl font-bold text-foreground">{stage.fromPrice}</p>
              </div>
            ))}
          </div>

          {/* Bundle callout */}
          <div className="brand-gradient-bg mt-10 flex flex-col items-center gap-4 rounded-3xl p-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Best Value Bundle
              </span>
              <h3 className="mt-1 text-xl font-bold">{detailingBundle.name}</h3>
              <p className="mt-2 max-w-xl text-sm text-white/90">{detailingBundle.description}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3">
              <p className="text-3xl font-bold">{detailingBundle.price}</p>
              <Link
                href={`/quote?service=${encodeURIComponent(detailingBundle.name)}`}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:scale-[1.03]"
                style={{ color: "#06090c" }}
              >
                Book This Bundle →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Book your car in today
        </h2>
        <p className="mt-4 text-muted">
          Not sure which service you need? Send us a message and we&apos;ll point you the right way.
        </p>
        <Link
          href="/quote"
          className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get a Free Quote →
        </Link>
      </section>
    </div>
  );
}
