import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { serviceCategories, findServiceCategory } from "@/content/services";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
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
          / <span className="text-foreground">{category.title}</span>
        </nav>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{category.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{category.description}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">What&apos;s included</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {category.items.map((item) => (
              <div key={item.name} className="rounded-3xl border border-border bg-background p-8">
                <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <p className="mt-4 text-muted">Message us your vehicle and what you&apos;re after, and we&apos;ll come back with a quote.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
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
              Chat on WhatsApp
            </a>
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
              <p className="font-semibold text-foreground">{c.title}</p>
              <p className="mt-1.5 text-sm text-muted">{c.shortDescription}</p>
            </Link>
          ))}
        </div>
      </section>

      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Services", url: `${siteConfig.url}/services` },
          { name: category.title, url: `${siteConfig.url}/services/${category.slug}` },
        ]}
      />
    </div>
  );
}
