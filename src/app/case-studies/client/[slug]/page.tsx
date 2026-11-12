import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clientResults } from "@/content/case-studies";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { ClientLogo } from "@/components/ClientLogo";
import { CountUp } from "@/components/CountUp";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

/**
 * A page per client.
 *
 * The result cards link to "see how we did it", and until now that pointed
 * at /case-studies/<client slug>, which only ever built the four approach
 * pages — so every one of those links was a 404. Eleven clients with real
 * figures deserve a page each rather than a link back to a list.
 *
 * It lives under /case-studies/client/ because /case-studies/<slug> is
 * already the approaches, and a route that has to guess which kind of thing
 * a slug names is a route that will eventually guess wrong.
 */

function getClient(slug: string) {
  return clientResults.find((r) => r.slug === slug);
}

export function generateStaticParams() {
  return clientResults.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = getClient(slug);
  if (!result) return {};

  const title = `${result.client} — ${result.headline} | ${siteConfig.shortName}`;
  return {
    title,
    description: result.summary.slice(0, 160),
    alternates: { canonical: `/case-studies/client/${result.slug}` },
    openGraph: { images: [ogImage], title, description: result.summary.slice(0, 160) },
  };
}

export default async function ClientCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getClient(slug);
  if (!result) notFound();

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Case Studies", url: "/case-studies" },
          { name: result.client, url: `/case-studies/client/${result.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 sm:px-8 sm:pt-24">
          <Link
            href="/case-studies"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink hover:underline"
          >
            ← All case studies
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ClientLogo result={result} size={56} />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {result.client}
              </h1>
              <p className="mt-1 text-sm text-muted">{result.sector}</p>
            </div>
          </div>

          <p className="brand-gradient-text mt-8 text-2xl font-bold tracking-tight sm:text-3xl">
            {result.headline}
          </p>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted">{result.summary}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            {result.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted"
              >
                {service}
              </span>
            ))}
          </div>

          {result.website && (
            <a
              href={result.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block text-sm font-semibold text-brand-pink hover:underline"
            >
              {result.website.replace(/^https?:\/\//, "")} ↗
            </a>
          )}
        </div>
      </section>

      <Reveal>
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {result.stats.map((stat) => (
              <div
                key={stat.label}
                className="lift rounded-2xl border border-border bg-surface p-6 text-center"
              >
                <CountUp
                  value={stat.value}
                  className="brand-gradient-text block text-3xl font-bold tracking-tight"
                />
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal variant="lift">
        <section className="mx-auto max-w-3xl px-5 pb-20 sm:px-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-pink">
            What the work was
          </h2>
          <ul className="mt-6 space-y-4">
            {result.work.map((item) => (
              <li key={item} className="flex items-start gap-3 text-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-1 h-4 w-4 shrink-0 text-brand-pink"
                  aria-hidden="true"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-3xl border border-border bg-surface p-8 text-center">
            <p className="text-lg font-semibold text-foreground">
              Want numbers like these for your business?
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Fifteen minutes with Walid, who owns the business and does the work.
            </p>
            <Link
              href="/walid"
              className="brand-gradient-bg mt-6 inline-block rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
            >
              Book a Call
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
