const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const deliverables = [
  {
    title: "A plan, before any spend",
    body: "What we'd run for your business and why, based on what a customer is actually worth to you rather than a template.",
    icon: icon("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 13h6M9 17h4"),
  },
  {
    title: "Campaigns built and managed",
    body: "Meta, Instagram and Google, structured properly and watched daily. Not set up once and left alone until something breaks.",
    icon: icon("M4 4v16h16M8 16V10M12 16V6M16 16v-4M20 16v-8"),
  },
  {
    title: "Creative written and tested",
    body: "At least two versions running against each other, refreshed when they fatigue, so you find out what your customers respond to.",
    icon: icon("M12 19l7-7 2 2-7 7-2-2zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 11a2 2 0 11-4 0 2 2 0 014 0z"),
  },
  {
    title: "Tracking set up properly",
    body: "Meta Pixel, Conversions API, Google Analytics and Search Console, installed and verified rather than half-connected.",
    icon: icon("M12 21a9 9 0 100-18 9 9 0 000 18zM12 12l4-2M12 7v5"),
  },
  {
    title: "Every enquiry in one place",
    body: "Instagram, Facebook, WhatsApp, forms and missed calls landing in a single inbox, with follow-up that runs whether you remember or not.",
    icon: icon("M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"),
  },
  {
    title: "Reporting you can read",
    body: "How many enquiries came in, what each one cost, and what happens next. Not a twelve-page document about reach and impressions.",
    icon: icon("M9 17v-6M12 17v-9M15 17v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"),
  },
];

export function Deliverables() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
            Clear deliverables
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What you actually get{" "}
            <span className="brand-gradient-text">every month</span>
          </h2>
          <p className="mt-5 text-muted">
            No vague retainer. Here&apos;s the work, written down.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background p-7">
              <span className="brand-gradient-bg inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                {item.icon}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
