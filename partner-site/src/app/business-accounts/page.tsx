import Link from "next/link";
import type { Metadata } from "next";
import { currencies } from "@/lib/brand";
import { CurrencyChip } from "@/components/CurrencyChip";
import { pillars } from "@/content/site";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";

export const metadata: Metadata = {
  title: "Business payment accounts for UK importers",
  description:
    "A named business account that collects from your UK buyers, converts into USD, AED, HKD and EUR, and pays your overseas suppliers the same day.",
  alternates: { canonical: "/business-accounts" },
};

const collect = [
  "Payments in from your UK retailers and trade customers, into an account in your own company name.",
  "A long tail of smaller buyers without each one being treated as an exception.",
  "Payment references that make sense on a statement, so reconciliation is not detective work.",
];

const convert = [
  "Sterling into the currency your supplier actually invoices in.",
  "A rate quoted before you commit, so a purchase order can be priced properly.",
  "No hidden spread dressed up as a free transfer.",
];

const pay = [
  "Payments out to suppliers in China, Hong Kong, the UAE and across Europe.",
  "Same-day where the corridor and cut-off allow it.",
  "Bulk payouts where the business runs on volume rather than value — payroll, agents, drivers.",
];

const notIncluded = [
  {
    title: "It is not a bank account",
    body: "There is no lending and no overdraft. Customer funds are safeguarded rather than lent on, which is a different kind of protection — and for most importers, the more relevant one.",
  },
  {
    title: "It is not instant",
    body: "Proper onboarding takes a proper file. Businesses that want an account opened this afternoon with a photo of a driving licence are better served elsewhere, and usually find out why within the year.",
  },
  {
    title: "It is not guaranteed",
    body: "Compliance runs the checks and makes the decision, and that happens after you apply, not before. Anyone telling you the answer up front is guessing.",
  },
];

export default function BusinessAccountsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Business accounts", path: "/business-accounts" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>Business accounts</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            One account for money in, currency, and money out
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Most importers run this across three providers: a bank that takes the money in, a broker
            for the currency, and whatever will send the payment abroad. Every handover is a delay, a
            fee, and another place for a payment to stop. This is the three in one place.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Card key={pillar.title}>
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <h2 className="mt-3 text-xl font-semibold">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.body}</p>
              <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-muted">
                {[collect, convert, pay][index].map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Currencies"
          title="The ones our customers actually pay in"
          lede="If your supplier invoices in something not on this list, ask. The list behind the account is longer than the one on this page."
        />
        <div className="mt-10 flex flex-wrap gap-3">
          {currencies.map((currency) => (
            <CurrencyChip
              key={currency.code}
              code={currency.code}
              name={currency.name}
              className="!rounded-xl px-4 py-3"
            />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Straight answers"
          title="What this is not"
          lede="Worth saying plainly, because the businesses we deal with have been told otherwise before and it cost them."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {notIncluded.map((item) => (
            <Card key={item.title}>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-surface p-6">
          <RegulatoryNote />
        </div>
      </Section>

      <Section tone="ink">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to see what it would cost you?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-on-ink/70">
            Bring one real supplier payment — the amount, the currency and what you were charged. We
            will price the same transaction and you can compare the two.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              Talk to us
            </Link>
            <Link
              href="/opening-an-account"
              className="rounded-full border border-white/20 px-6 py-3.5 text-center text-sm font-semibold text-on-ink transition-colors hover:border-accent"
            >
              What we need to open one
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
