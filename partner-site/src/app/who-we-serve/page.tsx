import Link from "next/link";
import type { Metadata } from "next";
import { sectors } from "@/content/sectors";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Who we serve",
  description:
    "Mobile phone wholesalers, vape and e-liquid distributors, general trade importers, and security companies with large payroll — the businesses the high street declines on category alone.",
  alternates: { canonical: "/who-we-serve" },
};

export default function WhoWeServePage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Who we serve", path: "/who-we-serve" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Who we serve</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Real trade, real volume, and banking that has not kept up
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            High risk, in the way the high street uses the phrase, means a sector that needs proper
            due diligence rather than one that gets waved through. These are legitimate trading
            companies turning over serious money. The work is in onboarding them properly — which is
            exactly the work a mainstream bank has decided not to do.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {sectors.map((sector) => (
            <Card key={sector.slug} className="flex flex-col">
              <h2 className="text-xl font-semibold">{sector.longName}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{sector.intro}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {sector.currencies.map((currency) => (
                  <span
                    key={currency}
                    className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs text-accent"
                  >
                    {currency}
                  </span>
                ))}
              </div>
              <Link
                href={`/who-we-serve/${sector.slug}`}
                className="mt-5 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                Read more →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          title="Not on the list?"
          lede="The pattern matters more than the label. If you buy abroad and sell here, or you collect from UK customers and pay out in volume, the account is likely to fit. Tell us what the business does and we will say plainly whether it does."
        />
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
        >
          Describe your business
        </Link>
      </Section>
    </>
  );
}
