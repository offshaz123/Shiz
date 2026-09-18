import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig, whatsappHref } from "@/lib/site-config";

const description =
  "Speak to Walid Shah directly about Meta and Instagram ads for your business. No call centre, no account manager — you deal with the person doing the work.";

export const metadata: Metadata = {
  title: "Talk to Walid",
  description,
  alternates: { canonical: "/walid" },
  openGraph: { title: "Talk to Walid | Shaz Marketing Group", description },
};

const expect = [
  {
    title: "A straight answer on price",
    body: "Plans start at £400 a month and ad spend is separate. You'll have the numbers on the first call, not the third.",
  },
  {
    title: "What I'd actually run",
    body: "Not a generic proposal. I'll have looked at your site and your category before we speak.",
  },
  {
    title: "No promised lead counts",
    body: "I won't invent a figure before I've spent a pound of your money, and I'd be wary of anyone who does.",
  },
];

export default function WalidPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Talk to Walid", url: "/walid" }]} />

      <section className="relative overflow-hidden bg-[#0b0a0f]">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -left-24 top-0 h-[460px] w-[620px] rounded-full opacity-[0.17] blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-24">
          <div>
            <div className="flex items-center gap-5">
              <span className="brand-gradient-bg flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white">
                WS
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Walid Shah
                </h1>
                <p className="mt-1.5 text-white/60">Client Strategy · Shaz Marketing Group</p>
              </div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-white/70">
              I look after new client accounts here. If you get in touch through this page it
              comes straight to me, and I&apos;ll be the one who goes through your business,
              builds the plan and stays on it once the campaigns are live.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-baseline gap-3">
                <span className="brand-gradient-text text-4xl font-bold">97%</span>
                <span className="font-semibold text-white">Client satisfaction</span>
              </div>
              <div className="mt-2.5 flex gap-1" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-[#f7941e]" aria-hidden="true">
                    <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
                  </svg>
                ))}
              </div>
              <p className="mt-3 text-sm text-white/50">
                Feedback rating across Shaz Marketing Group clients.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-gradient-bg inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]"
              >
                Message me on WhatsApp
              </a>
              <a
                href={`tel:${siteConfig.phoneE164}`}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/45"
              >
                Call {siteConfig.phoneDisplay}
              </a>
            </div>

            <p className="mt-6 text-sm text-white/45">
              {siteConfig.address.line1}, {siteConfig.address.line2}, {siteConfig.address.city}{" "}
              {siteConfig.address.postcode} · <a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a>
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur sm:p-9">
            <h2 className="text-xl font-bold text-white">Send me a message</h2>
            <p className="mt-2 text-sm text-white/55">
              Straight to my inbox. I&apos;ll come back to you within one working day.
            </p>
            <div className="mt-7">
              <LeadForm
                compact
                allowAttachment
                source="Walid personal page"
                submitLabel="Send It To Walid"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          What to expect from the call
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {expect.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Prefer the standard route?{" "}
          <Link href="/contact" className="font-semibold text-brand-pink hover:underline">
            Use the contact page →
          </Link>
        </p>
      </section>
    </div>
  );
}
