import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, SectionHeading, Eyebrow, Card } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Remittance software for licensed MSBs",
  description:
    "A ready-built remittance platform for UK money service businesses that already hold an SPI or API licence: customer web portal, iOS and Android apps, and an admin back end, shipped already integrated.",
  keywords: [
    "remittance software UK",
    "MSB software platform",
    "money transfer software white label",
    "SPI API licence software",
  ],
  alternates: { canonical: "/software" },
};

const modules = [
  {
    title: "Customer web portal",
    body: "Your customers log in, are verified, and place transactions — in your brand, on your domain.",
  },
  {
    title: "iOS and Android apps",
    body: "The same thing on a phone, on both stores. For most remittance customers this is the only interface that matters.",
  },
  {
    title: "Admin back end",
    body: "The whole business in one place: transactions, customers, rates, limits and compliance, without a spreadsheet in sight.",
  },
];

const integrations = [
  { name: "Fena", role: "Payment processing" },
  { name: "Shufti Pro", role: "KYC and due diligence" },
  { name: "Didit", role: "KYC and due diligence" },
  { name: "Daytona", role: "Payouts" },
];

const extras = [
  "Google Ads and Meta Ads management",
  "Web and app development",
  "SEO",
];

export default function SoftwarePage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Software for MSBs", path: "/software" },
        ]}
      />

      <Section>
        <div className="max-w-3xl">
          <Eyebrow>For licensed money service businesses</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            You have the licence. This is the technology to run it on.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            If you hold your own SPI or API permission, you are already allowed to operate. What
            usually stands in the way is software — and building a portal, two mobile apps and a
            compliant back office yourself costs six figures and the best part of a year.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            This is that platform, already built, already integrated, and branded as yours.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#demo"
              className="rounded-full bg-accent px-6 py-3.5 text-center text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              Book a live demo
            </Link>
            <a
              href={`mailto:${brand.email}`}
              className="rounded-full border border-border bg-background px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:border-accent"
            >
              Email {brand.email}
            </a>
          </div>
        </div>
      </Section>


      {/* Stat row */}
      <div className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Package", value: "Portal + 2 apps", note: "and the admin back end" },
            { label: "Stores", value: "iOS & Android", note: "both covered" },
            { label: "Integrations", value: "Shipped connected", note: "processing, KYC and payouts" },
            { label: "Demo", value: "In person", note: "we come to you" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {stat.label}
              </p>
              <p className="font-display mt-2.5 text-2xl font-semibold leading-tight">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted">{stat.note}</p>
            </div>
          ))}
        </div>
      </div>

      <Section tone="surface">
        <SectionHeading eyebrow="What you get" title="Three pieces, one platform" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.title}>
              <h2 className="text-xl font-semibold">{module.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{module.body}</p>
            </Card>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted">
          The package is the web portal, the two apps and the admin back end. Anything beyond that —
          a bespoke integration, a corridor-specific flow, an agent network module — is quoted
          separately.
        </p>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Already integrated"
          title="Not a shell you have to wire up yourself"
          lede="The providers you would otherwise go and integrate one at a time are connected on day one. If you have ever priced that work, you already know what it is worth."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {integrations.map((integration) => (
            <Card key={integration.name}>
              <h3 className="text-lg font-semibold">{integration.name}</h3>
              <p className="mt-2 text-sm text-muted">{integration.role}</p>
            </Card>
          ))}
        </div>
      </Section>


      {/* Who it is for */}
      <Section tone="surface">
        <SectionHeading
          eyebrow="Who it is for"
          title="Firms that hold the permission but not the technology"
          lede="Every authorised and registered payment firm in the UK is on the FCA register, publicly, with an address. That is where these conversations start."
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {[
            {
              name: "Small payment institutions",
              body: "An SPI or API licence already in hand, and a build quote that runs to six figures and a year.",
            },
            {
              name: "High-street money transfer shops",
              body: "Licensed, trading, and running on very little technology — often spreadsheets and paper.",
            },
            {
              name: "Firms outgrowing what they have",
              body: "A platform they complain about, a paper agent network, or a corridor they cannot support yet.",
            },
          ].map((item) => (
            <Card key={item.name}>
              <h3 className="font-display text-lg font-semibold">{item.name}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="ink">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {brand.software.showPricing
                ? `From ${brand.software.setupFrom} to set up, ${brand.software.monthlyFrom} a month to run`
                : "Priced against your volume and your requirements"}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-on-ink/70">
              {brand.software.showPricing
                ? "Setup covers branding, configuration and go-live. The monthly licence covers hosting, use and support. Where the requirements are heavier than the standard package, we price them before you commit — not afterwards."
                : "Setup covers branding, configuration and go-live; the monthly licence covers hosting, use and support. We quote once we know the volume and the requirements."}
            </p>
            <p className="mt-4 text-base leading-relaxed text-on-ink/70">
              Compare that against a build: two mobile apps, a portal, a back office, and four
              integrations you would have to negotiate and maintain yourself.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Always demonstrated in person</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-ink/70">
              We do not try to sell this over email. We come to you, put the app on a phone in front
              of you, open the admin back end, and run a transaction through it end to end. Then you
              decide.
            </p>
            <Link
              href="#demo"
              className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              Get a demo booked
            </Link>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Alongside the platform"
          title="The things every MSB needs anyway"
          lede="Once the software is live, the next question is always where the customers come from. We do that work too."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {extras.map((extra) => (
            <Card key={extra}>
              <h3 className="text-base font-semibold">{extra}</h3>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="surface" id="demo">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Book a demo</Eyebrow>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us what you are running on today
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              Whether that is a platform you are unhappy with, a set of spreadsheets, or a paper
              agent network — it is the most useful thing you can tell us before we come out. Choose
              &ldquo;money service business&rdquo; in the form and we will arrange a time.
            </p>
          </div>
          <div className="card p-6 sm:p-8">
            <EnquiryForm source="Software page" submitLabel="Request a demo" />
          </div>
        </div>
      </Section>
    </>
  );
}
