import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { niches, getNiche } from "@/content/niches";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { ogImage } from "@/lib/seo";

export function generateStaticParams() {
  return niches.map((niche) => ({ slug: niche.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) return {};
  return {
    title: `Marketing for ${niche.name}`,
    description: niche.metaDescription,
    keywords: niche.keywords,
    alternates: { canonical: `/marketing-for/${niche.slug}` },
    openGraph: {
      images: [ogImage],
      title: `Marketing for ${niche.name} | ${siteConfig.shortName}`,
      description: niche.metaDescription,
    },
  };
}

export default async function NichePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const niche = getNiche(slug);
  if (!niche) notFound();
  const others = niches.filter((n) => n.slug !== niche.slug);

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Automotive", url: "/marketing-for" },
          { name: niche.name, url: `/marketing-for/${niche.slug}` },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Automotive
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Marketing for {niche.name}
          </h1>
          {niche.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mt-5 text-lg leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-7">
            <h2 className="text-lg font-semibold text-foreground">What the work is worth</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{niche.priceReality}</p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-7">
            <h2 className="text-lg font-semibold text-foreground">How customers decide</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{niche.buyingBehaviour}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-brand-pink/40 bg-surface p-7">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink">
            Where we&apos;d start
          </span>
          <h2 className="mt-2 text-xl font-bold text-foreground">{niche.channel.lead}</h2>
          <p className="mt-3 leading-relaxed text-muted">{niche.channel.body}</p>
        </div>
      </section>

      {/*
        The findings section. This is the part of these pages worth reading: it
        comes from actually scanning these businesses' sites and Google
        listings, not from a list of generic advice. No business is named.
      */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            What we keep finding
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            From running {niche.trade} through our scanner. The same few things come up again and
            again, and most of them cost nothing to fix.
          </p>
          <div className="mt-10 flex flex-col gap-5">
            {niche.commonGaps.map((gap, i) => (
              <div
                key={gap.title}
                className="flex gap-5 rounded-2xl border border-border bg-background p-6"
              >
                <span className="brand-gradient-text shrink-0 text-2xl font-bold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{gap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{gap.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            Want yours checked?{" "}
            <Link href="/free-audit" className="font-semibold text-brand-pink hover:underline">
              Run the free audit
            </Link>{" "}
            — it scans your site and your Google listing and scores both. No obligation.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What works for {niche.trade}
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {niche.whatWorks.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {niche.proof && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-4xl px-5 py-14 text-center sm:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              A real one
            </span>
            <p className="mx-auto mt-4 max-w-2xl text-2xl font-bold leading-snug text-foreground">
              &ldquo;{niche.proof.headline}&rdquo;
            </p>
            <p className="mt-3 text-sm text-muted">{niche.proof.client}</p>
            <Link
              href={`/case-studies/${niche.proof.slug}`}
              className="mt-6 inline-block text-sm font-semibold text-brand-pink hover:underline"
            >
              Read what we did →
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Let&apos;s talk about your {niche.name.toLowerCase()} business
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Tell us what you do and where, and we&apos;ll tell you honestly whether advertising
              is the right next move or whether something else needs fixing first.
            </p>
            <p className="mt-6 text-sm text-muted">
              Or call {siteConfig.phoneDisplay} and speak to Walid directly.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <LeadForm source={`Automotive — ${niche.name}`} />
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <h2 className="text-xl font-bold text-foreground">Other automotive trades we work with</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/marketing-for/${other.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-brand-pink hover:text-foreground"
              >
                {other.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
