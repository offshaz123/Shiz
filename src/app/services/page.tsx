import type { Metadata } from "next";
import Link from "next/link";
import { RealResultsSection } from "@/components/RealResults";
import { IndustryStatsSection } from "@/components/IndustryStats";
import { whatsappHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Meta & Instagram ads, done-for-you lead generation, a unified inbox & CRM, and a 24/7 AI receptionist — everything Shaz Marketing Group provides, in one place.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | Shaz Marketing Group",
    description:
      "Meta & Instagram ads, done-for-you lead generation, a unified inbox & CRM, and a 24/7 AI receptionist — everything Shaz Marketing Group provides, in one place.",
  },
};

const services = [
  {
    title: "Meta & Instagram Ads",
    description:
      "Scroll-stopping campaigns built and managed across Facebook and Instagram, engineered for one goal: qualified enquiries for your business.",
    points: ["Campaign strategy & creative", "Audience targeting & retargeting", "Continuous testing & optimisation"],
  },
  {
    title: "Done-For-You Lead Generation",
    description:
      "We turn ad clicks into real conversations. Every enquiry is captured, organised and delivered straight to you, in any industry — with a specialism in automotive.",
    points: ["High-converting landing pages", "Instant lead notifications", "Built for automotive & beyond"],
  },
  {
    title: "All Your Socials, One Platform",
    description:
      "Instagram, Facebook Messenger, WhatsApp, SMS and email — unified into a single inbox and CRM so every enquiry is seen and nothing slips through the cracks.",
    points: ["One shared inbox for every channel", "Custom pipelines for your business", "Automated follow-up sequences"],
  },
  {
    title: "AI Receptionist & Chatbot",
    description:
      "A 24/7 AI receptionist answers questions, qualifies leads and books appointments even when you're closed — with deeper automation integrations rolling out soon.",
    points: ["Answers FAQs instantly, day or night", "Qualifies & books leads automatically", "Deeper automation integration coming soon"],
  },
];

const steps = [
  {
    step: "01",
    title: "Free Strategy Call",
    description: "We learn about your business, your goals and your ideal customer.",
  },
  {
    step: "02",
    title: "We Launch Your Campaigns",
    description: "Meta & Instagram ads go live, built to generate leads from day one.",
  },
  {
    step: "03",
    title: "Leads Land in One Inbox",
    description: "Every enquiry — social, WhatsApp, SMS — flows into your all-in-one CRM.",
  },
  {
    step: "04",
    title: "You Follow Up & Close",
    description: "Automated reminders and our AI receptionist help you convert more leads.",
  },
];

const inboxFeatures = [
  "Unified inbox for every social & messaging channel",
  "Custom sales pipeline built around how you work",
  "Automated follow-up so leads don't go cold",
  "Missed-call text-back captures every enquiry",
  "Simple reporting so you always know what's working",
];

const inboxPreview = [
  { channel: "Instagram", msg: "Hi! Do you have appointments this week?", time: "2m" },
  { channel: "WhatsApp", msg: "What's included in the Growth plan?", time: "14m" },
  { channel: "Facebook", msg: "Can I get a quote for a service package?", time: "38m" },
  { channel: "Missed Call", msg: "Auto text-back sent to caller", time: "1h" },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:px-8 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            What We Provide
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Everything you need to turn ads into customers
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            One partner for advertising, lead management, and follow-up — so you can focus on
            running your business.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Get My Free Strategy Call
            </Link>
            <Link
              href="/pricing"
              className="w-full rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60 sm:w-auto"
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="mx-auto max-w-7xl px-5 pb-4 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
            >
              <h2 className="text-xl font-semibold text-foreground">{service.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{service.description}</p>
              <ul className="mt-5 space-y-2.5">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-muted">
                    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <IndustryStatsSection />
      <RealResultsSection />

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From ad click to booked customer
            </h2>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.step}>
                <span className="brand-gradient-text text-4xl font-bold">{s.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unified platform */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              One Platform
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Stop juggling five different apps for leads
            </h2>
            <p className="mt-4 text-muted">
              Instagram DMs, Facebook Messenger, WhatsApp, SMS, email and missed calls — every
              conversation your business has lands in one shared inbox, mapped to one pipeline, so
              no lead ever goes cold.
            </p>
            <ul className="mt-6 space-y-3">
              {inboxFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-8">
            <div className="flex items-center gap-2.5">
              <span className="brand-gradient-bg h-2.5 w-2.5 rounded-full" />
              <span className="text-sm font-semibold text-foreground">Shaz Marketing Group — Inbox</span>
            </div>
            <div className="mt-6 space-y-3">
              {inboxPreview.map((row) => (
                <div
                  key={row.channel}
                  className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-brand-pink">{row.channel}</p>
                    <p className="mt-0.5 text-sm text-foreground">{row.msg}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{row.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-24 text-center sm:px-8">
        <div className="rounded-3xl border border-border bg-surface px-8 py-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to see what this looks like for your business?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            No pressure, no obligation — just a clear look at how this would work for you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Get My Free Strategy Call
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
        </div>
      </section>
    </div>
  );
}
