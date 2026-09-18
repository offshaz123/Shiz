const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Each step takes a stop along the brand gradient, so the row sweeps
   purple through pink to orange rather than using unrelated colours. */
const steps = [
  {
    step: "Discovery",
    colour: "#7b2ff7",
    body: "We learn your business, who your customers are, and what one of them is actually worth to you over a year.",
    icon: icon("M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"),
  },
  {
    step: "Audit",
    colour: "#9b3df2",
    body: "The Lead Leak Audit. Your website, tracking, enquiry process and what your competitors are already running.",
    icon: icon("M4 4v16h16M8 16v-5M12 16V8M16 16v-3"),
  },
  {
    step: "Strategy",
    colour: "#e0218a",
    body: "A prioritised plan based on what we found, ordered by what it's worth rather than what's easiest to sell you.",
    icon: icon("M12 3l2.4 5.4 5.6.8-4 4 1 5.8-5-2.7-5 2.7 1-5.8-4-4 5.6-.8L12 3z"),
  },
  {
    step: "Build",
    colour: "#ff3ea5",
    body: "Campaigns, creative, landing pages and tracking. Built properly before anything goes live, including the compliance side.",
    icon: icon("M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"),
  },
  {
    step: "Launch",
    colour: "#f7941e",
    body: "We go live and leave it alone long enough to learn. The first fortnight is noisy by design, and we'll tell you what it means.",
    icon: icon("M12 2s4.5 3.6 4.5 9c0 2.5-1 4.4-1 4.4h-7S7.5 13.5 7.5 11C7.5 5.6 12 2 12 2zM9 19l1.5 3 1.5-2 1.5 2L15 19"),
  },
  {
    step: "Optimise & Report",
    colour: "#ffab2e",
    body: "Test, refresh, scale what works. Monthly reporting on enquiries and what they cost, not reach and impressions.",
    icon: icon("M3 21h18M6 21V9M12 21V4M18 21v-7"),
  },
];

export function HowWeWork() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
          How we work
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          From first call to{" "}
          <span className="brand-gradient-text">booked customers</span>
        </h2>
        <p className="mt-5 text-muted">
          Six steps. You&apos;ll know which one we&apos;re on at any point.
        </p>
      </div>

      <div className="mt-20 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((item, i) => (
          <div key={item.step} className="relative">
            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <span
                className="relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-black/15"
                style={{ backgroundColor: item.colour }}
              >
                {item.icon}
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
                  {i + 1}
                </span>
              </span>
            </div>

            <div className="h-full rounded-2xl border border-border bg-surface px-7 pb-7 pt-12 text-center">
              <span
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: item.colour }}
              >
                Step {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.step}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
