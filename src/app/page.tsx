import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { ServiceCard } from "@/components/ServiceCard";
import { FaqJsonLd } from "@/components/StructuredData";
import { whatsappHref, tintServices, repairServices } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";

const faqs = [
  {
    question: "How much does ceramic window tint cost?",
    answer:
      "Ceramic tint starts from £249, and it's currently 10% off with a lifetime warranty included. The exact price depends on your vehicle's glass — send us your reg or vehicle details for an exact quote.",
  },
  {
    question: "Do you really offer a lifetime warranty on tint?",
    answer:
      "Yes, on ceramic tint. Because we fit genuinely premium material, we back it with a lifetime warranty against bubbling, peeling and fading for as long as you own the car — something most competitors can't offer because of the film they use.",
  },
  {
    question: "What is chameleon tint?",
    answer:
      "Chameleon tint is a colour-shifting film that changes appearance depending on the light and angle it's viewed from. We stock it in blue and red for a genuinely head-turning finish.",
  },
  {
    question: "Do you offer a discount for NHS staff?",
    answer:
      "Yes — show a valid Blue Light Card (NHS) when you book and get 15% off any service, tints or repairs.",
  },
  {
    question: "Can I get my brakes and a tint done on the same visit?",
    answer:
      "Absolutely — we handle tinting and mechanical work under one roof, so it's easy to book both in together.",
  },
];

const whyUs = [
  {
    title: "Better material than most competitors",
    description: "Premium ceramic film that genuinely outperforms what's typically sold on the high street.",
  },
  {
    title: "Lifetime warranty on ceramic",
    description: "The only tint on the market where we're confident enough to cover you for life.",
  },
  {
    title: "Hand-fitted, executive finish",
    description: "Bubble-free, edge-to-edge fitting — every vehicle, every time.",
  },
  {
    title: "Tints and repairs, one visit",
    description: "Window tinting, dechroming, brakes and servicing all under one roof.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
            Premium Window Tinting &amp; Vehicle Servicing
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Executive standard tinting.{" "}
            <span className="brand-gradient-text">Backed for life.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Standard dyed, ceramic and chameleon window tints, dechroming, brakes and servicing —
            finished properly, priced fairly, and backed by a lifetime warranty on every ceramic
            tint we fit.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/quote"
              className="brand-gradient-bg w-full rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] sm:w-auto"
            >
              Get a Free Quote
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/60 sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
            {[
              "10% off Ceramic Tint",
              "Lifetime Ceramic Warranty",
              "15% off with Blue NHS Card",
              "Chameleon Tint — Blue & Red",
            ].map((tag) => (
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

      {/* Why us */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Why Choose Us
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Better material. Better finish. Backed for life.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <div key={item.title} className="rounded-3xl border border-border bg-background p-7">
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tints */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Window Tints
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Standard, ceramic &amp; chameleon
            </h2>
          </div>
          <Link href="/tints" className="hidden shrink-0 text-sm font-semibold text-brand hover:underline sm:block">
            See all tints →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {tintServices.map((service) => (
            <ServiceCard
              key={service.slug}
              name={service.name}
              tagline={service.tagline}
              description={service.description}
              features={service.features.slice(0, 3)}
              fromPrice={service.fromPrice}
              badge={service.badge}
              quoteHref={`/quote?service=${encodeURIComponent(service.name)}`}
            />
          ))}
        </div>

        <Link href="/tints" className="mt-8 block text-center text-sm font-semibold text-brand hover:underline sm:hidden">
          See all tints →
        </Link>
      </section>

      {/* Repairs */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                Repairs &amp; Servicing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Brakes, oil changes &amp; full servicing
              </h2>
            </div>
            <Link href="/repairs" className="hidden shrink-0 text-sm font-semibold text-brand hover:underline sm:block">
              See all repairs →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {repairServices.map((service) => (
              <ServiceCard
                key={service.slug}
                name={service.name}
                tagline={service.tagline}
                description={service.description}
                features={service.features.slice(0, 3)}
                fromPrice={service.fromPrice}
                quoteHref={`/quote?service=${encodeURIComponent(service.name)}`}
              />
            ))}
          </div>

          <Link href="/repairs" className="mt-8 block text-center text-sm font-semibold text-brand hover:underline sm:hidden">
            See all repairs →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              FAQs
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
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
        </div>
        <FaqJsonLd items={faqs} />
      </section>

      {/* From the blog */}
      {blogPosts.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  From the Blog
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Tinting &amp; car care guides
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden shrink-0 text-sm font-semibold text-brand hover:underline sm:block"
              >
                View all posts →
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-3xl border border-border bg-background p-8 transition-colors hover:border-brand/40"
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
              className="mt-8 block text-center text-sm font-semibold text-brand hover:underline sm:hidden"
            >
              View all posts →
            </Link>
          </div>
        </section>
      )}

      {/* Final CTA + form */}
      <section id="lead-form" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Get Started
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get your free quote today
            </h2>
            <p className="mt-4 max-w-md text-muted">
              Fill in your details and we&apos;ll come back with a price for your vehicle — no
              obligation.
            </p>
            <div className="mt-8 space-y-4 text-sm text-muted">
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Free, no-obligation quote
              </p>
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Response within one business day
              </p>
              <p className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-brand">
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
