import type { Metadata } from "next";
import { PricingSection } from "@/components/PricingSection";
import { FaqJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for done-for-you Meta & Instagram ads management — from £400/month, no long-term contract. See what's included in each plan.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing | Shaz Marketing Group",
    description:
      "Simple, transparent pricing for done-for-you Meta & Instagram ads management — from £400/month, no long-term contract. See what's included in each plan.",
  },
};

const faqs = [
  {
    question: "Is ad spend included in the price?",
    answer:
      "No — the plan price covers our management, strategy and platform. Ad spend is separate and paid directly to Meta, so you always know exactly what's going to advertising versus our service.",
  },
  {
    question: "Is there a long-term contract?",
    answer: "No. Plans run monthly with no long-term contract — cancel anytime.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can move up or down between plans as your business needs change — just get in touch and we'll adjust it for you.",
  },
  {
    question: "Which plan is right for my business?",
    answer:
      "Most businesses starting out choose Starter or Growth. If you want the full CRM, automated follow-up and an AI receptionist handling enquiries around the clock, Scale is built for that. We'll help you pick the right one on a free strategy call.",
  },
];

export default function PricingPage() {
  return (
    <div>
      <div aria-hidden className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg" />
      </div>

      <PricingSection headingLevel="h1" />

      {/* FAQ */}
      <section className="border-t border-border bg-surface">
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
              <div key={faq.question} className="rounded-2xl border border-border bg-background p-6">
                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
        <FaqJsonLd items={faqs} />
      </section>
    </div>
  );
}
