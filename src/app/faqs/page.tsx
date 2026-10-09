import type { Metadata } from "next";
import Link from "next/link";
import { Faqs, FaqJsonLd } from "@/components/Faqs";
import { PageHero } from "@/components/PageHero";
import { whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers about road-legal number plates, documents, delivery and returns.",
};

export default function FaqsPage() {
  return (
    <>
      <FaqJsonLd />
      <PageHero eyebrow="Help centre" title="FAQs">
        Everything you need to know about ordering your plates.
      </PageHero>
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Faqs />
        <div className="mt-10 rounded-3xl border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-3xl font-bold">Still have questions?</h2>
          <p className="mt-2 text-muted">We&apos;re happy to help.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href={whatsappHref} className="btn btn-gold">
              WhatsApp us
            </a>
            <Link href="/contact" className="btn btn-white">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
