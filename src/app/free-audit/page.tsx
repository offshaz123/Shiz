import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { whatsappHref } from "@/lib/site-config";

const description =
  "We'll go through your website and social accounts and send you a plain-English list of what's stopping you getting enquiries. Free, no obligation.";

export const metadata: Metadata = {
  title: "Free Marketing Audit",
  description,
  alternates: { canonical: "/free-audit" },
  openGraph: { title: "Free Marketing Audit | Shaz Marketing Group", description },
};

const checks = [
  {
    title: "Is anything actually being tracked?",
    body: "Most sites we look at have no Meta Pixel, or one that was installed years ago and stopped recording. Without it your ads can't learn and you can't retarget anyone who visited and left.",
  },
  {
    title: "How easy is it to contact you?",
    body: "We check it on a phone, the way your customers do. Missing phone number, a form that's four scrolls down, no WhatsApp — these quietly cost more enquiries than bad advertising does.",
  },
  {
    title: "What happens after someone enquires?",
    body: "Where does the enquiry go, who sees it, and how fast. This is where most businesses lose more money than anywhere else in their marketing.",
  },
  {
    title: "Can people find you at all?",
    body: "Your Google Business Profile, your business details across the web, and whether your site says anything a search engine can use.",
  },
  {
    title: "What your ads would be up against",
    body: "Whether your category has advertising restrictions you need to know about, and what your competitors are already running.",
  },
];

export default function FreeAuditPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Free Audit", url: "/free-audit" }]} />

      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="brand-gradient-bg pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[880px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted">
              Free · No obligation
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Find out what&apos;s stopping{" "}
              <span className="brand-gradient-text">your enquiries</span>
            </h1>
            <p className="mt-6 text-lg text-muted">
              Send us your website and we&apos;ll go through it properly — tracking, enquiry
              routes, local search and what your category allows you to advertise. You get a
              plain-English list of what&apos;s wrong and what to fix first.
            </p>
            <p className="mt-4 text-muted">
              No jargon, no 40-page PDF, and nothing you have to buy. If we think you don&apos;t
              need us, we&apos;ll tell you that too.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-6 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60"
              >
                Rather send it on WhatsApp?
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-7 shadow-xl shadow-black/5 sm:p-9">
            <h2 className="text-xl font-bold text-foreground">Request your free audit</h2>
            <p className="mt-2 text-sm text-muted">
              Takes about a minute. We&apos;ll come back to you within one working day.
            </p>
            <div className="mt-6">
              <LeadForm
                compact
                askWebsite
                source="Free audit page"
                submitLabel="Send Me My Free Audit"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            What we look at
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Five things, checked properly
          </h2>
          <p className="mt-4 text-muted">
            This is the same audit we run before taking on any client. It takes us about an hour.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {checks.map((check, i) => (
            <div key={check.title} className="rounded-2xl border border-border bg-surface p-7">
              <span className="brand-gradient-text text-3xl font-bold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{check.title}</h3>
              <p className="mt-2 text-sm text-muted">{check.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why we do this for free
          </h2>
          <p className="mt-5 text-muted">
            Because it&apos;s the fastest way to show you we know what we&apos;re talking about.
            Most agencies open with a pitch. We&apos;d rather open by telling you something
            useful about your own business that you didn&apos;t already know.
          </p>
          <p className="mt-4 text-muted">
            If you want us to fix what we find, that conversation is easy. If you&apos;d rather
            take the list and sort it yourself, that&apos;s genuinely fine.
          </p>
          <Link
            href="/pricing"
            className="mt-8 inline-block text-sm font-semibold text-brand-pink hover:underline"
          >
            See what we charge if you do want help →
          </Link>
        </div>
      </section>
    </div>
  );
}
