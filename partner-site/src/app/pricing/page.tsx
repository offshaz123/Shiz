import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow } from "@/components/Section";
import { PricingPlans } from "@/components/PricingPlans";
import { PricingTables } from "@/components/PricingTables";
import { TierCalculator } from "@/components/TierCalculator";
import { RegulatoryNote } from "@/components/RegulatoryNote";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pricingNotes } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: `What an ${brand.name} account costs: the monthly fee, the charge on every payment and the margin on currency conversion, published in full with no quote required.`,
  alternates: { canonical: "/pricing" },
};

/** The three things the page promises, as a strip under the headline. */
const promises = [
  {
    title: "Nothing to open the account",
    body: "No setup fee, no minimum balance, no deposit held back.",
  },
  {
    title: "The rate before you commit",
    body: "You see the conversion rate and the margin in it, then decide.",
  },
  {
    title: "Move tiers when you like",
    body: "Up or down as the volume changes. A move up applies from the next payment.",
  },
];

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Pricing", path: "/pricing" }]} />

      {/* Hero */}
      <section className="hero-blue relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-20 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="font-display text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Three numbers.
              <span className="accent-gradient-text block">All of them published.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              A fee for the account, a charge each time money moves, and a margin on anything you
              convert. That is the whole of it. Most providers publish the first, mention the
              second and bury the third inside the exchange rate — which is why so few importers
              can tell you what they actually pay.
            </p>
          </div>

          <dl className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
            {promises.map((promise) => (
              <div key={promise.title} className="glass rounded-2xl p-5">
                <dt className="text-sm font-semibold">{promise.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">{promise.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The tiers */}
      <Section>
        <SectionHeading
          center
          eyebrow="The tiers"
          title="Pick the one your volume says to"
          lede="The same account on all three. What changes is the charge on each payment and the margin on conversion, and both fall as you move up."
        />
        <div className="mt-14">
          <PricingPlans />
        </div>
      </Section>

      {/* The chooser */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <Eyebrow>Work it out</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              The cheapest tier is not the one with the smallest monthly fee
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Bronze costs £600 a year less than Gold and charges a quarter of a percent more on
              everything you convert. Those cancel out at about £20,000 converted a month. Above
              that, the cheaper monthly fee is the more expensive account — which is not obvious
              from a table, so here is the arithmetic.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Move the two sliders to roughly what a month looks like.
            </p>
          </div>
          <div className="reveal">
            <TierCalculator />
          </div>
        </div>
      </Section>

      {/* Every charge */}
      <Section>
        <SectionHeading
          center
          eyebrow="Every charge"
          title="The whole list, not the highlights"
          lede="Including the ones most rate cards leave to a terms page: Bacs, CHAPS, cross-border, and what it costs when a payment has to be chased."
        />
        <div className="mt-12">
          <PricingTables />
        </div>
      </Section>

      {/* The small print, up front */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="The small print, up front"
          title="What the figures do and do not include"
          lede="None of this is buried further down a terms page. It changes what you actually pay, so it belongs beside the numbers."
        />
        <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {pricingNotes.map((note) => (
            <div key={note.title} className="border-l-2 border-accent/30 pl-5">
              <dt className="text-base font-semibold">{note.title}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{note.body}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* The ask */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            A rate card on its own tells you very little
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            What matters is the difference between this page and what is coming out of your
            account today. Send us one real conversion — the amount, the currency and what you
            were charged — and we will put the same transaction through these figures beside it.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="btn btn-primary">
              Send us one transaction
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/opening-an-account" className="btn btn-ghost">
              What opening one involves
            </Link>
          </div>
          <div className="mt-12">
            <RegulatoryNote />
          </div>
        </div>
      </Section>
    </>
  );
}
