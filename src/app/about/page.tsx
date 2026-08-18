import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Our London Meta Ads Agency",
  description:
    "Shaz Marketing Group helps businesses of every kind grow with Meta & Instagram ads, all-in-one CRM and AI-powered follow-up.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Shaz Marketing Group",
    description:
      "Shaz Marketing Group helps businesses of every kind grow with Meta & Instagram ads, all-in-one CRM and AI-powered follow-up.",
  },
};

const values = [
  {
    title: "Results over noise",
    description:
      "We're not here to make pretty ads for the sake of it — every campaign is built around one metric that matters: qualified leads for your business.",
  },
  {
    title: "One team, every channel",
    description:
      "From the first ad impression to the follow-up message, we manage the whole journey so nothing falls through the cracks.",
  },
  {
    title: "Built for every industry",
    description:
      "We work with businesses across every category — with particular expertise in the automotive sector — adapting our approach to what actually drives your customers to act.",
  },
  {
    title: "Always improving",
    description:
      "We continually refine campaigns, automations and our AI tools, so your results get stronger the longer we work together.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Who We Are
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            We turn Meta &amp; Instagram into a lead-generation engine
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Shaz Marketing Group is a performance marketing agency built for one purpose: helping
            businesses win more customers through Meta &amp; Instagram advertising, backed by the
            technology to manage every lead that comes in.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-foreground">Our story</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Too many businesses pour money into ads that generate clicks but not customers, or
            generate leads that get lost in a messy inbox and never get followed up. We started
            Shaz Marketing Group to fix both problems at once: we run the Meta &amp; Instagram
            advertising that brings the leads in, and we hand you an all-in-one system — a shared
            inbox, a CRM, automated follow-up and an AI receptionist — that makes sure every single
            enquiry gets a response.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            The result is simple: more of your ad spend turns into booked customers, and less of
            your time gets spent chasing software and spreadsheets.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
            What we stand for
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-3xl border border-border bg-background p-8">
                <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to grow your business?
        </h2>
        <p className="mt-4 text-muted">
          Book a free strategy call and let&apos;s talk about what Meta &amp; Instagram ads could
          do for you.
        </p>
        <Link
          href="/contact"
          className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get My Free Strategy Call
        </Link>
      </section>
    </div>
  );
}
