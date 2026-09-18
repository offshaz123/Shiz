const stats = [
  { value: "200+", label: "Projects", sub: "Delivered" },
  { value: "300+", label: "Clients", sub: "Worked with to date" },
  { value: "15+", label: "Industries", sub: "Served UK-wide" },
  { value: "£3.89", label: "Cost per lead", sub: "On our published campaign" },
];

/**
 * Credentials shown here must be ones we actually hold. Google Partner and
 * Meta Business Partner are formal programmes — listing one without being
 * accepted into it is a false claim and a trademark problem. Add entries
 * only once the badge has genuinely been awarded.
 */
const credentials: string[] = [];

export function StatsBar() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-muted">
          Trusted by UK businesses · Built for leads, not vanity metrics
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <div className="flex items-baseline justify-center gap-2.5 lg:justify-start">
                <span className="text-lg font-semibold text-foreground">{stat.label}</span>
                <span className="brand-gradient-text text-3xl font-bold tracking-tight sm:text-4xl">
                  {stat.value}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>

        {credentials.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-border pt-8">
            {credentials.map((name) => (
              <span key={name} className="text-sm font-medium text-muted">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
