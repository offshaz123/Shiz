import type { Metadata } from "next";
import Link from "next/link";
import { ServicesSection } from "@/components/ServicesSection";
import { siteConfig, whatsappHref } from "@/lib/site-config";

const servicesDescription =
  "Window tints, chameleon windscreens, number plates, vehicle wraps & dechrome, PPF, ceramic coating & detailing, caliper painting, alloy refurbishment, car servicing, and vehicle security at SMG Details.";

export const metadata: Metadata = {
  title: "Services",
  description: servicesDescription,
  alternates: { canonical: "/services" },
  openGraph: {
    title: `Services | ${siteConfig.name}`,
    description: servicesDescription,
  },
};

export default function ServicesPage() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">What We Do</span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Our Services</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
          Everything under one roof. Have a look through, then get in touch for a quote on your vehicle.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <ServicesSection detailed />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Ready to book?</h2>
          <p className="mt-4 text-muted">Message us your vehicle and what you&apos;re after, and we&apos;ll come back with a quote.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="brand-gradient-bg rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10"
            >
              Get a Free Quote
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground hover:border-brand-pink/60"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
