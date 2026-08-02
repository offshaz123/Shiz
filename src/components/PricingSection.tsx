import Link from "next/link";

type Tier = {
  name: string;
  price: string;
  tagline: string;
  popular?: boolean;
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "£400",
    tagline: "For businesses ready to switch on Meta & Instagram lead generation.",
    features: [
      "Meta & Instagram ad campaign setup",
      "1 active ad campaign, fully managed",
      "High-converting lead capture landing page",
      "Unified Instagram + Facebook inbox",
      "Lead notifications straight to you",
      "Monthly performance report",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "£700",
    tagline: "Our most popular plan — built to turn ad spend into a real pipeline.",
    popular: true,
    features: [
      "Everything in Starter, plus:",
      "Up to 3 active campaigns + A/B creative testing",
      "Full CRM pipeline built around your business",
      "All-in-one inbox: Instagram, Messenger, WhatsApp & SMS",
      "Automated lead follow-up (SMS + email sequences)",
      "Missed-call text-back so no enquiry is lost",
      "Fortnightly strategy calls",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "£1,400",
    tagline: "For businesses ready to dominate their market across every channel.",
    features: [
      "Everything in Growth, plus:",
      "Unlimited campaigns across Meta & Instagram",
      "Advanced retargeting & lookalike funnels",
      "24/7 AI receptionist & chatbot for instant replies",
      "Automated booking, reminders & review requests",
      "Multi-location / multi-channel support",
      "Dedicated account manager",
      "Weekly reporting & strategy calls",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Simple plans, built to grow with you
        </h2>
        <p className="mt-4 text-muted">
          Every plan includes done-for-you Meta &amp; Instagram ads management. Choose the level
          of automation and support that fits where your business is right now.
        </p>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              tier.popular
                ? "border-transparent bg-surface shadow-2xl shadow-black/10 ring-2 ring-brand-pink"
                : "border-border bg-surface"
            }`}
          >
            {tier.popular && (
              <span className="brand-gradient-bg absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-md">
                Most Popular
              </span>
            )}
            <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight text-foreground">
                {tier.price}
              </span>
              <span className="text-sm text-muted">/month</span>
            </div>
            <p className="mt-3 text-sm text-muted">{tier.tagline}</p>

            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  {f.endsWith(":") ? (
                    <span className="pt-0.5 font-semibold text-foreground">{f}</span>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink"
                      >
                        <path
                          d="M5 13l4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-muted">{f}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className={`mt-8 rounded-full px-5 py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] ${
                tier.popular
                  ? "brand-gradient-bg text-white shadow-lg shadow-black/10"
                  : "border border-border text-foreground"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        Ad spend is separate from your management fee and is paid directly to Meta. Plans run
        monthly with no long-term contract — cancel anytime.
      </p>
    </section>
  );
}
