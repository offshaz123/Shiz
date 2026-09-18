import type { Metadata } from "next";
import Link from "next/link";
import { approaches, clientResults } from "@/content/case-studies";
import { ClientResultCard } from "@/components/ClientResultCard";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

const description =
  "Real campaigns, real numbers. CoBanq, Executive Tints, Detailmatics and Alliance Security Group, with the leads, cost per lead and spend our clients have approved us to publish.";

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
            We publish results our clients have approved and that we can stand behind. Four of
            them are below with the real figures, and beneath those, how we approach each area
            and the metrics we hold ourselves to.
          </p>
          <Link href="/free-audit" className="brand-gradient-bg mt-9 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]">
            Want results like these? Get an audit <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="space-y-8">
          {clientResults.map((result) => (
            <ClientResultCard key={result.slug} result={result} />
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
          How we report these: leads and cost per lead come from the campaign reporting over the
          period shown, and the ad spend figure is what that works out to across the run. Cost per
          lead is an average over the whole period, so individual months sat above and below it.
          Where a client has since taken their ad account back in house, the figures are the ones
          from the period we were running it.
        </p>

        <div className="mt-10 rounded-3xl border border-brand-pink/35 bg-surface p-8 sm:p-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            A cheap lead isn&apos;t the point. A lead worth having is.
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            Anybody can drive the cost per lead down. The number that matters is what the lead is
            worth once it turns into a job. A £2 lead that becomes a £20 sale has cost you time
            and made you nothing. A £2 lead that becomes a £300 job is a different business
            entirely, and a £9 lead that becomes a £900 contract is better again.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            So we set the target against what a customer is actually worth to you, not against a
            number that looks good in a report. That&apos;s the first thing we work out before we
            spend anything, and it&apos;s the thing we judge the campaign by afterwards.
          </p>
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
