import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { solutions, getSolution, corridorCaveat } from "@/content/solutions";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
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

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  const others = solutions.filter((item) => item.slug !== solution.slug);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Solutions", path: "/solutions" },
          { name: solution.name, path: `/solutions/${solution.slug}` },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>{solution.tagline}</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
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
      </Section>

      <Section tone="surface">
        <SectionHeading eyebrow="What you can do" title="In practice" />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {solution.capabilities.map((capability) => (
            <li
              key={capability}
              className="flex gap-3 rounded-xl border border-border bg-background p-5 text-sm leading-relaxed"
            >
              <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true">
                <path
                  d="m4 10.5 4 4 8-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {capability}
            </li>
          ))}
        </ul>
        <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-background p-6">
          <h3 className="text-base font-semibold">Who it is for</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{solution.audience}</p>
          <p className="mt-4 text-xs leading-relaxed text-muted">{corridorCaveat}</p>
        </div>
      </Section>

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

      <Section tone="surface">
        <SectionHeading title="The other lines" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {others.map((item) => (
            <Card key={item.slug}>
              <h3 className="font-display text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 text-sm text-muted">{item.tagline}</p>
              <Link
                href={`/solutions/${item.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-accent-2 underline-offset-4 hover:underline"
              >
                Read more →
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
