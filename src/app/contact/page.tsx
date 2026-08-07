import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Shaz Marketing Group for a free Meta & Instagram ads strategy call, by form, email, phone or WhatsApp.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Shaz Marketing Group",
    description:
      "Get in touch with Shaz Marketing Group for a free Meta & Instagram ads strategy call, by form, email, phone or WhatsApp.",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Contact
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Let&apos;s talk about your growth
        </h1>
        <p className="mt-4 text-muted">
          Tell us a bit about your business and we&apos;ll come back with a plan for turning Meta
          &amp; Instagram ads into real customers.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand-pink/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
              <svg viewBox="0 0 32 32" fill="white" className="h-5 w-5">
                <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.28.63 4.4 1.72 6.22L4 29l7.94-1.66a12.9 12.9 0 0 0 4.08.66C22.6 28 28 22.6 28 15.98 28 9.36 22.64 3 16.02 3Z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted">Chat instantly — {siteConfig.phoneDisplay}</p>
            </div>
          </a>

          {siteConfig.demoBookingUrl && (
            <a
              href={siteConfig.demoBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand-pink/40"
            >
              <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-foreground">Book yourself in</p>
                <p className="text-sm text-muted">No call needed — pick a time instantly</p>
              </div>
            </a>
          )}

          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand-pink/40"
          >
            <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path
                  d="M4 6h16v12H4V6Zm0 0 8 7 8-7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted break-all">{siteConfig.email}</p>
            </div>
          </a>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <p className="font-semibold text-foreground">Response time</p>
            <p className="mt-1 text-sm text-muted">
              We reply to all enquiries within one business day. For anything urgent, WhatsApp is
              the fastest way to reach us.
            </p>
          </div>

          <div className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6">
            <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                <path
                  d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-foreground">Our office</p>
              <address className="mt-1 text-sm not-italic leading-relaxed text-muted">
                {siteConfig.address.line1}, {siteConfig.address.line2}
                <br />
                {siteConfig.address.city} {siteConfig.address.postcode}
              </address>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
