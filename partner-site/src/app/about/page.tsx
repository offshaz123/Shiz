import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";

export const metadata: Metadata = {
  title: "About us",
  description: `Who ${brand.name} is, who provides the regulated payment services, and where the line between the two sits.`,
  alternates: { canonical: "/about" },
};

/**
 * The introducer arrangement, set out plainly. A customer is entitled to know
 * which firm holds their money and which one is selling to them, and saying so
 * openly reads as confidence rather than a caveat.
 */
const split = [
  {
    heading: `What ${brand.name} does`,
    items: [
      "Finds the businesses the high street will not serve properly, and understands the trade.",
      "Prices the account against what you are paying today.",
      "Prepares the application with you, so the file goes in complete first time.",
      "Runs the day-to-day relationship, and answers the phone.",
    ],
  },
  {
    heading: "What the regulated firm does",
    items: [
      "Holds the FCA authorisation under the Payment Services Regulations.",
      "Runs KYB, anti-money-laundering and source-of-funds checks, and decides on every application.",
      "Provides the accounts, the currency conversion and the payout network.",
      "Provides the platform you log into, and monitors accounts on an ongoing basis.",
    ],
  },
];

const principles = [
  {
    title: "We never promise you an account",
    body: "The decision comes after the checks, and it is not ours to make. Anyone promising approval before that is selling you something they cannot deliver.",
  },
  {
    title: "We do not hide the price in the rate",
    body: "You are quoted a fee and a margin before you commit. If you would rather compare against what you pay now, bring one real transaction and we will price that one.",
  },
  {
    title: "We turn down what cannot be banked",
    body: "If your trade is outside appetite you will hear it at the first conversation. Wasting three weeks of your time to find out is not a service.",
  },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>About {brand.name}</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Payments for the businesses the high street stopped serving
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            There is a large, profitable part of British trade that mainstream banks have quietly
            withdrawn from. Not fraudsters — importers, wholesalers and distributors turning over
            millions, declined at onboarding or offboarded a year later because a whole category
            was judged too much work.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We exist for those businesses. The trade-off is an honest one: proper due diligence at
            the start, in exchange for an account that holds up afterwards. That is the whole
            proposition.
          </p>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="How this works"
          title="Two firms, and you should know which is which"
          lede={`${brand.name} introduces you. A separate, FCA-authorised firm provides the regulated payment services and holds the permissions. We would rather set that out on this page than bury it, because it is the first thing a business that has been offboarded before will want to establish.`}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {split.map((column) => (
            <Card key={column.heading}>
              <h2 className="font-display text-xl font-semibold">{column.heading}</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-background p-6">
          <RegulatoryNote />
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="How we work" title="Three things we will not do" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((item) => (
            <Card key={item.title}>
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Come and tell us about the business
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted">
            We would rather have a fifteen-minute conversation about what you actually import than
            send you a brochure.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
          >
            Get in touch
          </Link>
        </div>
      </Section>
    </>
  );
}
