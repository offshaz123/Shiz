import Link from "next/link";
import type { Metadata } from "next";
import { solutions, corridorCaveat } from "@/content/solutions";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { IconTile } from "@/components/IconTile";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Business payments, multi-currency accounts and global payroll — three lines, one account, provided on a UK-regulated licence.",
  alternates: { canonical: "/solutions" },
};

export default function SolutionsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Solutions</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Three lines, one account
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Money in from your customers, currency converted, money out to suppliers, contractors or
            staff. Each line below runs on the same account, in your own company name, on our
            FCA permissions.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <Card key={solution.slug} className="flex flex-col">
              <div className="flex items-center gap-3">
                <IconTile name={solution.icon} tone={index + 2} />
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
              </div>
              <h2 className="font-display mt-5 text-xl font-semibold">{solution.name}</h2>
              <p className="mt-2 text-sm font-medium text-accent-2">{solution.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{solution.intro}</p>
              <Link
                href={`/solutions/${solution.slug}`}
                className="mt-6 text-sm font-semibold text-accent-2 underline-offset-4 hover:underline"
              >
                {solution.name} →
              </Link>
            </Card>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">{corridorCaveat}</p>
      </Section>

      <Section tone="surface">
        <SectionHeading
          title="Not sure which line you need?"
          lede="Most of our customers use two of the three. Tell us what the business does and where the money goes, and we will tell you plainly which parts apply."
        />
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
        >
          Talk to us
        </Link>
      </Section>
    </>
  );
}
