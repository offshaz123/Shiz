import Link from "next/link";

const steps = [
  {
    title: "Website & Mobile Check",
    body: "How your site loads and reads on a phone, where the enquiry route is, and how many taps it takes to reach it.",
  },
  {
    title: "Tracking Audit",
    body: "Whether the Meta Pixel exists, whether it's firing, and whether the Conversions API, Analytics and Search Console are actually connected or just half-installed.",
  },
  {
    title: "Enquiry Path Analysis",
    body: "What happens after someone contacts you. Where it lands, who sees it, and how long it sits there. This is where most businesses lose the most money.",
  },
  {
    title: "Competitor & Ad Research",
    body: "What the businesses in your area are already running. Meta's ad library is public, so we can see their adverts, their offers and how long they've been live.",
  },
  {
    title: "Category & Compliance Check",
    body: "Whether your sector sits under restricted advertising rules, and what that means for what you're allowed to say before you spend anything.",
  },
  {
    title: "A Prioritised Plan",
    body: "What to fix first, in order of what it's worth. Plain English, no forty-page document, and nothing you have to buy from us.",
  },
];

export function AuditFramework() {
  return (
    <section className="relative overflow-hidden bg-[#0b0a0f] text-white">
      <div
        aria-hidden
        className="brand-gradient-bg pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[620px] rounded-full opacity-[0.16] blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <span className="inline-flex rounded-full border border-brand-pink/40 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            Our signature framework
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            The <span className="brand-gradient-text">Lead Leak</span> Audit
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/65">
            Before we build a single campaign we go through your website, your tracking, your
            enquiry process and what your competitors are already running. So the plan is built
            on what we found, not on what we usually sell.
          </p>
          <p className="mt-4 text-white/65">
            It takes us about an hour. It&apos;s free, and you keep the findings whether you work
            with us or not.
          </p>

          <Link
            href="/free-audit"
            className="brand-gradient-bg mt-9 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition-transform hover:scale-[1.03]"
          >
            Get My Free Audit <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ol className="relative space-y-9">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex gap-5 sm:gap-7">
              <div className="flex flex-col items-center">
                <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && (
                  <span aria-hidden className="mt-2 w-px flex-1 bg-white/12" />
                )}
              </div>
              <div className="pb-2">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-white/60">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
