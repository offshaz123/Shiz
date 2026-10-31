import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";
import { FeedbackForm } from "@/components/FeedbackForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Feedback",
  description: `Tell ${brand.name} what works on this site and what does not.`,
  alternates: { canonical: "/feedback" },
};

export default function FeedbackPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Feedback", path: "/feedback" },
        ]}
      />
      <Section>
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Feedback</Eyebrow>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Tell us what you think
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Something confusing, something missing, something plainly wrong — we would
            rather hear it than not. It takes about thirty seconds and a person reads
            every one.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            If you need an answer about an account, the{" "}
            <a href="/contact" className="font-semibold text-accent-2 hover:underline">
              contact page
            </a>{" "}
            will get you one faster.
          </p>

          <div className="mt-10">
            <FeedbackForm />
          </div>
        </div>
      </Section>
    </>
  );
}
