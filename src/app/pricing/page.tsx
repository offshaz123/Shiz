import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/PricingSection";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";
import { StartProjectCta } from "@/components/StartProjectCta";
import { pricingGroups } from "@/content/pricing";

const description =
  "Transparent pricing for Meta & Instagram ads from £400/month, Google Ads at one flat £600/month including the landing page and CRM, and SEO from £350/month. No hidden setup fees.";

export const metadata: Metadata = {
  title: "Pricing",
  description,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Shaz Marketing Group",
    description,
  },
};

const faqs = [
  {
    question: "Is ad spend included in the price?",
    answer:
      "No. The plan price covers our management, the build and the platform. Ad spend is separate and paid directly to Meta or Google, so you always know exactly what's going to advertising versus what's going to us.",
  },
  {
    question: "What does the £600 Google Ads price actually include?",
    answer:
      "The account build, the keyword research, the campaigns, a landing page built for the campaign, conversion and call tracking, a CRM if you need somewhere for the leads to land, and monthly optimisation where we rewrite ads, move budget and cut out the keywords wasting your money. There's no separate setup fee and no add-ons.",
  },
  {
    question: "Why does SEO have a minimum term when the ads don't?",
    answer:
      "Because SEO takes months to show. The first month is groundwork, the results land later. A minimum term means you don't pay for the foundations and then leave before they've done anything for you. Ads work quickly, so they run month to month.",
  },
  {
    question: "Can you guarantee I'll rank number one on Google?",
    answer:
      "No, and nobody honest can. Google doesn't sell positions in the organic results and anyone promising you one is either guessing or lying. What we guarantee is the work, done every month, reported clearly enough that you can see it happening.",
  },
  {
    question: "How much is social media management?",
    answer:
      "It depends on how many platforms you want covered and how often you want posting, so we quote it on the call rather than putting a package on the page. Tell us what you need and you'll get a straight number.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "Not on the ad plans. Meta and Google Ads run monthly and you can cancel anytime. SEO runs on a 3 or 6 month minimum term depending on the plan, and we tell you that up front rather than burying it.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. Move up or down as your business changes, or run more than one service together. Most clients start with one and add the second once the first is paying for itself.",
  },
  {
    question: "Do you charge a setup fee?",
    answer:
      "No. What's on this page is what you pay. If you also need a website built from scratch that's a separate one-off, and we'll quote it before we start, never after.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Pricing", url: `${siteConfig.url}/pricing` },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Pricing
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            What it costs, on the page
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            No &ldquo;request a quote&rdquo; on everything, no setup fee that appears after
            you&apos;ve said yes. Here&apos;s what we charge and what you get for it. Ad spend is
            always separate from our fee, and we&apos;ll tell you what to budget before you commit
            to anything.
          </p>

          <nav className="mt-10 flex flex-wrap justify-center gap-2.5">
            {pricingGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand-pink/60"
              >
                {group.eyebrow}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {pricingGroups.map((group, i) => (
        <PricingSection
          key={group.id}
          group={group}
          className={i % 2 === 1 ? "border-t border-border bg-surface" : "border-t border-border"}
        />
      ))}

      {/* Websites note */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="rounded-3xl border border-border bg-background p-8 sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Need the website too?
            </h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-muted">
              If you don&apos;t have a site yet, or the one you have isn&apos;t doing anything for
              you, we build those as a one-off rather than a monthly fee. A campaign landing page
              is already included in the ad plans above, so this is for a full site with your
              pages, your tracking and your Google and Meta pixels wired in from day one. Hosting
              sits with you so you own it outright, and we&apos;ll set it up for you either way.
            </p>
            <Link
              href="/services/web-design"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink hover:underline"
            >
              More on web design <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              FAQs
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Pricing questions
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

      <StartProjectCta />
    </div>
  );
}
