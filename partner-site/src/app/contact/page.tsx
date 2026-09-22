import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";
import { EnquiryForm } from "@/components/EnquiryForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to ${brand.name} about a business payment account, or about the remittance platform for licensed MSBs.`,
  alternates: { canonical: "/contact" },
};

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

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Contact</Eyebrow>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Tell us what the business does
            </h1>
            <p className="mt-6 text-base leading-relaxed text-muted">
              What you import, roughly what comes in each month, and the currency that goes out. If
              you know what your current provider charges you to convert, put that in as well — it is
              the fastest route to a straight comparison.
            </p>

            <dl className="mt-10 space-y-6 text-sm">
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${brand.phoneE164}`} className="text-lg font-semibold hover:text-accent">
                    {brand.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${brand.email}`} className="text-lg font-semibold hover:text-accent">
                    {brand.email}
                  </a>
                </dd>
              </div>
              {hasAddress && (
                <div>
                  <dt className="text-muted">Office</dt>
                  <dd className="mt-1 text-base leading-relaxed">
                    {[
                      brand.address.line1,
                      brand.address.city,
                      brand.address.postcode,
                      brand.address.country,
                    ]
                      .filter(Boolean)
                      .map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-10 max-w-md text-xs leading-relaxed text-muted">
              Please do not send identity documents or bank statements with a first enquiry. We will
              tell you exactly what the application file needs and how to send it securely.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <EnquiryForm source="Contact page" />
          </div>
        </div>
      </Section>
    </>
  );
}
