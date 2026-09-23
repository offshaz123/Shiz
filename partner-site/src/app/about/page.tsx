import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { RegulatoryNote } from "@/components/RegulatoryNote";
import { IconTile } from "@/components/IconTile";
export const metadata: Metadata = {
  title: "About us",
  description: `Who ${brand.name} is, who provides the regulated payment services, and where the line between the two sits.`,
  alternates: { canonical: "/about" },
};


/**
 * About us.
 *
 * DO NOT NAME THE PROVIDER ON THIS PAGE. The arrangement is described in full
 * — introducer, an FCA-authorised institution behind it, what each side does,
 * how the money is protected — but the counterparty is not named here.
 *
 * It is named in the footer disclosure on every page, and in the privacy
 * notice where data protection law requires the controller to be identified.
 * That is where the obligation actually sits, and it is how every white-label
 * and introducer brand in this market handles it. A prospect who reads the
 * provider's name on an About page can go to the provider direct, and then
 * there is no business here.
 *
 * The page's job is to build trust in us: what we do, who we do it for, and
 * the things we will not do.
 */
const split = [
  {
    icon: "handshake",
    heading: `What ${brand.name} does`,
    items: [
      "Finds the businesses the high street will not serve properly, and understands the trade.",
      "Prices the account against what you are paying today.",
      "Prepares the application with you, so the file goes in complete first time.",
      "Runs the day-to-day relationship, and answers the phone.",
    ],
  },
  {
    icon: "shield",
    heading: "What the regulated firm does",
    items: [
      "Holds the FCA authorisation and the permissions the service runs on.",
      "Runs the identity, anti-money-laundering and source-of-funds checks, and decides every application.",
      "Provides the accounts, the currency conversion and the payout network.",
      "Provides the platform you log into, and monitors accounts on an ongoing basis.",
    ],
  },
];

/** How the money is protected, in the three sentences people actually ask. */
const protection = [
  {
    label: "Who is authorised",
    value: "The provider, not us",
    note: "The firm behind the account holds the FCA permission. We introduce you to it.",
  },
  {
    label: "Where your money sits",
    value: "Safeguarded",
    note: "In segregated accounts, separate from the firm's own money, until it reaches your beneficiary.",
  },
  {
    label: "What we are not",
    value: "Not a bank",
    note: "No lending, no overdraft, and we never hold your money ourselves.",
  },
];

const benefits = [
  {
    icon: "wallet",
    title: "Twelve currencies, one account",
    body: "Hold balances in the currencies you actually trade in, alongside sterling, on an account in your own company name.",
  },
  {
    icon: "chart",
    title: "The price shown, not buried",
    body: "A fee and a margin quoted before you commit, rather than a rate you work out afterwards by looking at what arrived.",
  },
  {
    icon: "building",
    title: "Named, not shared",
    body: "Your customers pay your company. No shared client accounts, no payment references doing the work a company name should do.",
  },
  {
    icon: "clock",
    title: "Same day where it is possible",
    body: "Supplier invoices settled the same day where the corridor and cut-off allow, instead of sitting in a queue while somebody decides.",
  },
];

const principles = [
  {
    icon: "block",
    title: "We never promise you an account",
    body: "The decision comes after the checks, and it is not ours to make. Anyone promising approval before that is selling you something they cannot deliver.",
  },
  {
    icon: "search",
    title: "We do not hide the price in the rate",
    body: "You are quoted a fee and a margin before you commit. If you would rather compare against what you pay now, bring one real transaction and we will price that one.",
  },
  {
    icon: "alert",
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
          <h1 className="font-display text-balance mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Payments for the businesses the high street stopped serving
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            There is a large, profitable part of British trade that mainstream banks have quietly
            withdrawn from. Not fraudsters — importers, wholesalers, distributors and independent
            professionals turning over real money, declined at onboarding or offboarded a year
            later because a whole category was judged too much work.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We exist for those businesses. The trade-off is an honest one: proper due diligence at
            the start, in exchange for an account that holds up afterwards. That is the whole
            proposition, and everything below is how it is put together.
          </p>
        </div>
      </Section>

      {/* The model, in one paragraph, before anyone has to ask. */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="How this works"
          title="Two firms, and you should know which is which"
          lede={`${brand.name} is an introducer. We work with an established, FCA-authorised payment institution, which means you deal with us — our name, our people, our service — while the authorisation, the accounts, the currency and the payout network come from the regulated firm behind it. It is a deliberate arrangement rather than an accident of wording, and this is where the line falls.`}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {split.map((column, index) => (
            <Card key={column.heading}>
              <IconTile name={column.icon} tone={index === 0 ? 1 : 2} />
              <h2 className="font-display mt-5 text-xl font-semibold">{column.heading}</h2>
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
      </Section>

      {/* How the money is protected. The provider is not named here — see the
          note at the top of this file. */}
      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div>
            <Eyebrow>Regulation and your money</Eyebrow>
            <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Who is authorised, and what happens to your money
            </h2>

            <div className="mt-6 space-y-4 text-base leading-relaxed text-on-ink/70">
              <p>
                The payment services behind the account are provided by an established institution
                authorised and regulated by the Financial Conduct Authority under the Payment
                Services Regulations 2017. Its name, its firm reference number and its registered
                office appear in the footer of every page on this site.
              </p>
              <p>
                In line with those regulations, funds paid into the account are safeguarded: held
                in segregated accounts, separate from the firm&rsquo;s own money, until they are
                paid out to your beneficiary. If you ever want a breakdown of where your money is
                sitting, ask and you will be told.
              </p>
              <p>
                {brand.name} is not a bank, is not itself authorised, and never holds your money.
                It introduces you to the firm that does. For a regulatory or compliance question,
                write to {brand.email} and it will go to the right people.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur sm:p-8">
            <dl className="space-y-7">
              {protection.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs uppercase tracking-wide text-on-ink/50">{item.label}</dt>
                  <dd className="font-display mt-1.5 text-xl font-semibold">{item.value}</dd>
                  <p className="mt-1.5 text-xs leading-relaxed text-on-ink/60">{item.note}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="What you get"
          title="What the account is actually for"
          lede="Four things, and they are the reason the arrangement above is worth having rather than an interesting piece of structure."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {benefits.map((item, index) => (
            <Card key={item.title}>
              <IconTile name={item.icon} tone={index + 1} />
              <h3 className="font-display mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface">
        <SectionHeading
          eyebrow="How we work"
          title="Three things we will not do"
          lede="Every payments company says it is transparent. These are the specific things that claim rules out for us."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {principles.map((item, index) => (
            <Card key={item.title}>
              <IconTile name={item.icon} tone={index + 4} />
              <h3 className="font-display mt-5 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>

        <div className="card mt-10 max-w-3xl p-6">
          <RegulatoryNote />
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
