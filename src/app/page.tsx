import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { RealResultsSection } from "@/components/RealResults";
import { Reviews } from "@/components/Reviews";
import { HomeHero } from "@/components/HomeHero";
import { StatsBar } from "@/components/StatsBar";
import { ProblemGrid } from "@/components/ProblemGrid";
import { ServicesGrid } from "@/components/ServicesGrid";
import { HomeScanner } from "@/components/HomeScanner";
import { HowWeWork } from "@/components/HowWeWork";
import { GoogleCalendarBadge } from "@/components/GoogleCalendarBadge";
import { FaqJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";

/**
 * The reviews section reads from the database, so a fully static homepage
 * would freeze whatever was approved at build time until the next deploy.
 * Five minutes keeps the page fast and means approving a review in the admin
 * shows up on the site without anyone pushing code.
 */
export const revalidate = 300;

const faqs = [
  {
    question: "How much do Meta & Instagram ads cost with Shaz Marketing Group?",
    answer:
      "Meta & Instagram management comes in three plans: Starter at £499/month, Growth at £699/month which adds a full CRM and automation, and Scale at £1,399/month which adds an AI receptionist. Google Ads and SEO are priced separately, and the pricing page has the full breakdown of what each plan includes.",
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



export default function Home() {
  return (
    <div>
      <HomeHero />

      <StatsBar />
      <ProblemGrid />
      {/* The scanner is the strongest thing on this page, so it sits where
          people actually reach. It used to be section six, about 4,900px
          down, which meant most visitors never saw it. */}
      <HomeScanner />
      <ServicesGrid />
      <HowWeWork />
      <RealResultsSection />

      {/* Pricing teaser (full plans on /pricing) */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Prices on the page, not behind a form
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          Meta &amp; Instagram ads from £499 a month. Google Ads at one flat £600 a month with the
          landing page and the tracking included, and a CRM set up if your business turns out to
          need one. SEO from £350 a month. Ad spend is always separate and paid straight to Meta
          or Google, so you can see what goes where.
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

          {/* Open one at a time rather than all at once. Every answer is
              still in the HTML, so the FAQ schema and anything reading the
              page sees the lot — it just does not cost eleven hundred pixels
              of a phone screen to say so. <details> rather than React state,
              because it needs no JavaScript to work. */}
          <div className="mt-10 flex flex-col gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-border bg-background px-6 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {faq.question}
                  <span className="shrink-0 text-brand-pink transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </details>
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

      {/*
        Proof before the ask, which is the way round it should always have
        been. It used to sit under the form, where it was read by people who
        had already decided — and missed entirely by everybody still making
        their mind up.

        Renders nothing until a review has been approved in the admin page.
      */}
      <Reviews />

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
              ads plan for your business.
            </p>
            <div className="mt-8 space-y-4 text-sm text-muted">
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand-pink">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Free strategy call
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

            {/* The demo had a section of its own in the middle of the page,
                which made three separate places to get in touch. It belongs
                here, next to the form, as the other way of doing the same
                thing. */}
            {siteConfig.demoBookingUrl && (
              <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
                <p className="text-sm font-semibold text-foreground">
                  Rather talk it through first?
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Fifteen minutes with Walid, who owns the business and does the work. Pick a time
                  and you get a Google Meet link straight away.
                </p>
                <a
                  href={siteConfig.demoBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink"
                >
                  Book a time →
                </a>
                <GoogleCalendarBadge />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <LeadForm source="Homepage form" />
          </div>
        </div>
      </section>


    </div>
  );
}
