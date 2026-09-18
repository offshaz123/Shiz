import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { services, getService } from "@/content/services";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.name,
    description: service.metaDescription,
    keywords: service.keywords,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} | ${siteConfig.name}`,
      description: service.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.name, url: `/services/${service.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-24">
          <Link href="/services" className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink hover:underline">
            ← All services
          </Link>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {service.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">{service.intro}</p>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/walid"
              className="brand-gradient-bg inline-block rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
            >
              Talk To Walid About This
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="rounded-2xl border border-border bg-surface p-7 sm:p-9">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-pink">
            Who it&apos;s for
          </h2>
          <p className="mt-3 text-lg text-foreground">{service.whoFor}</p>
        </div>

        <h2 className="mt-16 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What&apos;s included
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {service.includes.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        {service.readMore && (
          <p className="mt-10 text-sm text-muted">
            Worth reading:{" "}
            <Link href={service.readMore.href} className="font-semibold text-brand-pink hover:underline">
              {service.readMore.label} →
            </Link>
          </p>
        )}
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Want to know what we&apos;d do for you?
            </h2>
            <p className="mt-4 text-muted">
              Tell us about your business and we&apos;ll come back with what we&apos;d actually
              run, and what it would cost. No charge and no obligation.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-xl">
            <LeadForm compact source={`Service page: ${service.name}`} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <h2 className="text-xl font-bold text-foreground">Other services</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other) => (
            <Link
              key={other.slug}
              href={`/services/${other.slug}`}
              className="rounded-xl border border-border bg-surface px-5 py-4 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/45 hover:text-brand-pink"
            >
              {other.name} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
