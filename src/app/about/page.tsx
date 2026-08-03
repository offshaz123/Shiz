import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, fullAddress, yearsExperience } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${siteConfig.name} — Romford's specialist for car window tinting, wrapping, servicing, number plates and alloy refurbishment.`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About ${siteConfig.name}`,
    description: `About ${siteConfig.name} — Romford's specialist for car window tinting, wrapping, servicing, number plates and alloy refurbishment.`,
  },
};

const values = [
  {
    title: "One shop, every job",
    description:
      "Tinting, wrapping, servicing, plates and alloys — we bring specialisms that are usually spread across different garages under one roof.",
  },
  {
    title: "Finished properly",
    description: "No bubbling tints, no overspray, no shortcuts — every job is finished to a standard we'd be happy to put our name to.",
  },
  {
    title: "Straightforward pricing",
    description: "Tell us your vehicle and what you need, and we'll give you a clear quote before any work starts.",
  },
  {
    title: "Easy to reach",
    description: "Message us on WhatsApp, use the contact form, or come and see us in person at our Romford unit.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Who We Are</span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {siteConfig.legalName} — trading as {siteConfig.name}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            We&apos;re a car detailing shop based in Romford, covering tints, wraps, servicing, plates, alloys and
            more — all under one roof.
          </p>
          <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted">
              Founded {siteConfig.foundedYear}
            </span>
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted">
              {yearsExperience}+ Years Experience
            </span>
            <span className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-muted">
              {siteConfig.ratingLabel}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-foreground">Our story</h2>
          <p className="mt-4 leading-relaxed text-muted">
            We founded {siteConfig.name} in {siteConfig.foundedYear} after noticing a gap in the market: too many car
            owners were bouncing between different specialists for tinting, wrapping, servicing and wheels, with no
            one place that did it all properly. So we built {siteConfig.name} to bring all of that together in one
            place, at {fullAddress}.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Whether it&apos;s a subtle window tint, a full wrap, a routine service, a set of custom plates, or refurbished
            alloys, our aim is the same every time: get it right, and get it done properly.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">What we stand for</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-3xl border border-border bg-background p-8">
                <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready to get started?</h2>
        <p className="mt-4 text-muted">Get in touch and let&apos;s talk about what your car needs.</p>
        <Link
          href="/contact"
          className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get a Free Quote
        </Link>
      </section>
    </div>
  );
}
