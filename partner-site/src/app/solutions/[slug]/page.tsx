import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { solutions, getSolution, corridorCaveat } from "@/content/solutions";
import { brand, currencies } from "@/lib/brand";
import { CurrencyChip } from "@/components/CurrencyChip";
import { IconTile } from "@/components/IconTile";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { FlowSteps } from "@/components/FlowSteps";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};

  return {
    title: solution.title,
    description: solution.description,
    keywords: [...solution.keywords],
    alternates: { canonical: `/solutions/${solution.slug}` },
    openGraph: {
      title: solution.title,
      description: solution.description,
      url: `/solutions/${solution.slug}`,
      type: "article",
    },
  };
}

/** Cycled across a solution's capability cards, so no two sit side by side. */
const capabilityIcons = ["collect", "convert", "pay", "clock", "document", "globe"];

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const others = solutions.filter((item) => item.slug !== solution.slug);
  const showCurrencies = solution.slug === "multi-currency-accounts";

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: solution.name, path: `/solutions/${solution.slug}` },
        ]}
      />

      {/* Hero, with the flow of a payment alongside it */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent">
              {solution.name}
            </span>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {solution.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">{solution.intro}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
              >
                Talk to us
              </Link>
              <Link
                href="/solutions"
                className="rounded-full border border-border bg-background px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:border-accent"
              >
                All solutions
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              How the money moves
            </p>
            <ol className="mt-5 space-y-2.5">
              {solution.flow.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-3.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-on-ink">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* Stat row */}
      <div className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {solution.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {stat.label}
              </p>
              <p className="font-display mt-2.5 text-2xl font-semibold leading-tight">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <Section>
        <SectionHeading eyebrow="Capabilities" title="What you can do" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {solution.capabilities.map((capability, index) => (
            <Card key={capability}>
              <IconTile name={capabilityIcons[index % capabilityIcons.length]} tone={index + 1} />
              <p className="mt-5 text-sm leading-relaxed">{capability}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Currencies, on the line where they belong */}
      {showCurrencies && (
        <Section tone="surface">
          <SectionHeading
            center
            eyebrow="Currencies"
            title={`${currencies.length} currencies. One IBAN.`}
            lede="Eleven foreign currencies alongside sterling — receive, hold, convert and pay through real-time FX."
          />
          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {currencies.map((currency) => (
              <CurrencyChip
                key={currency.code}
                code={currency.code}
                name={currency.name}
                className="px-4 py-2.5"
              />
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
            {corridorCaveat}
          </p>
        </Section>
      )}

      {/* Typical flow */}
      <Section tone={showCurrencies ? "default" : "surface"}>
        <SectionHeading eyebrow="The route" title={`A typical ${solution.name.toLowerCase()} flow`} />
        <div className="mt-10">
          <FlowSteps steps={solution.flow} />
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted">{corridorCaveat}</p>
      </Section>

      {/* Who it is for */}
      <Section tone={showCurrencies ? "surface" : "default"}>
        <SectionHeading eyebrow="Who it is for" title={solution.audience} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {solution.audiences.map((audience) => (
            <Card key={audience.name}>
              <h3 className="font-display text-lg font-semibold">{audience.name}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{audience.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* The rest of the range */}
      <Section tone="surface">
        <SectionHeading
          title={`Part of the wider ${brand.shortName} proposition`}
          lede="Each line runs on the same account, in your own company name."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {others.map((item) => (
            <Card key={item.slug}>
              <h3 className="font-display text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">{item.tagline}</p>
              <Link
                href={`/solutions/${item.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                Read more →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      {/* Enquiry */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Next step</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us the shape of it
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Roughly what comes in each month, what currency goes out, and where it goes. That is
              enough for us to say whether this is the right line for you and what it would cost.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <RegulatoryNote />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <EnquiryForm source={solution.name} />
          </div>
        </div>
      </Section>
    </>
  );
}
