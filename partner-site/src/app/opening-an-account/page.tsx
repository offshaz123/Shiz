import Link from "next/link";
import type { Metadata } from "next";
import { onboardingChecklist } from "@/content/site";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";

export const metadata: Metadata = {
  title: "Opening an account",
  description:
    "What we need to open a business payment account: company documents, director ID, proof of trading address, statements, sample invoices, expected volumes, and a plain description of the trade.",
  alternates: { canonical: "/opening-an-account" },
};

const steps = [
  {
    title: "A conversation",
    body: "Fifteen minutes on what the business does, where the money comes from and where it goes. If we are not the right fit, you will hear that here rather than three weeks later.",
  },
  {
    title: "The file",
    body: "You send the documents on the checklist below. This is the part that decides your timeline, and it is the part you control.",
  },
  {
    title: "Checks and decision",
    body: "Compliance runs identity, anti-money-laundering and source-of-funds checks, and makes the decision. We keep you posted while it happens.",
  },
  {
    title: "First payment, together",
    body: "Once it is live we walk you through the first inward payment and the first conversion personally. After that it is yours to run.",
  },
];

export default function OpeningAnAccountPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Opening an account", path: "/opening-an-account" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Opening an account</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A complete file is the whole difference
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            How quickly a decision comes back depends almost entirely on how complete your
            application is when it goes in. Everything on the checklist, first time, and it moves. A
            file that has to be chased in pieces takes as long as the slowest piece.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="The checklist"
          title="What to have ready"
          lede="Gather all of it before you send anything. Seven items, and the last one matters more than people expect."
        />
        <ol className="mt-12 space-y-4">
          {onboardingChecklist.map((entry, index) => (
            <li
              key={entry.item}
              className="flex gap-4 rounded-2xl border border-border bg-background p-5 sm:p-6"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs text-accent">
                {index + 1}
              </span>
              <div>
                <h3 className="text-base font-semibold">{entry.item}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{entry.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>Be straight with us</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us the awkward part early
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              A previous account closure, a director who lives overseas, a supplier in a country that
              raises eyebrows, a month where volume tripled — none of these are automatically a
              problem. Finding them out halfway through the checks is.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              A clear, honest account of the business is what turns a borderline file into an
              approval. It is the single most useful thing you can write.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
              <RegulatoryNote />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <h2 className="text-xl font-semibold">Start the conversation</h2>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-muted">
              Do not send documents yet. Send the shape of the business and we will tell you what the
              file needs to contain.
            </p>
            <EnquiryForm source="Opening an account" submitLabel="Send the details" />
          </div>
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Not sure whether your business fits?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-on-ink/70">
            Tell us what the business actually does and how the money moves through it. The
            pattern matters far more than the label: money in from a spread of customers, currency
            converted, money out in volume is the shape we are built around, whatever the trade is
            called.
          </p>
          <Link href="/contact" className="btn btn-primary mt-8">
            Talk to us
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </Section>
    </>
  );
}
