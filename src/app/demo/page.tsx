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
      {/* Hero + booking */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-8 text-center sm:px-8 sm:pt-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            Meta &amp; Instagram Ads Specialists
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            More leads. More bookings.{" "}
            <span className="brand-gradient-text">Zero guesswork.</span>
          </h1>

          {hasVideo && (
            <div className="mt-6">
              <a
                href="#demo-video"
                className="w-full rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60 sm:w-auto"
              >
                Watch How It Works
              </a>
            </div>
          )}

          {/* Merged lead form + instant booking — the first thing visible on the page */}
          <div
            id="book"
            className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface text-left shadow-lg shadow-black/5"
          >
            <div className={hasBooking ? "grid sm:grid-cols-2" : ""}>
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground">
                  Tell us about your business
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  We&apos;ll get back to you within one business day.
                </p>
                <div className="mt-6">
                  <LeadForm compact />
                </div>
              </div>

              {hasBooking && (
                <div className="flex flex-col items-center justify-center gap-4 border-t border-border p-6 text-center sm:border-t-0 sm:border-l sm:p-8">
                  <svg viewBox="0 0 48 48" className="h-16 w-16 shrink-0" aria-hidden="true">
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5Z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.3 16 18.8 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7Z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 45c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 35.6 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 40.6 16.2 45 24 45Z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.9l6.5 5.5C41.7 36.7 45 31 45 24c0-1.4-.1-2.7-.4-3.5Z"
                    />
                  </svg>
                  <p className="text-base font-semibold text-foreground">
                    Prefer to book yourself in?
                  </p>
                  <p className="max-w-xs text-sm text-muted">
                    Pick a time, get instant confirmation, and a Google Meet link lands in your
                    inbox automatically.
                  </p>
                  <a
                    href={siteConfig.demoBookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.02] sm:w-auto"
                  >
                    Book Yourself In For a Demo →
                  </a>
                  <GoogleCalendarBadge />
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
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

      <RealResultsSection />
      <CaseStudySection />

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

      {!hasBooking && (
        <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <p className="text-sm font-medium text-foreground">
            Online booking is being set up right now
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            In the meantime, message us directly and we&apos;ll find a time that works for you.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
        </section>
      )}

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
