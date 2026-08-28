import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { QuoteSidebar } from "@/components/QuoteSidebar";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Executive Tints & Repairs by form, phone, email or WhatsApp for a free quote on tinting, dechroming, brakes or servicing.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Executive Tints & Repairs",
    description:
      "Get in touch by form, phone, email or WhatsApp for a free quote on tinting, dechroming, brakes or servicing.",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Contact", url: `${siteConfig.url}/contact` },
        ]}
      />
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Contact
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Let&apos;s get your car booked in
        </h1>
        <p className="mt-4 text-muted">
          Tell us what you need and we&apos;ll come back with a price — or reach us directly on
          WhatsApp for the fastest response.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <QuoteSidebar />
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
