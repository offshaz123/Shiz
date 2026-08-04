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
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5 text-center lg:text-left">
            <p className="brand-gradient-text text-3xl font-bold">{testimonial.stats.leads}</p>
            <p className="mt-1 text-xs text-muted">leads in month one</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center lg:text-left">
            <p className="brand-gradient-text text-3xl font-bold">£{testimonial.stats.costPerLead}</p>
            <p className="mt-1 text-xs text-muted">cost per lead</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center lg:text-left">
            <p className="brand-gradient-text text-3xl font-bold">{testimonial.stats.bookedCustomers}</p>
            <p className="mt-1 text-xs text-muted">customers booked in</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5 text-center lg:text-left">
            <p className="brand-gradient-text text-3xl font-bold">1 year</p>
            <p className="mt-1 text-xs text-muted">ongoing partnership</p>
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
