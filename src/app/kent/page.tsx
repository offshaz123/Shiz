import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { siteConfig, whatsappHref, tintServices, repairServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Window Tinting & Detailing in Kent",
  description:
    "Premium window tinting, ceramic detailing and car servicing in Kent. 10% off ceramic tint with a lifetime warranty — get a free quote today.",
  alternates: { canonical: "/kent" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Window Tinting & Detailing in Kent | Exclusive Tints & Repairs",
    description:
      "Premium window tinting, ceramic detailing and car servicing in Kent. 10% off ceramic tint with a lifetime warranty — get a free quote today.",
  },
};

const trustPoints = [
  "10% off ceramic tint, right now",
  "Lifetime warranty on every ceramic tint",
  "15% off with a valid Blue NHS card",
  "Serving Kent — brakes, servicing & detailing too",
];

export default function KentLandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            Kent&apos;s Premium Window Tinting &amp; Detailing Specialists
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Executive standard tinting,{" "}
            <span className="brand-gradient-text">now in Kent</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Ceramic and chameleon window tints, dechroming, polishing, ceramic detailing, brakes
            and servicing — finished properly, backed by a lifetime warranty on every ceramic tint
            we fit.
          </p>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {trustPoints.map((point) => (
              <span
                key={point}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted"
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form-first layout — the whole point of a PPC landing page */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground">
              Get your free Kent quote in minutes
            </h2>
            <p className="mt-3 text-sm text-muted">
              Fill in the form, or message us directly for the fastest response.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <svg viewBox="0 0 32 32" fill="white" className="h-5 w-5">
                  <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.28.63 4.4 1.72 6.22L4 29l7.94-1.66a12.9 12.9 0 0 0 4.08.66C22.6 28 28 22.6 28 15.98 28 9.36 22.64 3 16.02 3Z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-foreground">WhatsApp us now</p>
                <p className="text-sm text-muted">{siteConfig.phoneDisplay}</p>
              </div>
            </a>
            <a
              href={`tel:${siteConfig.phoneE164}`}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
            >
              <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
                  <path
                    d="M4.5 4.5c1-1 3.5-1 4.2.9.4 1.1.9 2 1.5 2.8.5.7.4 1.6-.2 2.2l-.9.9a12 12 0 0 0 5.6 5.6l.9-.9c.6-.6 1.5-.7 2.2-.2.8.6 1.7 1.1 2.8 1.5 1.9.7 1.9 3.2.9 4.2-1 1-2.6 1.6-4.3 1.2C11.7 21.4 4.6 14.3 3.3 8.8c-.4-1.7.2-3.3 1.2-4.3Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-foreground">Call us</p>
                <p className="text-sm text-muted">{siteConfig.phoneDisplay}</p>
              </div>
            </a>
          </div>

          <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* Quick services overview */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Everything your car needs, in one place
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...tintServices.slice(0, 2), ...repairServices.slice(0, 2)].map((service) => (
              <div key={service.slug} className="rounded-3xl border border-border bg-background p-6">
                <h3 className="text-base font-semibold text-foreground">{service.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to book your Kent quote?
        </h2>
        <p className="mt-4 text-muted">
          Scroll back up to fill in the form, or message us on WhatsApp for an instant reply.
        </p>
      </section>
    </div>
  );
}
