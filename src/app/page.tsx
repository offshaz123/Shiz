import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { RealResultsSection } from "@/components/RealResults";
import { CaseStudySection } from "@/components/CaseStudy";
import { GoogleCalendarBadge } from "@/components/GoogleCalendarBadge";
import { FaqJsonLd } from "@/components/StructuredData";
import { siteConfig, whatsappHref } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";

const faqs = [
  {
    question: "How much do Meta & Instagram ads cost with Shaz Marketing Group?",
    answer:
      "Our done-for-you Meta & Instagram ads management starts from £400/month on the Starter plan, with Growth (£700/month) and Scale (£1,400/month) plans adding a full CRM, automation and an AI receptionist. Ad spend itself is separate and paid directly to Meta.",
  },
  {
    question: "Do you run Meta & Instagram ads for automotive businesses?",
    answer:
      "Yes — automotive is one of our specialisms, alongside home & trade services, retail, health & wellness, real estate, hospitality and professional services. We tailor every campaign to the industry it's running in.",
  },
  {
    question: "What's included in the all-in-one CRM and social inbox?",
    answer:
      "Every enquiry from Instagram, Facebook Messenger, WhatsApp, SMS and email lands in one shared inbox, mapped to a sales pipeline built around your business, with automated follow-up so no lead goes cold.",
  },
  {
    question: "How does the AI receptionist and chatbot work?",
    answer:
      "The AI receptionist answers common questions, qualifies leads and books appointments into your calendar 24/7, even outside business hours, and is included from the Scale plan upwards.",
  },
  {
    question: "How quickly will I start getting leads?",
    answer:
      "After a free strategy call, we typically launch your Meta & Instagram ad campaigns within a few days, with leads starting to flow into your inbox as soon as the campaigns go live.",
  },
];

const industries = [
  "Automotive",
  "Home & Trade Services",
  "Retail & E-commerce",
  "Health & Wellness",
  "Real Estate",
  "Restaurants & Hospitality",
  "Professional Services",
  "Any business, any category",
];

const whatWeDo = [
  { title: "Meta & Instagram Ads", description: "Campaigns built and managed for qualified enquiries, not just likes." },
  { title: "Done-For-You Lead Generation", description: "Every ad click turned into a captured, organised enquiry." },
  { title: "One Inbox, Every Channel", description: "Instagram, WhatsApp, SMS & email — unified so nothing's missed." },
  { title: "24/7 AI Receptionist", description: "Answers questions and books leads even when you're closed." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            Meta &amp; Instagram Ads Specialists
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            More leads. More bookings.{" "}
            <span className="brand-gradient-text">One platform.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Shaz Marketing Group runs Meta &amp; Instagram ad campaigns that generate real, qualified
            leads for your business — then brings every enquiry, every channel and every follow-up
            into one simple system, backed by a 24/7 AI receptionist.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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

          <div className="mx-auto mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
            {industries.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <RealResultsSection />
      <CaseStudySection />

      {/* What we do (condensed — full detail on /services) */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            What We Provide
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to turn ads into customers
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whatWeDo.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border bg-surface p-7 transition-colors hover:border-brand-pink/40"
            >
              <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/services" className="text-sm font-semibold text-brand-pink hover:underline">
            See everything we do →
          </Link>
        </div>
      </section>

      {/* AI receptionist highlight */}
      {siteConfig.demoBookingUrl && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              Book a Demo
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              See it in action before you commit
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Pick a time that works for you — 15 minutes, no pressure. We&apos;ll show you exactly
              how this would work for your business, then get instant confirmation with a Google
              Meet link sent straight to your inbox.
            </p>
            <a
              href={siteConfig.demoBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
            >
              Book Yourself In For a Demo →
            </a>
            <GoogleCalendarBadge />
          </div>
        </section>
      )}

      {/* Pricing teaser (full plans on /pricing) */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Plans from £400/month, no long-term contract
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Done-for-you Meta &amp; Instagram ads management, with a full CRM and 24/7 AI
          receptionist on our higher plans. Ad spend is separate, paid directly to Meta.
        </p>
        <Link
          href="/pricing"
          className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          See Full Pricing →
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              FAQs
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-background p-6">
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <FaqJsonLd items={faqs} />
      </section>

      {/* From the blog */}
      {blogPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
                From the Blog
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Guides on ads, leads &amp; growth
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden shrink-0 text-sm font-semibold text-brand-pink hover:underline sm:block"
            >
              View all posts →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
              >
                <p className="text-xs text-muted">
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{post.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
              </Link>
            ))}
          </div>

          <Link
            href="/blog"
            className="mt-8 block text-center text-sm font-semibold text-brand-pink hover:underline sm:hidden"
          >
            View all posts →
          </Link>
        </section>
      )}

      {/* Final CTA + form */}
      <section id="lead-form" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              Get Started
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Let&apos;s generate your next customer
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Fill in your details and our team will be in touch to map out a Meta &amp; Instagram
              ads plan for your business — no obligation.
            </p>
            <div className="mt-8 space-y-4 text-sm text-muted">
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Free, no-pressure strategy call
              </p>
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Response within one business day
              </p>
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Or message us directly on WhatsApp
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <LeadForm />
          </div>
        </div>
      </section>
    </div>
  );
}
