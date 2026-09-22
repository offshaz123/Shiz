import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectors, getSector } from "@/content/sectors";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export function generateStaticParams() {
  return sectors.map((sector) => ({ slug: sector.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) return {};

  return {
    title: sector.title,
    description: sector.description,
    keywords: [...sector.keywords],
    alternates: { canonical: `/who-we-serve/${sector.slug}` },
    openGraph: {
      title: sector.title,
      description: sector.description,
      url: `/who-we-serve/${sector.slug}`,
      type: "article",
    },
  };
}

export default async function SectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = getSector(slug);
  if (!sector) notFound();

  const others = sectors.filter((item) => item.slug !== sector.slug);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Who we serve", path: "/who-we-serve" },
          { name: sector.longName, path: `/who-we-serve/${sector.slug}` },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>{sector.longName}</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {sector.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{sector.intro}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {sector.currencies.map((currency) => (
              <span
                key={currency}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs"
              >
                {currency}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">What it looks like today</h2>
            <ul className="mt-6 space-y-4">
              {sector.problems.map((problem) => (
                <li
                  key={problem}
                  className="flex gap-3 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-muted"
                >
                  <span className="mt-0.5 shrink-0 text-muted" aria-hidden="true">
                    ✕
                  </span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">What the account does about it</h2>
            <ul className="mt-6 space-y-4">
              {sector.answers.map((answer) => (
                <li
                  key={answer}
                  className="flex gap-3 rounded-xl border border-border bg-background p-4 text-sm leading-relaxed"
                >
                  <span className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
                    ✓
                  </span>
                  {answer}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Next step</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Let us price one of your payments
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Tell us roughly what comes in each month and what currency goes out. If you know what
              your current provider charged you on a recent conversion, put that in too — it is the
              fastest way to a straight comparison.
            </p>
            <p className="mt-6 text-sm text-muted">
              Not quite your business?{" "}
              <Link href="/who-we-serve" className="text-accent underline-offset-4 hover:underline">
                See the other sectors we work with
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <EnquiryForm source={sector.longName} />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading title="We also work with" />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {others.map((item) => (
            <Card key={item.slug}>
              <h3 className="text-base font-semibold">{item.longName}</h3>
              <Link
                href={`/who-we-serve/${item.slug}`}
                className="mt-3 inline-flex text-sm font-semibold text-accent underline-offset-4 hover:underline"
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
