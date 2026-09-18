import type { Metadata } from "next";
import Link from "next/link";
import { locations } from "@/content/locations";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

const description =
  "We're based in London at One Canada Square and work with businesses across the UK remotely. Here's where our clients are.";

export const metadata: Metadata = {
  title: "Locations",
  description,
  alternates: { canonical: "/locations" },
  openGraph: { title: "Locations | Shaz Marketing Group", description },
};

export default function LocationsPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Locations", url: "/locations" }]} />
      <ItemListJsonLd name="Areas we cover" items={locations.map((l) => ({ name: `Marketing agency ${l.city}`, url: `/locations/${l.slug}` }))} />
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[440px] w-[780px] -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Where we <span className="brand-gradient-text">work</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            One office, in London. Clients across the UK. Everything runs remotely, so where we
            sit makes no difference to the work — and we&apos;ll never claim a local office we
            haven&apos;t got.
          </p>
          <p className="mt-4 text-sm text-muted">
            {siteConfig.address.line1}, {siteConfig.address.line2}, {siteConfig.address.city} {siteConfig.address.postcode}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Link
              key={location.slug}
              href={`/locations/${location.slug}`}
              className={`group flex flex-col rounded-2xl border bg-surface p-7 transition-colors ${
                location.isBase ? "border-brand-pink/45" : "border-border hover:border-brand-pink/45"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-brand-pink">
                  {location.city}
                </h2>
                {location.isBase && (
                  <span className="brand-gradient-bg rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Our office
                  </span>
                )}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{location.teaser}</p>
              <span className="mt-5 text-sm font-semibold text-brand-pink">Learn more →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
