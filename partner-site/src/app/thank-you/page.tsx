import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your enquiry has been sent.",
  // A transactional confirmation, not a page anyone should land on from search.
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <Section>
      <div className="mx-auto max-w-xl py-10 text-center">
        <Eyebrow>Enquiry sent</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Thank you — that is with us</h1>
        <p className="mt-6 text-base leading-relaxed text-muted">
          We read every enquiry ourselves and usually come back the same working day. If it is
          urgent, call {brand.phoneDisplay} and ask for whoever is covering new accounts.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/opening-an-account"
            className="rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
          >
            See what we will need
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold transition-colors hover:border-accent"
          >
            Back to the homepage
          </Link>
        </div>
      </div>
    </Section>
  );
}
