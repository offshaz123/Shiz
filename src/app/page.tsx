import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { ServicesSection } from "@/components/ServicesSection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { FaqJsonLd } from "@/components/StructuredData";
import { whatsappHref, fullAddress, googleMapsHref, siteConfig } from "@/lib/site-config";
import { faqs } from "@/content/faqs";

const whyUs = [
  {
    title: "All under one roof",
    description: "Tinting, wrapping, servicing, plates and alloy refurb — no need to shop around between specialists.",
  },
  {
    title: "Road-legal, done right",
    description: "Every tint shade and number plate we fit meets UK legal requirements, so you're covered.",
  },
  {
    title: "Straight-talking quotes",
    description: "Message us your vehicle and what you need — we'll give you a clear price before any work starts.",
  },
  {
    title: "Local to Romford",
    description: "Based at 12 Roneo Corner, easy to find and easy to reach on WhatsApp for updates.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Promo banner */}
      <div className="overflow-hidden bg-red-600 py-2.5">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((i) => (
            <span key={i} aria-hidden={i === 1} className="flex shrink-0 items-center whitespace-nowrap px-8 text-sm font-semibold text-white">
              20% Off All Services — Get Your Free Quote Today
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            Romford&apos;s Car Detailing &amp; Tinting Specialists
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Welcome to SMG Details —{" "}
            <span className="brand-gradient-text">here, you get everything done.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            SMG Details is your local specialist for window tints, chameleon windscreens, vehicle wraps &amp;
            dechrome, PPF, ceramic coating &amp; detailing, number plates, alloy &amp; caliper refurbishment, car
            servicing, and vehicle security.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Get a Free Quote
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60 sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {[
              "Window Tints",
              "Chameleon Windscreen",
              "Wraps & Dechrome",
              "PPF",
              "Ceramic Coating",
              "Number Plates",
              "Alloy Refurb",
              "Caliper Painting",
              "Car Servicing",
              "Vehicle Security",
            ].map(
              (tag) => (
                <span key={tag} className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted">
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Our Services</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything your car needs, in one place
          </h2>
          <p className="mt-4 text-muted">
            From a subtle window tint to a full wrap, a routine service to a fresh set of alloys — we&apos;ve got it
            covered.
          </p>
        </div>
        <div className="mt-14">
          <ServicesSection />
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Why SMG Details</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built around getting it right first time
            </h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <div key={item.title}>
                <div className="brand-gradient-bg h-1.5 w-10 rounded-full" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant highlight */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1 rounded-3xl border border-border bg-surface p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Ask Away</p>
            <div className="mt-5 space-y-3">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-background px-4 py-3 text-sm text-foreground">
                Do you do gloss black dechroming on a 3 Series?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm brand-gradient-bg px-4 py-3 text-sm text-white">
                Yes — we can dechrome the trim and badges in gloss or satin black. Want me to point you to WhatsApp
                for a quote?
              </div>
            </div>
            <p className="mt-5 text-xs text-muted">Our AI assistant, live in the corner of every page.</p>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">AI Assistant</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Not sure what you need? Just ask
            </h2>
            <p className="mt-4 text-muted">
              Our chat assistant can answer questions about any of our services, any time of day. For a firm quote
              or to book in, it&apos;ll point you straight to WhatsApp.
            </p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Find Us</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Based in Romford</h2>
          <p className="mt-4 text-muted">{fullAddress}</p>
          <a
            href={googleMapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-brand-pink/60"
          >
            Get Directions
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">FAQs</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="mt-12">
          <FAQAccordion items={faqs} />
        </div>
        <FaqJsonLd items={faqs} />
      </section>

      {/* Final CTA + form */}
      <section id="lead-form" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Get Started</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get your free, no-obligation quote
              </h2>
              <p className="mt-4 max-w-md text-muted">
                Tell us about your vehicle and what you&apos;re after, and we&apos;ll come back with a price and the next
                available slot.
              </p>
              <div className="mt-8 space-y-4 text-sm text-muted">
                <p className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Free, no-obligation quote
                </p>
                <p className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  We&apos;ll get back to you quickly
                </p>
                <p className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Or message us directly on WhatsApp — {siteConfig.phoneDisplay}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6 sm:p-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
