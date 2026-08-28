import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/ServiceCard";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig, tintServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Window Tinting Services",
  description:
    "Standard dyed, ceramic and chameleon window tints, plus dechroming — premium film, executive finish, lifetime warranty on ceramic.",
  alternates: { canonical: "/tints" },
  openGraph: {
    title: "Window Tinting Services | Executive Tints & Repairs",
    description:
      "Standard dyed, ceramic and chameleon window tints, plus dechroming — premium film, executive finish, lifetime warranty on ceramic.",
  },
};

export default function TintsPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Window Tints", url: `${siteConfig.url}/tints` },
        ]}
      />
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Window Tints
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Premium tint, fitted to an executive standard
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            From classic dyed film to our lifetime-warrantied ceramic and eye-catching chameleon
            colour-shift tint — every job is hand-fitted for a flawless, bubble-free finish.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {tintServices.map((service) => (
            <ServiceCard
              key={service.slug}
              name={service.name}
              tagline={service.tagline}
              description={service.description}
              features={service.features}
              fromPrice={service.fromPrice}
              priceNote={service.priceNote}
              badge={service.badge}
              ctaHref={`/quote?service=${encodeURIComponent(service.name)}`}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Standard dyed vs. ceramic — what&apos;s the difference?
          </h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[520px] border-separate border-spacing-0 overflow-hidden rounded-3xl border border-border text-left text-sm">
              <thead>
                <tr className="bg-surface-2">
                  <th className="p-4 font-semibold text-foreground">Feature</th>
                  <th className="p-4 font-semibold text-foreground">Standard Dyed</th>
                  <th className="p-4 font-semibold text-foreground">Ceramic</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                <tr className="border-t border-border">
                  <td className="p-4">Heat rejection</td>
                  <td className="p-4">Moderate</td>
                  <td className="p-4 font-medium text-foreground">Excellent — up to 99% infrared</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">UV protection</td>
                  <td className="p-4">Up to 99%</td>
                  <td className="p-4 font-medium text-foreground">Up to 99.9%</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">Signal interference</td>
                  <td className="p-4">None</td>
                  <td className="p-4">None</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">Fading / purpling over time</td>
                  <td className="p-4">Can fade over several years</td>
                  <td className="p-4 font-medium text-foreground">Won&apos;t fade or purple</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="p-4">Warranty</td>
                  <td className="p-4">2 years</td>
                  <td className="p-4 font-medium text-foreground">Lifetime</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Want the full breakdown?{" "}
            <Link href="/blog/ceramic-vs-standard-window-tint" className="text-brand hover:underline">
              Read our ceramic vs. standard guide →
            </Link>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Not sure which tint is right for you?
        </h2>
        <p className="mt-4 text-muted">
          Send us your vehicle details on WhatsApp or fill in a quick form and we&apos;ll recommend
          the right film for your budget and goals.
        </p>
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
