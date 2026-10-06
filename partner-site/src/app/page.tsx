import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { brand, currencies } from "@/lib/brand";
import { solutions } from "@/content/solutions";
import { pillars } from "@/content/site";
import { tierSummary } from "@/content/pricing";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";
import { RatePills } from "@/components/RatePills";
import { CurrencyLive } from "@/components/CurrencyLive";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { TrustBar } from "@/components/TrustBar";
import { PaymentFlowCard } from "@/components/PaymentFlowCard";
import { DashboardPreview } from "@/components/DashboardPreview";
import { CurrencyMarquee } from "@/components/CurrencyMarquee";
import { WhatYouCanDo } from "@/components/WhatYouCanDo";
import { SpreadCalculator } from "@/components/SpreadCalculator";
import { GetStarted } from "@/components/GetStarted";
import { Flag } from "@/components/Flag";
import { IconTile } from "@/components/IconTile";
import { Illustration } from "@/components/Illustration";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};





export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero-blue relative overflow-hidden">
        <GlobeBackdrop />
        {/* Positioned against the band, not the card — see RatePills. */}
        <RatePills />
        <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
            <div>
              {/* CAREFUL. This badge cannot say "FCA regulated" on its own,
                  because OvaroPay is not: it introduces customers to the
                  provider, who holds the permission. Claiming authorisation you do
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

              <dl className="hero-stat mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 pt-8 sm:grid-cols-3">
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

            <div className="relative lg:pl-4">
              <PaymentFlowCard />
            </div>
          </div>

          <p className="relative mt-14 text-xs text-muted">
            Exchange rates are live mid-market reference rates from the European Central Bank,
            not a quote. Amounts and activity shown here are illustrative.
          </p>
        </div>
      </section>

      <TrustBar />

      {/* Pricing, high up on purpose. It used to be a page with no rate card
          at all and an invitation to ask; it is now published, and the first
          thing most people want from this page is the number. */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Three numbers, and they are all published
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              A monthly fee, a charge for each payment, and a margin on anything you convert. The
              charges fall and the margin tightens as the volume goes up, and the whole rate card
              is on one page rather than behind a conversation.
            </p>
            <Link href="/pricing" className="btn btn-primary mt-8">
              See the full rate card
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {tierSummary.map((tier) => (
              <Card key={tier.name} className="p-5">
                <p className="text-sm font-semibold">{tier.name}</p>
                <p className="font-display mt-2 text-3xl font-semibold tracking-tight">
                  {tier.monthly}
                </p>
                <p className="mt-1 text-xs text-muted">a month, ex VAT</p>
                <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Conversion</dt>
                    <dd className="font-mono font-semibold">{tier.fx}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Faster Payment</dt>
                    <dd className="font-mono font-semibold">{tier.faster}</dd>
                  </div>
                </dl>
              </Card>
            ))}
          </div>
        </div>
      </Section>


      {/* Currencies — brought up from the middle of the page. It used to sit
          ninth, behind three sections of prose. It is the first thing anybody
          actually wants to know and it is the section with the most to look
          at, so it goes first. */}
      <Section tone="surface">
        <SectionHeading
          center
          eyebrow="Currencies"
          title={`${currencies.length} currencies, one account`}
          lede="Money in, the currency in between, and money out — with the rate shown before you commit rather than after."
        />

        {/* The card and the globe beside it share one piece of state, so the
            arc goes where the payment goes. */}
        <div className="mt-14">
          <CurrencyLive />
        </div>
      </Section>

      {/* Its own white band. The marquee draws no background of its own, and
          the sections either side are both tone="surface", so without this it
          reads as one long grey block with a gap in it. */}
      <div className="border-y border-border bg-background py-8">
        <CurrencyMarquee />
      </div>

      {/* What the account does. This was two sections — "What you can do" and
          "Pillars" — that opened with the same idea in different words. One
          section, one heading, both pieces of evidence under it. */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow="What the account does"
            title="Three things, and they are your whole working week"
            lede="Money in from your buyers, currency converted, money out to your suppliers. That is the product."
          />
          <Illustration name="money-sending" className="w-full" />
        </div>

        <div className="mt-12">
          <WhatYouCanDo />
        </div>

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
            How the account works in practice &rarr;
          </Link>
        </div>
      </Section>

      {/* Money out. Replaces the four-card Solutions grid, which repeated on
          the home page what the Solutions pages already say at length. A
          photograph, four lines, and a link to the pages themselves. */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Image
            src="/images/payroll-review.webp"
            alt="A payroll run being checked line by line."
            width={1600}
            height={1066}
            sizes="(min-width: 1024px) 32rem, 100vw"
            className="w-full rounded-2xl border border-border object-cover"
          />
          <div>
            <Eyebrow>Money out</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Suppliers, contractors and the people on your payroll
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              The same account pays an invoice in Shenzhen, a contractor in Warsaw and a monthly
              payroll run, in the currency each of them actually wants. One file, one set of
              checks, one place to look afterwards when somebody asks whether it went.
            </p>
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {solutions.map((solution) => (
                <li key={solution.slug} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  <Link
                    href={`/solutions/${solution.slug}`}
                    className="font-medium underline-offset-4 hover:text-accent-2 hover:underline"
                  >
                    {solution.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/solutions" className="btn btn-ghost mt-8">
              All four, in detail
            </Link>
          </div>
        </div>
      </Section>

      {/* Dashboard */}
      <Section>
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

      {/* The cost of a bad rate. The ink "Pricing" band that used to follow
          this said the same thing a second time and ended in the same button,
          so it has gone; its four pricing lines live on /business-accounts. */}
      <Section tone="surface">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          <div>
            <Eyebrow>The cost of a bad rate</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Two and a half percent does not sound like much
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              It is charged on everything you convert, every month, and it is almost always taken
              inside the rate rather than shown as a fee — which is why most importers have never
              been told the number.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Put in what you convert in a month and see what the margin actually takes out.
              The figures are arithmetic, not a quote.
            </p>
            <Link href="/contact" className="btn btn-primary mt-8">
              Price one real transaction
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
          <div className="reveal">
            <SpreadCalculator />
          </div>
        </div>
      </Section>

      {/* Getting started */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow="Getting started"
            title="Three steps, and none of them are a surprise"
            lede="No account is opened without proper checks. Knowing what they are up front is what makes them quick."
          />
          {/* The warehouse shot that was here showed the customer, not this
              section: Getting started is about the conversation with us, so
              it is a desk and a person rather than a loading aisle. It was
              also dim and busy against a white band. */}
          <Image
            src="/images/adviser-desk.webp"
            alt="Someone going through the detail of an account application at a desk."
            width={960}
            height={640}
            sizes="(min-width: 1024px) 34rem, 100vw"
            className="w-full rounded-2xl border border-border object-cover"
          />
        </div>
        <div className="mt-14">
          <GetStarted />
        </div>
        <div className="mt-12 text-center">
          <Link href="/opening-an-account" className="btn btn-ghost">
            What the file needs to contain
          </Link>
        </div>
      </Section>


      {/* The ask. Was two sections — a centred ink panel saying "send us one
          real conversion" and then an enquiry form saying the same thing
          beside the box you say it in. One section, one ask. */}
      <Section
        id="enquiry"
        tone="ink"
        backdrop={{ src: "/images/container-terminal.webp", position: "center 45%" }}
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Get started</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Send us one real conversion
            </h2>
            <p className="mt-5 text-base leading-relaxed text-on-ink/75">
              The amount, the currency and what you were charged. We will price the same
              transaction beside it, and you will know within a day whether this is worth your
              time.
            </p>
            <p className="mt-4 text-base leading-relaxed text-on-ink/75">
              Or just tell us the shape of the business: what you import, roughly what comes in
              each month, and what currency goes out.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <p>
                <span className="text-on-ink/60">Email </span>
                <a href={`mailto:${brand.email}`} className="font-semibold hover:text-accent">
                  {brand.email}
                </a>
              </p>
            </div>
            <Link href="/business-accounts" className="btn btn-on-ink mt-6">
              See how it works
            </Link>
          </div>
          {/* text-foreground on purpose. The band is tone="ink", which sets
              light type on everything inside it, and .card only changes the
              background — so without this the form would be white-on-white. */}
          <div className="card p-6 text-foreground sm:p-8">
            <EnquiryForm source="Home page" />
          </div>
        </div>
      </Section>
    </>
  );
}
