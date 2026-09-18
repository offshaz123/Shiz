import type { Metadata } from "next";
import Link from "next/link";
import { approaches, publishedResult } from "@/content/case-studies";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

const description =
  "We publish results a client has approved and we can stand behind. Explore how we approach each area and the metrics we hold ourselves to.";

export const metadata: Metadata = {
  title: "Case Studies & Method",
  description,
  alternates: { canonical: "/case-studies" },
  openGraph: { title: "Case Studies | Shaz Marketing Group", description },
};

export default function CaseStudiesPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Case Studies", url: "/case-studies" }]} />

      <section className="relative overflow-hidden bg-[#0b0a0f]">
        <div aria-hidden className="brand-gradient-bg pointer-events-none absolute -right-32 -top-32 h-[460px] w-[640px] rounded-full opacity-[0.18] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <p className="text-sm text-white/45">
            <Link href="/" className="hover:text-white">Home</Link> / Case Studies
          </p>
          <span className="mt-6 inline-flex rounded-full border border-brand-pink/40 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            Real results
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Marketing <span className="brand-gradient-text">results &amp; method</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">
            We publish results a client has approved and that we can stand behind. There is one
            campaign below with the real figures, and beneath it, how we approach each area and
            the metrics we hold ourselves to.
          </p>
          <Link href="/free-audit" className="brand-gradient-bg mt-9 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]">
            Want results like these? Get an audit <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h2 className="text-2xl font-bold text-foreground">{publishedResult.client}</h2>
            <span className="text-sm text-muted">{publishedResult.sector}</span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
              {publishedResult.period}
            </span>
          </div>
          <p className="mt-5 max-w-3xl text-muted">{publishedResult.summary}</p>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {publishedResult.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-background p-6">
                <p className="brand-gradient-text text-4xl font-bold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          How we approach each area
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {approaches.map((approach) => (
            <Link
              key={approach.slug}
              href={`/case-studies/${approach.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/45"
            >
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand-pink">
                {approach.label}
              </span>
              <h3 className="mt-2.5 text-xl font-semibold text-foreground group-hover:text-brand-pink">
                {approach.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{approach.teaser}</p>
              <span className="mt-6 text-sm font-semibold text-brand-pink">
                View {approach.name} approach →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
