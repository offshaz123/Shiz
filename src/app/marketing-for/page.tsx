import type { Metadata } from "next";
import Link from "next/link";
import { niches } from "@/content/niches";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Automotive Marketing",
  description:
    "Marketing and Google Ads for UK automotive businesses — detailing, window tinting, vehicle wrapping, paint protection, trackers, garages and used car dealers.",
  keywords: [
    "automotive marketing agency UK",
    "marketing for car detailing",
    "marketing for window tinting",
    "advertising for automotive businesses",
  ],
  alternates: { canonical: "/marketing-for" },
  openGraph: {
    images: [ogImage],
    title: `Automotive Marketing | ${siteConfig.shortName}`,
    description:
      "Marketing and Google Ads for UK automotive businesses, from mobile valeting to paint protection.",
  },
};

export default function MarketingForIndex() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Automotive", url: "/marketing-for" },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Automotive
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            We know this trade properly
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            &ldquo;Automotive&rdquo; covers a mobile valeter charging twenty pounds and a paint
            protection studio charging three thousand, and almost nothing true about advertising
            one is true about the other. So there is a page for each.
          </p>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted">
            Every one is written from work actually done: scanning these businesses&apos; websites
            and Google listings, reading their published prices, and the named results on our own
            case studies page.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {niches.map((niche) => (
            <Link
              key={niche.slug}
              href={`/marketing-for/${niche.slug}`}
              className="group rounded-2xl border border-border bg-surface p-7 transition-colors hover:border-brand-pink"
            >
              <h2 className="text-lg font-semibold text-foreground">{niche.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{niche.intro[0]}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-pink">
                What works for {niche.trade} →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-surface p-8 text-center">
          <h2 className="text-xl font-bold text-foreground">Not sure where you fit?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Run the free audit. It scans your website and your Google listing, scores both, and
            tells you what is costing you work. It takes about twenty seconds and there is no
            obligation afterwards.
          </p>
          <Link
            href="/free-audit"
            className="brand-gradient-bg mt-7 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Run the free audit
          </Link>
        </div>
      </section>
    </div>
  );
}
