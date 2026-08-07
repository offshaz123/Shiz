import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceCategories, findServiceCategory } from "@/content/services";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { VariantSwatch } from "@/components/VariantSwatch";
import { ServiceGallery } from "@/components/ServiceGallery";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export function generateStaticParams() {
  return serviceCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = findServiceCategory(slug);
  if (!category) return {};

  return {
    title: category.title,
    description: category.description,
    alternates: { canonical: `/services/${category.slug}` },
    openGraph: {
      title: `${category.title} | ${siteConfig.name}`,
      description: category.description,
    },
  };
}

function QuoteCta({ tradeEnquiry }: { tradeEnquiry?: boolean }) {
  return (
    <div className="flex flex-col justify-center gap-3 sm:flex-row">
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
        {tradeEnquiry ? "Trade Enquiries — WhatsApp Us" : "Chat on WhatsApp"}
      </a>
    </div>
  );
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = findServiceCategory(slug);
  if (!category) notFound();

  const otherCategories = serviceCategories.filter((c) => c.slug !== category.slug);

  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <nav className="text-xs text-muted">
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>{" "}
          / <span className="text-foreground">{category.navTitle}</span>
        </nav>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{category.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{category.description}</p>
        <div className="mt-8">
          <QuoteCta tradeEnquiry={category.tradeEnquiry} />
        </div>
        {(category.timeEstimate || category.warranty) && (
          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            {category.timeEstimate && (
              <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted">
                ⏱ {category.timeEstimate}
              </span>
            )}
            {category.warranty && (
              <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted">
                🛡 {category.warranty}
              </span>
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">See our work</h2>
        <div className="mt-8">
          <ServiceGallery images={category.gallery} label={category.navTitle} />
        </div>
      </section>

      {category.variants && category.variants.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {category.variantsIntro ?? "Options available"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {category.variants.map((variant) => (
                <div key={variant.name} className="rounded-3xl border border-border bg-background p-5">
                  <VariantSwatch swatch={variant.swatch} />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{variant.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{variant.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {category.trustNote && (
        <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8">
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-6 py-4 text-center">
            <span className="text-brand-pink">★★★★★</span>
            <p className="text-sm font-medium text-foreground">{category.trustNote}</p>
          </div>
        </section>
      )}

      {category.comparisonTable && (
        <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{category.comparisonTable.title}</h2>
          <div className="mt-6 overflow-hidden rounded-3xl border border-border">
            <div className="grid grid-cols-3 bg-surface text-sm font-semibold text-foreground">
              <div className="px-4 py-3 sm:px-6">Feature</div>
              <div className="px-4 py-3 sm:px-6">{category.comparisonTable.columnA}</div>
              <div className="px-4 py-3 sm:px-6 text-brand-pink">{category.comparisonTable.columnB}</div>
            </div>
            {category.comparisonTable.rows.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-background" : "bg-surface/50"}`}
              >
                <div className="px-4 py-3 font-medium text-foreground sm:px-6">{row.feature}</div>
                <div className="px-4 py-3 text-muted sm:px-6">{row.a}</div>
                <div className="px-4 py-3 text-foreground sm:px-6">{row.b}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {category.legalNote && (
        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <div className="rounded-3xl border border-brand-orange/30 bg-surface p-8">
            <h2 className="text-lg font-semibold text-foreground">{category.legalNote.heading}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{category.legalNote.body}</p>
          </div>
        </section>
      )}

      {category.whatIncluded && category.whatIncluded.length > 0 && (
        <section className={category.variants ? "mx-auto max-w-6xl px-5 py-20 sm:px-8" : "border-y border-border bg-surface"}>
          <div className={category.variants ? "" : "mx-auto max-w-6xl px-5 py-20 sm:px-8"}>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">What&apos;s included</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {category.whatIncluded.map((item) => (
                <div key={item.name} className="rounded-3xl border border-border bg-background p-8">
                  <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {category.pricing && category.pricing.length > 0 && (
        <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Pricing</h2>
          <div className="mt-6 divide-y divide-border rounded-3xl border border-border bg-surface">
            {category.pricing.map((point) => (
              <div key={point.label} className="flex items-center justify-between px-6 py-4">
                <span className="text-sm text-muted">{point.label}</span>
                <span className="text-base font-semibold text-foreground">{point.price}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {category.processSteps && category.processSteps.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">How we get there</h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {category.processSteps.map((s) => (
                <div key={s.step}>
                  <span className="brand-gradient-text text-4xl font-bold">{s.step}</span>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
          Why get this done at {siteConfig.name}
        </h2>
        <ul className="mt-8 space-y-4">
          {category.highlights.map((point) => (
            <li key={point} className="flex items-start gap-3 text-base text-muted">
              <svg viewBox="0 0 24 24" fill="none" className="mt-1 h-5 w-5 shrink-0 text-brand-pink">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready to book?</h2>
          <p className="mt-4 text-muted">
            {category.tradeEnquiry
              ? "Message us your vehicle and what you're after for a quote, or message our trade line on WhatsApp for trade pricing."
              : "Message us your vehicle and what you're after, and we'll come back with a quote."}
          </p>
          <div className="mt-8">
            <QuoteCta tradeEnquiry={category.tradeEnquiry} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-pink">Other services</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {otherCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/services/${c.slug}`}
              className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-brand-pink/40"
            >
              <p className="font-semibold text-foreground">{c.navTitle}</p>
              <p className="mt-1.5 text-sm text-muted">{c.shortDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Services", url: `${siteConfig.url}/services` },
          { name: category.navTitle, url: `${siteConfig.url}/services/${category.slug}` },
        ]}
      />
    </div>
  );
}
