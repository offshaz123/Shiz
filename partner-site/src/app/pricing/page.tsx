import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { PricingTables } from "@/components/PricingTables";
import { RegulatoryNote } from "@/components/RegulatoryNote";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { pricingNotes, tierSummary } from "@/content/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: `What an ${brand.name} account costs: the monthly fee, the charge per payment and the margin on currency conversion, set out in full.`,
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "Pricing", path: "/pricing" }]} />

      <Section tone="surface">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="font-display text-balance mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            The whole rate card, on one page
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            A monthly fee, a charge for each payment, and a margin on anything you convert. Those
            are the three numbers. They are all below, and there is no fourth one further down.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {tierSummary.map((tier) => (
            <Card key={tier.name} className="p-5 text-center">
              <p className="text-sm font-semibold">{tier.name}</p>
              <p className="font-display mt-2 text-3xl font-semibold tracking-tight">
                {tier.monthly}
              </p>
              <p className="mt-1 text-xs text-muted">a month, {tier.forWho.toLowerCase()}</p>
              <p className="mt-4 border-t border-border pt-4 font-mono text-xs text-muted">
                {tier.fx} on conversion
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <PricingTables />
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="The small print, up front"
          title="What the figures do and do not include"
          lede="None of this is hidden further down a terms page. It changes what you actually pay, so it belongs next to the numbers."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pricingNotes.map((note) => (
            <Card key={note.title} className="p-5">
              <h3 className="text-base font-semibold">{note.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{note.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Price it against what you pay now
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            A rate card on its own tells you very little. Send us one real conversion — the
            amount, the currency and what you were charged — and we will put the same transaction
            through this page beside it.
          </p>
          <Link href="/contact" className="btn btn-primary mt-8">
            Send us one transaction
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <div className="mt-10">
            <RegulatoryNote />
          </div>
        </div>
      </Section>
    </>
  );
}
