import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { approaches, getApproach, clientResults } from "@/content/case-studies";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/StructuredData";
import { ClientLogo } from "@/components/ClientLogo";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

export function generateStaticParams() {
  return approaches.map((approach) => ({ slug: approach.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const approach = getApproach(slug);
  if (!approach) return {};
  return {
    title: `${approach.name} — Our Method & Results`,
    description: approach.metaDescription,
    keywords: approach.keywords,
    alternates: { canonical: `/case-studies/${approach.slug}` },
    openGraph: {
      images: [ogImage], title: `${approach.name} — Our Method & Results | ${siteConfig.name}`, description: approach.metaDescription },
  };
}

/** Which service name in a client result corresponds to each approach page. */
const APPROACH_SERVICE: Record<string, string> = {
  "meta-ads": "Meta & Instagram Ads",
  "google-ads": "Google Ads",
  seo: "SEO & Local Search",
  websites: "Website Design & Build",
};

export default async function ApproachPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const approach = getApproach(slug);
  if (!approach) notFound();

  const service = APPROACH_SERVICE[approach.slug];
  const related = service ? clientResults.filter((r) => r.services.includes(service)) : [];

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Case Studies", url: "/case-studies" },
          { name: approach.name, url: `/case-studies/${approach.slug}` },
        ]}
      />
      <FaqJsonLd items={approach.faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      <section className="relative overflow-hidden bg-[#0b0a0f]">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -right-32 -top-32 h-[440px] w-[600px] rounded-full opacity-[0.18] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <p className="text-sm text-white/45">
            <Link href="/" className="hover:text-white">Home</Link> /{" "}
            <Link href="/case-studies" className="hover:text-white">Case Studies</Link> / {approach.name}
          </p>
          <span className="mt-6 inline-flex rounded-full border border-brand-pink/40 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            {approach.label}
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {approach.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">{approach.teaser}</p>
          <Link href="/free-audit" className="brand-gradient-bg mt-9 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]">
            Request similar results <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
          How we work
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          The method behind the results
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {approach.method.map((item, i) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="brand-gradient-text text-sm font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <span className="mt-16 inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
          What we measure
        </span>
        <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          The metrics that actually matter
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {approach.measures.map((measure) => (
            <span key={measure} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-foreground">
              <span className="text-brand-pink" aria-hidden="true">✓</span> {measure}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground">Services behind this</h2>
            <Link href="/services" className="text-sm font-semibold text-brand-pink hover:underline">
              View all services →
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {approach.relatedServices.map((service) => (
              <Link key={service.href} href={service.href} className="rounded-xl border border-border bg-background px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/45 hover:text-brand-pink">
                {service.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            FAQ
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
            {approach.name} questions
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {approach.faqs.map((faq, i) => (
            <div key={faq.q} className="rounded-2xl border border-border bg-surface p-6 sm:p-7">
              <div className="flex gap-4">
                <span className="brand-gradient-bg flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Clients we do this for
          </h2>
          <div className="mt-8 space-y-6">
            {related.map((result) => (
              <div key={result.slug} className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
                <div className="flex items-start gap-4">
                  <ClientLogo result={result} size={44} />
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h3 className="text-xl font-bold text-foreground">{result.client}</h3>
                    <span className="text-sm text-muted">{result.sector}</span>
                    <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
                      {result.period}
                    </span>
                  </div>
                </div>
                {result.website && (
                  <a
                    href={result.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-block text-sm font-semibold text-brand-pink hover:underline"
                  >
                    {result.website.replace(/^https?:\/\//, "")} ↗
                  </a>
                )}
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {result.stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-border bg-background p-5">
                      <p className="brand-gradient-text text-3xl font-bold">{stat.value}</p>
                      <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            We judge a campaign on what a customer is worth to the business, not on how low we
            can push the cost per lead. A cheap lead that turns into nothing has cost you time
            and made you nothing.{" "}
            <Link href="/case-studies" className="font-semibold text-brand-pink hover:underline">
              See all our results →
            </Link>
          </p>
        </section>
      )}

    </div>
  );
}
