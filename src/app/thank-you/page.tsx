import type { Metadata } from "next";
import Link from "next/link";
import { whatsappHref, siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Thank You",
  description: `Thanks for reaching out to ${siteConfig.name}.`,
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center sm:px-8">
      <div className="brand-gradient-bg flex h-16 w-16 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-white">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Thanks — we&apos;ve got your enquiry!
      </h1>
      <p className="mt-4 max-w-md text-muted">
        A member of the {siteConfig.name} team will be in touch shortly with a quote and the next available slot.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-brand-pink/60"
        >
          Message us on WhatsApp now
        </a>
        <Link
          href="/"
          className="brand-gradient-bg rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
