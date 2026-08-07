const industryStats = [
  { value: "16+", label: "Automotive clients" },
  { value: "50+", label: "Finance clients" },
  { value: "10+", label: "Restaurant & hospitality clients" },
];

export function IndustryStatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Industries We Work With
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Trusted across automotive, finance & hospitality
        </h2>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {industryStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-border bg-surface p-8 text-center transition-colors hover:border-brand-pink/40"
          >
            <p className="brand-gradient-text text-4xl font-bold">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
