import Link from "next/link";
import type { Metadata } from "next";
import { brand, currencies } from "@/lib/brand";
import { sectors } from "@/content/sectors";
import { pillars, faqs } from "@/content/site";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { FaqJsonLd } from "@/components/StructuredData";
import { TrustBar } from "@/components/TrustBar";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const problems = [
  {
    title: "Declined on the category, not the company",
    body: "Whole sectors get turned away at onboarding because a bank has decided the category is too much work. It is rarely about what your business is actually doing.",
  },
  {
    title: "Offboarded a year in",
    body: "An account that worked fine suddenly closes with two months’ notice and no explanation, and the search starts again from nothing.",
  },
  {
    title: "Paying for FX without seeing the price",
    body: "Two and a half to three percent is common, buried in the rate rather than shown as a fee. Most importers have never been quoted the number.",
  },
  {
    title: "Payments held every time one is large",
    body: "A supplier invoice for six figures triggers a review, the container waits, and the relationship with the supplier pays for it.",
  },
];

const reasons = [
  {
    title: "The account is in your company name",
    body: "Named, not shared. Your retailers pay into your company, and your suppliers see who is paying them.",
  },
  {
    title: "Onboarded properly, not waved through",
    body: "Real due diligence at the start, on the understanding that yours is a legitimate trading business. That is what makes an account that stays open.",
  },
  {
    title: "A rate you are quoted before you commit",
    body: "You can price a purchase order against a rate you have been given. You cannot price one against a rate you find out afterwards.",
  },
  {
    title: "Someone who knows what you import",
    body: "We deal with importers and wholesalers all day. Nobody here needs the trade explained from the beginning.",
  },
];

export default function Home() {
  return (
    <>
      <FaqJsonLd faqs={faqs} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            <Eyebrow>For UK importers, wholesalers and distributors</Eyebrow>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Collect. Convert.{" "}
              <span className="accent-gradient-text">Pay your suppliers.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              A business payment account in your own company name. Take money in from your UK
              retailers, convert it into the currency your supplier invoices in, and send it out the
              same day — without a letter asking what the money is for every time a big one lands.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
              >
                Talk to us about an account
              </Link>
              <Link
                href="/business-accounts"
                className="rounded-full border border-border bg-background px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:border-accent"
              >
                See how it works
              </Link>
            </div>

            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-muted">Account name</dt>
                <dd className="mt-1 text-base font-semibold">Your company&rsquo;s</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Pay out in</dt>
                <dd className="mt-1 text-base font-semibold">{currencies.slice(0, 4).join(" · ")}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Licence and compliance</dt>
                <dd className="mt-1 text-base font-semibold">UK-regulated partner</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* The problem */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="The problem"
          title="The high street has decided your sector is too much work"
          lede="Not because you are doing anything wrong. Because a blanket risk appetite is cheaper to run than a proper look at an import business. Meanwhile the money still has to move."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {problems.map((problem) => (
            <Card key={problem.title}>
              <h3 className="text-lg font-semibold">{problem.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{problem.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Pillars */}
      <Section>
        <SectionHeading
          eyebrow="What the account does"
          title="Three things, and they are your whole working week"
          lede="Money in from your buyers, currency converted, money out to your suppliers. That is the product. Everything else on this page is detail underneath it."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Card key={pillar.title} className="flex flex-col">
              <span className="font-mono text-xs text-accent">0{index + 1}</span>
              <h3 className="mt-3 text-xl font-semibold">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/business-accounts"
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            How the account works in practice →
          </Link>
        </div>
      </Section>

      {/* Sectors */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="Who we serve"
          title="Built around four kinds of business"
          lede="Import and distribute, or run a large payroll. If money comes in from a spread of UK customers and goes out in volume, the account fits."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {sectors.map((sector) => (
            <Card key={sector.slug} className="flex flex-col">
              <h3 className="text-lg font-semibold">{sector.longName}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{sector.intro}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
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
                {sector.name} accounts →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      {/* Pricing posture */}
      <Section tone="ink">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us what you pay now, and we will price the same transaction next to it
            </h2>
            <p className="mt-5 text-base leading-relaxed text-on-ink/70">
              There is no rate card on this page, and that is deliberate. The number that matters is
              not ours in isolation — it is the difference between ours and what is coming out of your
              account today. Most importers have never been shown that figure.
            </p>
            <p className="mt-4 text-base leading-relaxed text-on-ink/70">
              Bring one real conversion. A recent supplier payment, the amount, the currency, and what
              you were charged. We will quote the same one.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              Price one transaction
            </Link>
          </div>
          <ul className="space-y-4">
            {[
              "A fee on funds received, quoted up front.",
              "A margin on conversion, quoted before you commit.",
              "Payout fees per the current rate card, confirmed when we quote.",
              "Reviewed at three months, when we both know what the real volume is.",
            ].map((line) => (
              <li
                key={line}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-on-ink/85"
              >
                <span className="mt-0.5 text-accent" aria-hidden="true">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Why us */}
      <Section>
        <SectionHeading
          eyebrow="Why this works"
          title="What is different is the onboarding, not the marketing"
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {reasons.map((reason) => (
            <Card key={reason.title}>
              <h3 className="text-lg font-semibold">{reason.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{reason.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Software teaser */}
      <Section tone="surface">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Eyebrow>The other side of the business</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Already licensed? We sell the platform to run on.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              If you hold your own SPI or API permission, you do not need our licence — you need the
              technology. A customer web portal, iOS and Android apps, and an admin back end, shipped
              already integrated with payment processing, KYC and payouts.
            </p>
            <Link
              href="/software"
              className="mt-7 inline-flex rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent"
            >
              See the platform
            </Link>
          </div>
          <ul className="grid gap-3 text-sm">
            {["Customer web portal", "iOS and Android apps", "Admin back end", "Live demo, in person"].map(
              (item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border bg-background px-4 py-3.5 font-medium"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </Section>

      {/* FAQs */}
      <Section>
        <SectionHeading eyebrow="Questions" title="The ones we get asked first" />
        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-base font-semibold">
                {faq.question}
                <span
                  className="mt-1 shrink-0 text-muted transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* Enquiry */}
      <Section tone="surface" id="enquiry">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Get started</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Send us the shape of the business
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              What you import, roughly what comes in each month, and what currency goes out. That is
              enough for us to tell you whether we are the right fit and what it would cost — usually
              the same day.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <p>
                <span className="text-muted">Call </span>
                <a href={`tel:${brand.phoneE164}`} className="font-semibold hover:text-accent">
                  {brand.phoneDisplay}
                </a>
              </p>
              <p>
                <span className="text-muted">Email </span>
                <a href={`mailto:${brand.email}`} className="font-semibold hover:text-accent">
                  {brand.email}
                </a>
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <EnquiryForm source="Home page" />
          </div>
        </div>
      </Section>
    </>
  );
}
