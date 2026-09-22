import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { RegulatoryNote } from "@/components/RegulatoryNote";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to ${brand.name} about a business payment account, multi-currency accounts, global payroll, or the remittance platform for licensed MSBs.`,
  alternates: { canonical: "/contact" },
};

const iconClass = "h-5 w-5";

/**
 * Three routes in, so an enquiry lands with whoever can actually answer it.
 *
 * They all reach the same inbox — there is one of us, and pretending otherwise
 * would be theatre — but the prefilled subject sorts it on arrival, and saying
 * what to include is what actually shortens the reply.
 */
const routes = [
  {
    name: "Accounts",
    subject: "Account enquiry",
    body: "Opening an account, what we need from you, and what it would cost against what you pay now.",
    include: "What you trade, money in per month, and the currency going out.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className={iconClass}>
        <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.5" />
        <path d="M2.75 9.75h18.5" />
        <path d="M6.5 14.75h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Partnerships & software",
    subject: "Partnership / software enquiry",
    body: "Licensed MSBs looking at the remittance platform, and anyone wanting to talk corridors or volume.",
    include: "Your licence status, the corridors you run, and monthly volume.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className={iconClass}>
        <circle cx="6" cy="6.5" r="2.75" />
        <circle cx="18" cy="6.5" r="2.75" />
        <circle cx="12" cy="17.5" r="2.75" />
        <path d="M8.75 6.5h6.5M7.4 8.9l3.2 6.3M16.6 8.9l-3.2 6.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Compliance",
    subject: "Compliance enquiry",
    body: "Questions about how the account is regulated, who holds the licence, and how your money is safeguarded.",
    include: "The specific question, and who is asking — your bank, auditor, or counterparty.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" stroke="currentColor" className={iconClass}>
        <path d="M12 2.75 4.75 5.6v5.4c0 4.2 2.9 8.1 7.25 10.25C16.35 19.1 19.25 15.2 19.25 11V5.6Z" strokeLinejoin="round" />
        <path d="m9 11.75 2.1 2.1L15 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/** Where to send someone who would rather read than write. */
const elsewhere = [
  { label: "How the account works", href: "/business-accounts" },
  { label: "Opening an account", href: "/opening-an-account" },
  { label: "Software for MSBs", href: "/software" },
];

export default function ContactPage() {
  const hasAddress = Boolean(brand.address.line1 || brand.address.postcode);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      {/* Hero. Our own ledger band rather than the stock office photography
          every payments site in this category uses. */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="ledger-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[680px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, var(--accent), transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Contact</Eyebrow>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Questions about an account, a partnership, or how any of this is regulated — it
              reaches a person either way.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              <a
                href={`mailto:${brand.email}`}
                className="rounded-full border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {brand.email}
              </a>
              <a
                href={`tel:${brand.phoneE164}`}
                className="rounded-full border border-border bg-background px-4 py-2 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {brand.phoneDisplay}
              </a>
              <span className="rounded-full border border-transparent px-2 py-2 text-muted">
                Replies within one business day
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* The three routes in. */}
      <Section>
        <div className="grid gap-5 lg:grid-cols-3">
          {routes.map((route) => (
            <div
              key={route.name}
              className="flex flex-col card p-6 transition-colors hover:border-accent/60"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-2">
                {route.icon}
              </span>
              <h2 className="font-display mt-5 text-lg font-semibold">{route.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{route.body}</p>
              <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">
                <span className="font-semibold text-foreground">Worth including:</span>{" "}
                {route.include}
              </p>
              <a
                href={`mailto:${brand.email}?subject=${encodeURIComponent(route.subject)}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-2 transition-colors hover:text-accent"
              >
                Email us about this
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Form, and the direct route beside it. */}
      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Tell us what the business does
            </h2>
            <p className="mt-2.5 mb-7 text-sm leading-relaxed text-muted">
              What you trade, roughly what comes in each month, and the currency that goes out. If
              you know what your current provider charges you to convert, put that in too — it is
              the fastest route to a straight comparison.
            </p>
            <EnquiryForm source="Contact page" />
          </div>

          <div className="rounded-2xl bg-ink p-6 text-on-ink sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/50">
              Reach us directly
            </p>
            <p className="font-display mt-3 text-2xl font-semibold leading-tight">
              We usually reply within one business day.
            </p>

            <dl className="mt-8 space-y-6 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-on-ink/50">Email</dt>
                <dd className="mt-1.5">
                  <a href={`mailto:${brand.email}`} className="font-semibold hover:text-accent">
                    {brand.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-on-ink/50">Phone</dt>
                <dd className="mt-1.5">
                  <a href={`tel:${brand.phoneE164}`} className="font-semibold hover:text-accent">
                    {brand.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-on-ink/50">Hours</dt>
                <dd className="mt-1.5 leading-relaxed">Monday to Friday, 9am – 6pm UK time</dd>
              </div>
              {hasAddress && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-on-ink/50">
                    Registered office
                  </dt>
                  <dd className="mt-1.5 leading-relaxed">
                    {[
                      brand.address.line1,
                      brand.address.city,
                      brand.address.postcode,
                      brand.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            <RegulatoryNote
              compact
              tone="inherit"
              className="mt-8 border-t border-white/10 pt-6 text-on-ink/60"
            />

            <p className="mt-5 text-xs leading-relaxed text-on-ink/60">
              Please do not send identity documents or bank statements with a first enquiry. We will
              tell you exactly what the application needs and how to send it securely.
            </p>
          </div>
        </div>
      </Section>

      {/* For the ones who would rather read first. */}
      <Section className="border-t border-border">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-base leading-relaxed text-muted">
            Not ready to talk yet? These cover most of what people ask before they write.
          </p>
          <ul className="flex flex-wrap gap-3">
            {elsewhere.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
