import type { Metadata } from "next";
import Link from "next/link";
import { serviceCategories } from "@/content/services";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Published pricing for services at ${siteConfig.name}, plus free quotes for anything vehicle-specific.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: `Pricing | ${siteConfig.name}`,
    description: `Published pricing for services at ${siteConfig.name}, plus free quotes for anything vehicle-specific.`,
  },
};

export default function PricingPage() {
  const priced = serviceCategories.filter((c) => c.pricing && c.pricing.length > 0);
  const quoteOnly = serviceCategories.filter((c) => !c.pricing || c.pricing.length === 0);

  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Pricing</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Straight-Talking Pricing</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Fixed prices for some services, straightforward quotes for anything that depends on your vehicle.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Published prices</h2>
        <div className="mt-6 space-y-8">
          {priced.map((category) => (
            <div key={category.slug} className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-foreground">{category.navTitle}</h3>
                <Link href={`/services/${category.slug}`} className="text-sm font-semibold text-brand-pink hover:underline">
                  Details →
                </Link>
              </div>
              <div className="mt-4 divide-y divide-border">
                {category.pricing!.map((point) => (
                  <div key={point.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-muted">{point.label}</span>
                    <span className="text-base font-semibold text-foreground">{point.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Quoted individually</h2>
          <p className="mt-3 text-sm text-muted">
            These depend on your vehicle, so we&apos;ll always give you a clear price before any work starts.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {quoteOnly.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="rounded-2xl border border-border bg-background p-6 transition-colors hover:border-brand-pink/40"
              >
                <p className="font-semibold text-foreground">{category.navTitle}</p>
                <p className="mt-1.5 text-sm text-muted">{category.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Want a price on your car?</h2>
        <p className="mt-4 text-muted">Message us your vehicle and what you&apos;re after, and we&apos;ll come back with a quote.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="brand-gradient-bg rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10"
          >
            Get a Free Quote
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground hover:border-brand-pink/60"
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
