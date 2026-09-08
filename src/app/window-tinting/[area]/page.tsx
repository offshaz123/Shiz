import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { areas, findArea } from "@/content/areas";
import { siteConfig, tintServices } from "@/lib/site-config";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { TrackedCallLink } from "@/components/TrackedCallLink";

export function generateStaticParams() {
  return areas.map((area) => ({ area: area.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = findArea(slug);
  if (!area) return {};

  const title = `Car Window Tinting in ${area.name} | Ceramic, Dyed & Chameleon`;
  return {
    title,
    description: `Car window tinting for ${area.name} drivers (${area.postcodes}). Standard dyed from £99, ceramic from £180 with a lifetime warranty. Hand-fitted at our Walthamstow unit — ${area.driveTime}.`,
    keywords: [
      `window tinting ${area.name}`,
      `car window tinting ${area.name}`,
      `car tinting ${area.name}`,
      `ceramic tint ${area.name}`,
      `window tint ${area.postcodes.split(",")[0].trim()}`,
    ],
    alternates: { canonical: `/window-tinting/${area.slug}` },
    openGraph: { title, type: "website" },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ area: string }> }) {
  const { area: slug } = await params;
  const area = findArea(slug);
  if (!area) notFound();

  // Service schema rather than LocalBusiness — the business is in Walthamstow,
  // and claiming a second location in each area would be a fabrication.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Car window tinting",
    name: `Car Window Tinting in ${area.name}`,
    areaServed: { "@type": "Place", name: `${area.name}, London (${area.postcodes})` },
    provider: {
      "@type": "AutoRepair",
      name: siteConfig.name,
      telephone: siteConfig.phoneE164,
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address.line1,
        addressLocality: siteConfig.address.city,
        postalCode: siteConfig.address.postcode,
        addressCountry: "GB",
      },
    },
    offers: tintServices
      .filter((s) => s.fromPrice)
      .map((s) => ({
        "@type": "Offer",
        name: s.name,
        price: s.fromPrice.replace("£", ""),
        priceCurrency: "GBP",
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Window Tints", url: `${siteConfig.url}/tints` },
          { name: area.name, url: `${siteConfig.url}/window-tinting/${area.slug}` },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          {area.postcodes} &middot; {area.driveTime}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Car Window Tinting in {area.name}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">{area.intro}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <TrackedCallLink className="brand-gradient-bg rounded-full px-7 py-3.5 text-sm font-semibold shadow-md shadow-black/10 transition-transform hover:scale-[1.03]">
            Call {siteConfig.phoneDisplay}
          </TrackedCallLink>
          <Link
            href="/quote"
            className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/60"
          >
            Get a free quote
          </Link>
        </div>

        <div className="mt-14 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Prices</h2>
            <ul className="mt-5 divide-y divide-border rounded-3xl border border-border bg-surface">
              {tintServices
                .filter((s) => s.fromPrice)
                .map((s) => (
                  <li key={s.slug} className="flex items-baseline justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted">{s.tagline}</p>
                    </div>
                    <p className="shrink-0 font-bold text-brand">From {s.fromPrice}</p>
                  </li>
                ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Ceramic is the only tint we back with a lifetime warranty. Standard dyed film carries
              no warranty &mdash; it&apos;s cheaper for a reason, and we&apos;d rather say so.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Getting here from {area.name}
            </h2>
            <p className="mt-4 leading-relaxed text-muted">{area.route}</p>
            <p className="mt-3 leading-relaxed text-muted">
              We&apos;re at {siteConfig.address.line1}, {siteConfig.address.city}{" "}
              {siteConfig.address.postcode}. Open{" "}
              {siteConfig.hours[0].day}, {siteConfig.hours[0].time}. Same-day fitting
              is usually available &mdash; ring ahead and we&apos;ll tell you honestly whether we
              can fit you in today.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">
              What {area.name} drivers should know
            </h2>
            <p className="mt-4 leading-relaxed text-muted">{area.local}</p>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-8 text-center">
          <p className="text-xl font-bold text-foreground">
            Tinting your car in {area.name}?
          </p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Tell us the make, model and how dark you want it, and we&apos;ll give you a price over
            the phone.
          </p>
          <TrackedCallLink className="brand-gradient-bg mt-6 inline-block rounded-full px-8 py-3.5 text-sm font-semibold shadow-md shadow-black/10 transition-transform hover:scale-[1.03]">
            Call {siteConfig.phoneDisplay}
          </TrackedCallLink>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm font-semibold text-foreground">We also cover</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {areas
              .filter((a) => a.slug !== area.slug)
              .map((a) => (
                <Link
                  key={a.slug}
                  href={`/window-tinting/${a.slug}`}
                  className="text-muted transition-colors hover:text-brand"
                >
                  {a.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
