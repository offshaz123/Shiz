import type { Metadata } from "next";
import Link from "next/link";
import { industries } from "@/content/industries";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

const description =
  "The sectors we work with most: automotive, health and beauty, hospitality, trades, professional services, property, fitness and retail.";

export const metadata: Metadata = {
  title: "Industries We Work With",
  description,
  alternates: { canonical: "/industries" },
  openGraph: { title: "Industries | Shaz Marketing Group", description },
};

export default function IndustriesPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Industries", url: "/industries" }]} />
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[440px] w-[780px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Industries we <span className="brand-gradient-text">work with</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            Every sector advertises differently, and some have rules that decide what you&apos;re
            allowed to say before you spend a penny. Here&apos;s how we approach each one.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => (
            <Link key={industry.slug} href={`/industries/${industry.slug}`} className="group flex flex-col rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-pink/45">
              <h2 className="text-lg font-semibold text-foreground group-hover:text-brand-pink">{industry.name}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{industry.teaser}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {industry.examples.slice(0, 4).map((example) => (
                  <span key={example} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted">
                    {example}
                  </span>
                ))}
              </div>
              <span className="mt-6 text-sm font-semibold text-brand-pink">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
