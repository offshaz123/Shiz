import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { RealResultsSection, bestCostPerLead } from "@/components/RealResults";
import { CaseStudySection } from "@/components/CaseStudy";
import { GoogleCalendarBadge } from "@/components/GoogleCalendarBadge";
import { FaqJsonLd } from "@/components/StructuredData";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Book a Free Demo",
  description:
    "See exactly how Shaz Marketing Group turns Meta & Instagram ads into booked customers for your business. Book a free, no-obligation demo.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Book a Free Demo | Shaz Marketing Group",
    description:
      "See exactly how Shaz Marketing Group turns Meta & Instagram ads into booked customers for your business. Book a free, no-obligation demo.",
  },
};

const trustBadges = [
  `Real Client Leads From £${bestCostPerLead}`,
  "No Long-Term Contract",
  "UK-Based Team",
  "Campaigns Launch Within Days",
  "Any Industry — Automotive Specialists",
];

const whatYouGet = [
  {
    title: "Meta & Instagram Ads That Convert",
    description:
      "Campaigns built and managed for one goal — qualified enquiries, not just likes and reach.",
  },
  {
    title: "One Inbox For Every Enquiry",
    description:
      "Instagram, Facebook, WhatsApp, SMS and missed calls — all landing in one place so nothing gets missed.",
  },
  {
    title: "24/7 AI Receptionist",
    description:
      "Answers questions and books leads into your calendar even when you're closed for the day.",
  },
  {
    title: "Automated Follow-Up",
    description: "Every lead gets chased automatically, so cold enquiries turn back into conversations.",
  },
];

const steps = [
  { step: "01", title: "Book a Free Demo", description: "Pick a time below — takes 15 minutes, no pressure." },
  { step: "02", title: "We Show You Live", description: "A real walkthrough of the platform, built around your business." },
  { step: "03", title: "We Launch Your Campaign", description: "Meta & Instagram ads go live, built to generate leads." },
  { step: "04", title: "You Get Leads, We Handle Follow-Up", description: "Enquiries land in one inbox, chased automatically." },
];

const faqs = [
  {
    question: "Is the demo actually free?",
    answer:
      "Yes — completely free, no obligation. It's a 15-minute call where we show you the platform and talk through what a campaign would look like for your business.",
  },
  {
    question: "Do I need to already be running ads or active on social media?",
    answer:
      "No. Most businesses we talk to are starting from scratch or have only tried boosting posts. We build the whole thing — campaigns, landing pages, and lead follow-up — from the ground up.",
  },
  {
    question: "What happens after the demo?",
    answer:
      "If it's a fit, we'll map out a plan and launch your campaigns within a few days. If it's not the right fit, that's fine too — there's no pressure either way.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Management plans start from £400/month, with ad spend paid separately and directly to Meta. We'll go through exact numbers for your business on the call.",
  },
];

export default function DemoPage() {
  const hasBooking = Boolean(siteConfig.demoBookingUrl);
  const hasVideo = Boolean(siteConfig.demoVideoUrl);

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
            Meta &amp; Instagram Ads Specialists
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            More leads. More bookings.{" "}
            <span className="brand-gradient-text">Zero guesswork.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            See exactly how we turn Meta &amp; Instagram ads into booked customers for your
            business — book a free, no-obligation demo below.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#book"
              className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Book My Free Demo
            </a>
            {hasVideo && (
              <a
                href="#demo-video"
                className="w-full rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60 sm:w-auto"
              >
                Watch How It Works
              </a>
            )}
          </div>

          <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
            {trustBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            What You Get
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need, in one place
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {whatYouGet.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
            >
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <RealResultsSection />
      <CaseStudySection />

      {/* Demo video */}
      {hasVideo && (
        <section id="demo-video" className="border-t border-border mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              See It In Action
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Watch a quick walkthrough
            </h2>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="aspect-video">
              <iframe
                src={siteConfig.demoVideoUrl}
                title="Shaz Marketing Group demo walkthrough"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From demo to booked customer
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

      {/* Booking */}
      <section id="book" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Book Your Demo
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Pick a time that works for you
          </h2>
          <p className="mt-4 text-muted">
            15 minutes, no pressure. We&apos;ll show you exactly how this would work for your
            business.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-surface">
          {hasBooking ? (
            <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
              <span className="brand-gradient-bg flex h-16 w-16 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white">
                  <path
                    d="M8 3v4M16 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm font-medium text-foreground">Pick a slot in under a minute</p>
              <p className="max-w-sm text-sm text-muted">
                Pick a time, get instant confirmation, and a Google Meet link lands in your inbox
                automatically.
              </p>
              <a
                href={siteConfig.demoBookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-gradient-bg mt-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
              >
                Book Yourself In For a Demo →
              </a>
              <GoogleCalendarBadge />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
              <p className="text-sm font-medium text-foreground">
                Online booking is being set up right now
              </p>
              <p className="max-w-sm text-sm text-muted">
                In the meantime, message us directly and we&apos;ll find a time that works for
                you — or fill in your details below and we&apos;ll reach out.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brand-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
                >
                  Chat on WhatsApp
                </a>
                <a
                  href={`tel:${siteConfig.phoneE164}`}
                  className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-brand-pink/60"
                >
                  Call {siteConfig.phoneDisplay}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lead form fallback */}
      <section id="lead-form" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              Prefer We Reach Out?
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tell us about your business
            </h2>
            <p className="mt-4 text-muted">
              Fill in a few details and our team will get back to you within one business day to
              set up your demo.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-border bg-background p-6 sm:p-8">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            FAQs
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Before you book
          </h2>
        </div>

        <div className="mt-12 space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
        <FaqJsonLd items={faqs} />
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-20 text-center sm:px-8">
        <div className="rounded-3xl border border-border bg-surface px-8 py-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ready to see it for yourself?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            No pressure, no obligation — just a clear look at how this would work for your
            business.
          </p>
          <a
            href="#book"
            className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Book My Free Demo
          </a>
        </div>
      </section>
    </div>
  );
}
