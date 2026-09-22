import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to ${brand.name} about a business payment account, multi-currency accounts, global payroll, or the remittance platform for licensed MSBs.`,
  alternates: { canonical: "/contact" },
};

/** Three routes in, so an enquiry lands with whoever can actually answer it. */
const routes = [
  {
    name: "Accounts",
    body: "Opening an account, what we need from you, and what it would cost against what you pay now.",
  },
  {
    name: "Partnerships & software",
    body: "Licensed MSBs looking at the remittance platform, and anyone wanting to talk corridors or volume.",
  },
  {
    name: "Compliance",
    body: "Questions about how the account is regulated, who holds the licence, and how your money is safeguarded.",
  },
];

export default function ContactPage() {
  const hasAddress = Boolean(brand.address.line1 || brand.address.postcode);
  const { provider } = brand;
  const named =
    provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />

      {/* Hero */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Questions about an account, a partnership, or how any of this is regulated — it reaches
            a person either way.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {routes.map((route) => (
            <div key={route.name} className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-display text-lg font-semibold">{route.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{route.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Form, and the direct route beside it */}
      <Section tone="surface">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
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
              {hasAddress && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-on-ink/50">Registered office</dt>
                  <dd className="mt-1.5 leading-relaxed">
                    {[brand.address.line1, brand.address.city, brand.address.postcode, brand.address.country]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-8 border-t border-white/10 pt-6 text-xs leading-relaxed text-on-ink/60">
              {named ? (
                <>
                  {brand.name} is a trading name of {provider.regulatedEntity}, regulated by the
                  Financial Conduct Authority, registration no. {provider.firmReferenceNumber}.{" "}
                </>
              ) : (
                <>
                  {brand.name} is a trading name of a UK payments firm authorised and regulated by
                  the Financial Conduct Authority.{" "}
                </>
              )}
              {brand.name} is not a bank.
            </p>

            <p className="mt-5 text-xs leading-relaxed text-on-ink/60">
              Please do not send identity documents or bank statements with a first enquiry. We will
              tell you exactly what the application needs and how to send it securely.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
