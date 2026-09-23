import Link from "next/link";
import type { Metadata } from "next";
import { brand, currencies } from "@/lib/brand";
import { sectors } from "@/content/sectors";
import { solutions } from "@/content/solutions";
import { pillars, faqs } from "@/content/site";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";
import { RatePills } from "@/components/RatePills";
import { CurrencyShowcase } from "@/components/CurrencyShowcase";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { FaqJsonLd } from "@/components/StructuredData";
import { TrustBar } from "@/components/TrustBar";
import { PaymentFlowCard } from "@/components/PaymentFlowCard";
import { DashboardPreview } from "@/components/DashboardPreview";
import { CurrencyMarquee } from "@/components/CurrencyMarquee";
import { WhatYouCanDo } from "@/components/WhatYouCanDo";
import { CurrencyChip } from "@/components/CurrencyChip";
import { Flag } from "@/components/Flag";
import { IconTile } from "@/components/IconTile";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const problems = [
  {
    icon: "block",
    title: "Declined on the category, not the company",
    body: "Whole sectors get turned away at onboarding because a bank has decided the category is too much work. It is rarely about what your business is actually doing.",
  },
  {
    icon: "alert",
    title: "Offboarded a year in",
    body: "An account that worked fine suddenly closes with two months’ notice and no explanation, and the search starts again from nothing.",
  },
  {
    icon: "search",
    title: "Paying for FX without seeing the price",
    body: "Two and a half to three percent is common, buried in the rate rather than shown as a fee. Most importers have never been quoted the number.",
  },
  {
    icon: "clock",
    title: "Payments held every time one is large",
    body: "A supplier invoice for six figures triggers a review, the container waits, and the relationship with the supplier pays for it.",
  },
];

const reasons = [
  {
    icon: "building",
    title: "The account is in your company name",
    body: "Named, not shared. Your retailers pay into your company, and your suppliers see who is paying them.",
  },
  {
    icon: "shield",
    title: "Onboarded properly, not waved through",
    body: "Real due diligence at the start, on the understanding that yours is a legitimate trading business. That is what makes an account that stays open.",
  },
  {
    icon: "chart",
    title: "A rate you are quoted before you commit",
    body: "You can price a purchase order against a rate you have been given. You cannot price one against a rate you find out afterwards.",
  },
  {
    icon: "handshake",
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
        <GlobeBackdrop />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
            <div>
              {/* CAREFUL. This badge cannot say "FCA regulated" on its own,
                  because OvaroPay is not: it introduces customers to CoBanq
                  Ltd, who holds the permission. Claiming authorisation you do
                  not hold is the one thing the FCA acts on fastest. Once
                  OvaroPay is on the register in its own right, this can become
                  the shorter claim — and `brand.provider.model` should change
                  with it. */}
              <span className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-xs font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent" fill="none" aria-hidden="true">
                    <path
                      d="M12 2.75 4.75 5.6v5.4c0 4.2 2.9 8.1 7.25 10.25C16.35 19.1 19.25 15.2 19.25 11V5.6Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 11.75 2.1 2.1L15 10"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                FCA-authorised provider
              </span>

              <h1 className="font-display mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4rem]">
                Collect. Convert.
                <span className="accent-gradient-text block">Pay your suppliers.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                A business payment account in your own company name. Take money in from your UK
                retailers, convert it into the currency your supplier invoices in, and send it out
                the same day — without a letter asking what the money is for every time a big one
                lands.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn btn-primary">
                  Talk to us about an account
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link href="/business-accounts" className="btn btn-ghost">
                  See how it works
                </Link>
              </div>

              <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-muted">Account name</dt>
                  <dd className="mt-1 text-base font-semibold">Your company&rsquo;s</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Pay out in</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono text-base font-semibold">
                    {currencies.slice(0, 4).map((currency) => (
                      <span key={currency.code} className="flex items-center gap-1.5">
                        <Flag code={currency.iso} className="h-3 w-[18px]" />
                        {currency.code}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Currencies</dt>
                  <dd className="mt-1 text-base font-semibold">
                    {currencies.length} on one account
                  </dd>
                </div>
              </dl>
            </div>

            {/* The card, with the activity pills surfacing around it. */}
            <div className="relative lg:pl-4">
              <PaymentFlowCard />
              <RatePills />
            </div>
          </div>

          <p className="relative mt-14 text-xs text-muted">
            Figures, rates and activity shown here are illustrative, not a live feed.
          </p>
        </div>
      </section>

      <TrustBar />

      {/* What you can do — one panel per line, turning on its own. */}
      <Section>
        <SectionHeading
          center
          title={`What you can do with ${brand.shortName}`}
        />
        <div className="mt-12">
          <WhatYouCanDo />
        </div>
      </Section>

      {/* The problem */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="The problem"
          title="The high street has decided your sector is too much work"
          lede="Not because you are doing anything wrong. Because a blanket risk appetite is cheaper to run than a proper look at an import business. Meanwhile the money still has to move."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {problems.map((problem, index) => (
            <Card key={problem.title}>
              <IconTile name={problem.icon} tone={index === 0 ? 6 : index + 4} />
              <h3 className="mt-5 text-lg font-semibold">{problem.title}</h3>
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
              <div className="flex items-center gap-3">
                <IconTile name={pillar.icon} tone={index + 1} />
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{pillar.title}</h3>
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

      {/* Solutions */}
      <Section>
        <SectionHeading
          eyebrow="Solutions"
          title="Three lines, one account"
          lede="Money in from your customers, currency converted, money out to suppliers, contractors or staff. Each runs on the same account, in your own company name."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {solutions.map((solution, index) => (
            <Card key={solution.slug} className="flex flex-col">
              <div className="flex items-center gap-3">
                <IconTile name={solution.icon} tone={index + 2} />
                <span className="font-mono text-xs text-muted">0{index + 1}</span>
              </div>
              <h3 className="font-display mt-5 text-xl font-semibold">{solution.name}</h3>
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
      </Section>

      {/* Sectors */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="Who we serve"
          title="Built around the trades we know"
          lede="Import and distribute, run a large payroll, or invoice clients abroad. If money moves across a border and a bank has made that harder than it needs to be, the account fits."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {sectors.map((sector, index) => (
            <Card key={sector.slug} className="flex flex-col">
              <IconTile name={sector.icon} tone={index + 1} />
              <h3 className="mt-5 text-lg font-semibold">{sector.longName}</h3>
              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{sector.intro}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {sector.currencies.map((currency) => (
                  <CurrencyChip key={currency} code={currency} tone="soft" className="px-2.5 py-1" />
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
          {reasons.map((reason, index) => (
            <Card key={reason.title}>
              <IconTile name={reason.icon} tone={index + 1} />
              <h3 className="mt-5 text-lg font-semibold">{reason.title}</h3>
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
                  className="rounded-xl border border-border bg-card px-4 py-3.5 font-medium"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </Section>

      {/* Currencies */}
      <Section tone="surface">
        <SectionHeading
          center
          eyebrow="Currencies"
          title="The currencies you can hold, convert and pay in"
          lede="Eleven foreign currencies alongside sterling, on one account in your own company name."
        />
        <div className="reveal mt-14">
          <CurrencyShowcase />
        </div>
        <div className="mt-16">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Where the money lands
          </p>
          <CurrencyMarquee />
        </div>
      </Section>

      {/* Dashboard */}
      <Section tone="surface">
        <SectionHeading
          center
          eyebrow="The platform"
          title={`See your ${brand.shortName} dashboard`}
          lede="One place to track balances, send payments, convert between currencies and manage the account."
        />
        <div className="mt-12">
          <DashboardPreview />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted">
          Illustrative preview — figures and account details are placeholders, not a real customer
          account.
        </p>
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
          <div className="card p-6 sm:p-8">
            <EnquiryForm source="Home page" />
          </div>
        </div>
      </Section>
    </>
  );
}
