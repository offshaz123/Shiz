import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig, repairServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Car Repairs & Servicing",
  description:
    "Brakes, minor and major servicing with straightforward, fixed pricing — quality parts, fitted and checked properly.",
  alternates: { canonical: "/repairs" },
  openGraph: {
    title: "Car Repairs & Servicing | Exclusive Tints & Repairs",
    description:
      "Brakes, minor and major servicing with straightforward, fixed pricing — quality parts, fitted and checked properly.",
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
            Repairs &amp; Servicing
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Keep your car running as well as it looks
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Brakes and servicing, done properly with quality parts and fixed, upfront pricing — no
            surprises on the invoice.
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
              features={service.features}
              fromPrice={service.fromPrice}
              quoteHref={`/quote?service=${encodeURIComponent(service.name)}`}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Minor or major service — which do you need?
          </h2>
          <p className="mt-4 text-muted">
            Our <span className="font-semibold text-foreground">Minor Service (£150)</span> covers
            engine oil and an oil filter — the essentials to keep your engine protected between
            full services. Our{" "}
            <span className="font-semibold text-foreground">Major Service (from £249)</span> goes
            further, covering every filter on the car — air, fuel and cabin — alongside the full
            oil change. Not sure which one your car is due? Send us the mileage and last service
            date and we&apos;ll tell you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Book your brakes or servicing today
        </h2>
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
