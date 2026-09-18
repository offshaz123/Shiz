import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locations, getLocation } from "@/content/locations";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return locations.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: `Meta & Instagram Ads in ${location.city}`,
    description: location.metaDescription,
    keywords: location.keywords,
    alternates: { canonical: `/locations/${location.slug}` },
    openGraph: { title: `${location.city} | ${siteConfig.name}`, description: location.metaDescription },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();
  const others = locations.filter((l) => l.slug !== location.slug);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Locations", url: "/locations" },
          { name: location.city, url: `/locations/${location.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <Link href="/locations" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink hover:underline">
            ← All locations
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Meta &amp; Instagram Ads in{" "}
            <span className="brand-gradient-text">{location.city}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{location.teaser}</p>
          <Link href="/free-audit" className="brand-gradient-bg mt-9 inline-block rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]">
            Get Your Free Marketing Audit
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <div
          className={`rounded-2xl border p-7 sm:p-9 ${
            location.isBase ? "border-brand-pink/40 bg-brand-pink/[0.06]" : "border-border bg-surface"
          }`}
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-pink">
            {location.isBase ? "Where we are" : "Being straight with you"}
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-foreground">{location.presence}</p>
          {location.isBase && (
            <p className="mt-4 text-sm text-muted">
              {siteConfig.address.line1}, {siteConfig.address.line2}, {siteConfig.address.city} {siteConfig.address.postcode}
            </p>
          )}
        </div>

        <h2 className="mt-14 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Advertising in {location.city}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-muted">{location.context}</p>

        <h3 className="mt-12 text-lg font-semibold text-foreground">
          Sectors we see doing well here
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {location.strongSectors.map((sector) => (
            <span key={sector} className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted">
              {sector}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Based in {location.city}?
            </h2>
            <p className="mt-4 text-muted">
              Tell us about your business and we&apos;ll come back with what we&apos;d run.
            </p>
          </div>
          <div className="mt-10">
            <LeadForm compact source={`Location page: ${location.city}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="text-xl font-bold text-foreground">Other locations</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {others.map((other) => (
            <Link key={other.slug} href={`/locations/${other.slug}`} className="rounded-xl border border-border bg-surface px-5 py-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/45 hover:text-brand-pink">
              {other.city} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
