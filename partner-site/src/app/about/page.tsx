import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { IconTile } from "@/components/IconTile";

export const metadata: Metadata = {
  title: "About us",
  description: `Who ${brand.name} is, who we build accounts for, and how we work.`,
  alternates: { canonical: "/about" },
};

/**
 * About us.
 *
 * THIS PAGE IS ABOUT US. Not about the arrangement behind the account.
 *
 * The partnership gets one block, near the top, in three short paragraphs —
 * that it is a white-label arrangement, that the institution behind it is
 * FCA-authorised, and what happens to the money. No name, no firm reference
 * number, no registered office, and no two-column "what we do / what they do"
 * comparison. The full disclosure lives in the footer of every page, which is
 * where the obligation sits and where every introducer brand in this market
 * keeps it.
 *
 * The reason is commercial, and it is not subtle: a reader who can name the
 * institution from this page can go to it directly, and then there is no
 * business here. Everything below that block is what we do, who for, and how.
 */
const benefits = [
  {
    icon: "wallet",
    title: "Multiple currencies, one account",
    body: "Hold, receive and convert twelve currencies on a single account in your own company name — so money can sit where you need it rather than being converted the moment it lands.",
  },
  {
    icon: "chart",
    title: "No margin hidden in the rate",
    body: "You are quoted a fee and a conversion rate before you commit, not after. Most businesses have never been shown what their current provider takes; we start by showing you.",
  },
  {
    icon: "clock",
    title: "Quick where it can be quick",
    body: "Supplier invoices settled the same day where the corridor and the cut-off allow it. Onboarding is the part that takes care, and we tell you up front what it needs.",
  },
  {
    icon: "building",
    title: "An account that stays open",
    body: "Proper due diligence at the start, on the understanding that yours is a legitimate trading business. That is what makes an account that is still there in two years.",
  },
];

const security = [
  {
    icon: "lock",
    title: "Your money, kept separate",
    body: "Funds paid into the account are safeguarded in segregated accounts, apart from the institution's own money, until they reach your beneficiary.",
  },
  {
    icon: "shield",
    title: "Checks that are done properly",
    body: "Full identity, anti-money-laundering and source-of-funds checks on every application. It is slower than a sign-up form, and it is the reason the account holds up.",
  },
  {
    icon: "search",
    title: "Monitoring that continues",
    body: "Accounts are monitored on an ongoing basis, not just at onboarding, which is how an unusual payment gets a phone call rather than a frozen balance.",
  },
  {
    icon: "document",
    title: "You can ask, and be told",
    body: "Where your money is, what a charge was for, why something was queried. If we cannot answer it ourselves we will get the answer.",
  },
];

const principles = [
  {
    icon: "block",
    title: "We never promise you an account",
    body: "The decision comes after the checks, and it is not ours to make. Anyone promising approval before that is selling you something they cannot deliver.",
  },
  {
    icon: "alert",
    title: "We do not hide the price in the rate",
    body: "A fee and a margin, quoted up front. If you would rather compare against what you pay now, bring one real transaction and we will price that one beside it.",
  },
  {
    icon: "handshake",
    title: "We turn down what cannot be banked",
    body: "If your trade is outside appetite you will hear it in the first conversation. Wasting three weeks of your time to find that out is not a service.",
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
          <Eyebrow>About us</Eyebrow>
          <h1 className="font-display text-balance mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Payments for the businesses the high street stopped serving
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            There is a large, profitable part of British trade that mainstream banks have quietly
            withdrawn from. Not fraudsters — importers, wholesalers, distributors and independent
            professionals turning over real money, declined at onboarding or offboarded a year later
            because a whole category was judged too much work.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {brand.name} was built for those businesses: an account in your own company name, money
            in from your customers, currency converted at a rate you were quoted, money out to your
            suppliers the same day. Run by people who know the trade and will pick up the phone.
          </p>
        </div>
      </Section>

      {/* The one block about the arrangement. Three paragraphs, no names. */}
      <Section tone="surface">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Our commitment"
            title="Secure, transparent payment services"
          />
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
            <p>
              We work with an established, FCA-authorised payment institution through a white-label
              partnership. In practice that means you deal with {brand.name} — our name, our people,
              our service — while the regulated infrastructure behind the account, the currency
              accounts, the liquidity and the compliance framework come from that institution.
            </p>
            <p>
              In line with the regulations, funds paid into your account are safeguarded. They are
              held in segregated accounts, apart from the institution&rsquo;s own money, and remain
              safeguarded until they are paid out to your beneficiary. If you ever want an exact
              breakdown of where your money is sitting, ask and you will be told.
            </p>
            <p>
              {brand.name} is not a bank and does not hold your money itself. The full regulatory
              detail — the institution, its authorisation and its firm reference number — is set out
              in the footer of every page on this site.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What you get"
          title="Built around how a trading business actually runs"
          lede="Not a feature list borrowed from a consumer app. Four things that change what a month looks like."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {benefits.map((item, index) => (
            <Card key={item.title}>
              <IconTile name={item.icon} tone={index + 1} />
              <h2 className="font-display mt-5 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="Security"
          title="Where the care goes"
          lede="The parts of this that are slow are slow on purpose. Here is what that buys."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {security.map((item, index) => (
            <Card key={item.title}>
              <IconTile name={item.icon} tone={index + 2} />
              <h2 className="font-display mt-5 text-base font-semibold">{item.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="How we work"
          title="Three things we will not do"
          lede="Every payments company calls itself transparent. These are the specific things that claim rules out for us."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((item, index) => (
            <Card key={item.title}>
              <IconTile name={item.icon} tone={index + 4} />
              <h2 className="font-display mt-5 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <div className="ink-tint relative overflow-hidden rounded-3xl px-6 py-16 text-center text-on-ink sm:px-12 sm:py-20">
          <div className="ledger-grid pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Come and tell us about the business
            </h2>
            <p className="mt-5 text-base leading-relaxed text-on-ink/70">
              We would rather have a fifteen-minute conversation about what you actually trade than
              send you a brochure.
            </p>
            <Link href="/contact" className="btn btn-primary mt-9">
              Get in touch
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
