import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Exclusive Tints & Repairs — premium window tinting and vehicle servicing, using better material than most competitors and backing it with a lifetime warranty on ceramic.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Exclusive Tints & Repairs",
    description:
      "Premium window tinting and vehicle servicing, using better material than most competitors and backing it with a lifetime warranty on ceramic.",
  },
};

const values = [
  {
    title: "Premium material, every time",
    description:
      "We don't fit the cheapest film on the market. Our ceramic tint is genuinely better than what most competitors use — which is exactly why we're confident enough to put a lifetime warranty behind it.",
  },
  {
    title: "Finished to an executive standard",
    description:
      "Bubble-free, edge-to-edge, hand-fitted finish on every vehicle — from a daily runaround to an executive saloon. If it's not right, we don't hand the keys back.",
  },
  {
    title: "Tints and mechanical work, one place",
    description:
      "Window tinting, dechroming, brakes and servicing — book it all in one visit instead of juggling different garages.",
  },
  {
    title: "Straightforward pricing",
    description:
      "You'll know the price before we start. No hidden extras, no upsells you didn't ask for.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "About", url: `${siteConfig.url}/about` },
        ]}
      />
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Who We Are
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Executive standard tinting &amp; servicing
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Exclusive Tints &amp; Repairs was built on one idea: your car should be treated like it
            matters. That means premium film, careful fitting, and a team that stands behind its
            work.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-foreground">Our story</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Too many tint shops cut corners on material to win on price, then leave you with tint
            that bubbles, purples or fades within a couple of years. We took the opposite approach:
            source better ceramic film than most of the competition, fit it properly, and back it
            with a warranty that actually means something — for life, not for twelve months.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            Alongside tinting, we run a full repairs and servicing side — brakes, oil changes and
            full services — so your car is looked after from the paintwork to the engine bay,
            without needing two different garages.
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
          Ready to book your car in?
        </h2>
        <p className="mt-4 text-muted">
          Get a free, no-obligation quote for tinting, dechroming, brakes or servicing.
        </p>
        <Link
          href="/quote"
          className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
        >
          Get a Free Quote
        </Link>
      </section>
    </div>
  );
}
