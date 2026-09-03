import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { TrackedCallLink } from "@/components/TrackedCallLink";
import { siteConfig, whatsappHref, tintServices } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Premium Window Tinting in London",
  description:
    "Premium window tinting in London — standard dyed from £99, ceramic from £180 with a lifetime warranty. Call now for a free quote, same-week fitting available.",
  alternates: { canonical: "/london" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Premium Window Tinting in London | Executive Tints & Repairs",
    description:
      "Premium window tinting in London — standard dyed from £99, ceramic from £180 with a lifetime warranty. Call now for a free quote.",
  },
};

const trustPoints = [
  "10% off ceramic tint, right now",
  "Lifetime warranty on every ceramic tint",
  "15% off with a valid Blue NHS card",
  "Hand-fitted, executive-standard finish",
];

const [standardTint, ceramicTint] = tintServices;

function CallCta({ big = false }: { big?: boolean }) {
  return (
    <TrackedCallLink
      className={
        big
          ? "brand-gradient-bg inline-flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-bold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
          : "brand-gradient-bg inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
      }
    >
      <svg viewBox="0 0 24 24" fill="none" className={big ? "h-5 w-5" : "h-4 w-4"}>
        <path
          d="M4.5 4.5c1-1 3.5-1 4.2.9.4 1.1.9 2 1.5 2.8.5.7.4 1.6-.2 2.2l-.9.9a12 12 0 0 0 5.6 5.6l.9-.9c.6-.6 1.5-.7 2.2-.2.8.6 1.7 1.1 2.8 1.5 1.9.7 1.9 3.2.9 4.2-1 1-2.6 1.6-4.3 1.2C11.7 21.4 4.6 14.3 3.3 8.8c-.4-1.7.2-3.3 1.2-4.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      Call {siteConfig.phoneDisplay}
    </TrackedCallLink>
  );
}

export default function LondonLandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            London&apos;s Premium Window Tinting Specialists
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Premium Window Tinting in{" "}
            <span className="brand-gradient-text">London</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Reduce heat, block glare and add privacy — standard dyed tint from{" "}
            <span className="font-semibold text-foreground">£99</span>, ceramic from{" "}
            <span className="font-semibold text-foreground">£180</span> with a lifetime warranty.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <CallCta big />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              or message us on WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-2.5">
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

      {/* Standard vs Ceramic */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Which tint is right for your car?
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[standardTint, ceramicTint].map((service) => (
              <div
                key={service.slug}
                className="flex flex-col rounded-3xl border border-border bg-background p-8"
              >
                {service.badge && (
                  <span className="brand-gradient-bg mb-4 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                    {service.badge}
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand">{service.tagline}</p>
                <ul className="mt-5 space-y-2.5">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
                      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand">
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 flex items-center justify-between gap-4 border-t border-border pt-6">
                  <div>
                    <p className="text-xs text-muted">From</p>
                    <p className="text-lg font-bold text-foreground">{service.fromPrice}</p>
                  </div>
                  <CallCta />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page CTA repeat */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Get a free quote over the phone
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Tell us your car and the tint you want — we&apos;ll give you a price on the call, no
          waiting around for a callback.
        </p>
        <div className="mt-8">
          <CallCta big />
        </div>
      </section>

      {/* Why choose us */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            Why London drivers choose us
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Premium material", description: "Ceramic film that genuinely outperforms what most competitors fit." },
              { title: "Lifetime warranty", description: "The only tint we're confident enough to cover for life." },
              { title: "Hand-fitted finish", description: "Bubble-free, edge-to-edge on every car, every time." },
              { title: "Straightforward pricing", description: "You'll know the price on the phone, before we start." },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-background p-7">
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form — de-emphasised, for the minority who prefer it over calling */}
      <section className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Prefer not to call right now?</h2>
          <p className="mt-3 text-muted">
            Leave your details below and we&apos;ll call you back — though for the fastest price,
            calling us directly is quicker.
          </p>
        </div>
        <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <LeadForm compact />
        </div>
      </section>

      {/* Footer link back to full site, understated */}
      <div className="pb-10 text-center">
        <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline">
          See all our services →
        </Link>
      </div>
    </div>
  );
}
