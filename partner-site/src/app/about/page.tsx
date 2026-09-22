import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";

export const metadata: Metadata = {
  title: "About us",
  description: `Who ${brand.name} is, how the accounts are provided, and where the line sits between what we do and what our regulated partner does.`,
  alternates: { canonical: "/about" },
};

const split = [
  {
    heading: "What we do",
    items: [
      "Find the businesses the high street will not serve properly, and understand the trade.",
      "Price the account against what you are paying today.",
      "Prepare the application with you, so the file goes in complete.",
      "Run the day-to-day relationship, and answer the phone.",
    ],
  },
  {
    heading: "What our regulated partner does",
    items: [
      "Holds the licence and the regulatory permissions.",
      "Runs KYB, anti-money-laundering and source-of-funds checks, and decides on every application.",
      "Provides the banking rails, the currency conversion and the payouts.",
      "Provides the platform your business logs into, and monitors accounts on an ongoing basis.",
    ],
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
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Banking for businesses that deserve it and cannot get it
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            There is a large, profitable part of British trade that mainstream banks have quietly
            stopped serving. Not fraudsters — importers, wholesalers and distributors turning over
            millions, declined at onboarding or offboarded a year later because a category was
            judged too much work.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We exist for those businesses. The trade-off is honest: proper due diligence at the
            start, in exchange for an account that holds up. That is the whole proposition.
          </p>
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="How it is structured"
          title="We are not the regulated firm, and we say so"
          lede="Accounts are provided under the permissions of a UK-regulated payments partner. Knowing where that line sits is your right as a customer, so here it is in plain terms."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {split.map((column) => (
            <Card key={column.heading}>
              <h2 className="text-xl font-semibold">{column.heading}</h2>
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
        <SectionHeading
          eyebrow="How we work"
          title="Three things we will not do"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Promise you an account",
              body: "We introduce and support. The regulated partner decides. Anyone promising approval before the checks is selling you something they cannot deliver.",
            },
            {
              title: "Hide the price in the rate",
              body: "You will be quoted a fee and a margin before you commit. If you would rather compare against what you pay now, bring a real transaction and we will price that one.",
            },
            {
              title: "Take business we cannot bank",
              body: "If your trade is outside appetite, we will tell you at the first conversation. Wasting three weeks of your time to find out is not a service.",
            },
          ].map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Come and tell us about the business
          </h2>
          <p className="mt-5 text-base leading-relaxed text-on-ink/70">
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
