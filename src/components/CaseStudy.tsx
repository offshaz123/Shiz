const testimonial = {
  company: "Detailmatics",
  industry: "Car Servicing — Multiple Services",
  stats: { leads: 235, costPerLead: "3.89", spend: "913.48", bookedCustomers: "150+" },
  quoteParagraphs: [
    "Working with the team to run our Meta Ads using their AI-powered agent has been one of the best decisions we've made. The campaigns consistently brought in high-quality leads, and we saw a significant increase in customer enquiries within the first month.",
    "Thanks to their AI system, we booked multiple meetings throughout the month with potential customers who were genuinely interested in our services. The quality of the leads was much better than what we had experienced before, and it helped us improve both our sales pipeline and overall business growth.",
    "Their expertise, communication, and results exceeded our expectations. If you're looking to generate more customers and grow your business with Meta Ads, I highly recommend their AI-powered marketing solution.",
  ],
};

export function CaseStudySection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Case Study
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {testimonial.stats.leads} Leads, {testimonial.stats.bookedCustomers} Booked Customers
          for {testimonial.company}
        </h2>
        <p className="mt-4 text-muted">
          {testimonial.company} offers {testimonial.industry.toLowerCase()}. We&apos;ve been
          running their Meta &amp; Instagram ads for the past year.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-5 lg:items-start">
        <div className="lg:col-span-2 rounded-3xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-pink" />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              Meta Ads Manager — Detailmatics
            </p>
          </div>

          <svg viewBox="0 0 300 100" fill="none" className="mt-5 h-24 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="caseStudyLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7b2ff7" />
                <stop offset="0.55" stopColor="#e0218a" />
                <stop offset="1" stopColor="#f7941e" />
              </linearGradient>
              <linearGradient id="caseStudyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#e0218a" stopOpacity="0.25" />
                <stop offset="1" stopColor="#e0218a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 85 C 40 80, 60 60, 100 55 S 160 35, 200 28 S 260 12, 300 6 V100 H0 Z"
              fill="url(#caseStudyFill)"
            />
            <path
              d="M0 85 C 40 80, 60 60, 100 55 S 160 35, 200 28 S 260 12, 300 6"
              stroke="url(#caseStudyLine)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-1 text-[11px] text-muted">Leads generated — month one, trending up</p>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5">
            <div>
              <p className="brand-gradient-text text-2xl font-bold">{testimonial.stats.leads}</p>
              <p className="mt-1 text-xs text-muted">leads in month one</p>
            </div>
            <div>
              <p className="brand-gradient-text text-2xl font-bold">£{testimonial.stats.costPerLead}</p>
              <p className="mt-1 text-xs text-muted">cost per lead</p>
            </div>
            <div>
              <p className="brand-gradient-text text-2xl font-bold">{testimonial.stats.bookedCustomers}</p>
              <p className="mt-1 text-xs text-muted">customers booked in</p>
            </div>
            <div>
              <p className="brand-gradient-text text-2xl font-bold">1 year</p>
              <p className="mt-1 text-xs text-muted">ongoing partnership</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-8">
          <svg viewBox="0 0 32 24" fill="none" className="h-8 w-8 text-brand-pink/40">
            <path
              d="M0 24V14.4C0 6.4 4.8 1.2 12.8 0l1.6 3.2C9.6 4.8 7.2 8 7.2 12h6.4v12H0Zm17.6 0V14.4c0-8 4.8-13.2 12.8-14.4L32 3.2c-4.8 1.6-7.2 4.8-7.2 8.8h6.4v12H17.6Z"
              fill="currentColor"
            />
          </svg>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground">
            {testimonial.quoteParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold text-foreground">
            — {testimonial.company}
            <span className="ml-2 font-normal text-muted">{testimonial.industry}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
