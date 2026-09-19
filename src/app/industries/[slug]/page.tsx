import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { industries, getIndustry } from "@/content/industries";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return {
    title: `Marketing for ${industry.name}`,
    description: industry.metaDescription,
    keywords: industry.keywords,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: {
      images: [ogImage], title: `Marketing for ${industry.name} | ${siteConfig.shortName}`, description: industry.metaDescription },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const others = industries.filter((i) => i.slug !== industry.slug);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Industries", url: "/industries" },
          { name: industry.name, url: `/industries/${industry.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <Link href="/industries" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink hover:underline">
            ← All industries
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Meta &amp; Instagram Ads for{" "}
            <span className="brand-gradient-text">{industry.name}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{industry.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {industry.examples.map((example) => (
              <span key={example} className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted">
                {example}
              </span>
            ))}
          </div>
          <Link href="/walid" className="brand-gradient-bg mt-10 inline-block rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]">
            Talk To Walid About This
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What actually works in this sector
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {industry.whatWorks.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        {industry.note && (
          <div className="mt-8 rounded-2xl border border-brand-pink/35 bg-brand-pink/[0.06] p-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-pink">
              Worth knowing before you advertise
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-foreground">{industry.note}</p>
          </div>
        )}

        {industry.readMore && (
          <p className="mt-10 text-sm text-muted">
            Worth reading:{" "}
            <Link href={industry.readMore.href} className="font-semibold text-brand-pink hover:underline">
              {industry.readMore.label} →
            </Link>
          </p>
        )}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Run a {industry.name.toLowerCase()} business?
            </h2>
            <p className="mt-4 text-muted">
              Tell us about it and we&apos;ll come back with what we&apos;d run and what it would cost.
            </p>
          </div>
          <div className="mt-10">
            <LeadForm compact source={`Industry page: ${industry.name}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="text-xl font-bold text-foreground">Other industries we work with</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other) => (
            <Link key={other.slug} href={`/industries/${other.slug}`} className="rounded-xl border border-border bg-surface px-5 py-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/45 hover:text-brand-pink">
              {other.name} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
