import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { PricingSection } from "@/components/PricingSection";
import { RealResultsSection } from "@/components/RealResults";
import { CaseStudySection } from "@/components/CaseStudy";
import { FaqJsonLd } from "@/components/StructuredData";
import { whatsappHref } from "@/lib/site-config";
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

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            What We Provide
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to turn ads into customers
          </h2>
          <p className="mt-4 text-muted">
            One partner for advertising, lead management, and follow-up — so you can focus on
            running your business.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.title}
              className="rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-brand-pink/40"
            >
              <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
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
              {[
                "Unified inbox for every social & messaging channel",
                "Custom sales pipeline built around how you work",
                "Automated follow-up so leads don't go cold",
                "Missed-call text-back captures every enquiry",
                "Simple reporting so you always know what's working",
              ].map((item) => (
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
              {[
                { channel: "Instagram", msg: "Hi! Do you have appointments this week?", time: "2m" },
                { channel: "WhatsApp", msg: "What's included in the Growth plan?", time: "14m" },
                { channel: "Facebook", msg: "Can I get a quote for a service package?", time: "38m" },
                { channel: "Missed Call", msg: "Auto text-back sent to caller", time: "1h" },
              ].map((row) => (
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

      {/* AI receptionist highlight */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1 rounded-3xl border border-border bg-background p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
                Always On
              </p>
              <div className="mt-5 space-y-3">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 text-sm text-foreground">
                  Hi, do you offer this service on weekends and how much does it cost?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm brand-gradient-bg px-4 py-3 text-sm text-white">
                  Yes! We&apos;re open weekends. Our packages start from £X — want me to book you a
                  free consultation now?
                </div>
              </div>
              <p className="mt-5 text-xs text-muted">
                Your AI receptionist replying instantly, any time of day.
              </p>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
                AI Receptionist &amp; Chatbot
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Never miss another enquiry, even after hours
              </h2>
              <p className="mt-4 text-muted">
                Your AI receptionist greets every visitor, answers common questions about your
                business, qualifies the lead and books them straight into your calendar — 24 hours a
                day. We&apos;re continuing to roll out deeper AI automation so it gets smarter over
                time.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-brand-pink/60"
              >
                Ask us about AI Receptionist
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

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
