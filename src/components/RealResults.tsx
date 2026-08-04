// Ordered best cost-per-lead first.
const results = [
  { industry: "Automotive — Ceramic Coating", leads: 37, spend: 166.02 },
  { industry: "Automotive — Window Tinting", leads: 43, spend: 316.29 },
  { industry: "Automotive — Servicing & Repairs", leads: 92, spend: 743.75 },
  { industry: "Real Estate", leads: 20, spend: 205.68 },
];

export const bestCostPerLead = Math.min(...results.map((r) => r.spend / r.leads)).toFixed(2);

const totalLeads = results.reduce((sum, r) => sum + r.leads, 0);
const totalSpend = results.reduce((sum, r) => sum + r.spend, 0);
const avgCostPerLead = (totalSpend / totalLeads).toFixed(2);

export function RealResultsSection() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
            Real Campaigns, Real Results
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Live numbers, pulled straight from Meta Ads Manager
          </h2>
          <p className="mt-4 text-muted">
            Not projections — actual lead generation results from client campaigns we&apos;re
            currently running, over the last 30 days.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((r) => (
            <div
              key={r.industry}
              className="rounded-3xl border border-border bg-background p-6 text-center transition-colors hover:border-brand-pink/40"
            >
              <p className="brand-gradient-text text-3xl font-bold">{r.leads}</p>
              <p className="mt-1 text-xs text-muted">leads generated</p>
              <p className="mt-4 text-sm font-semibold text-foreground">{r.industry}</p>
              <p className="mt-1 text-xs text-muted">£{(r.spend / r.leads).toFixed(2)} per lead</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
          <span className="font-semibold text-foreground">{totalLeads} leads</span> generated for
          clients in the last 30 days, at an average cost of{" "}
          <span className="font-semibold text-foreground">£{avgCostPerLead} per lead</span>.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-muted">
          Results shown are from active client ad accounts and vary by industry, targeting and
          creative — past performance isn&apos;t a guarantee of future results.
        </p>
      </div>
    </section>
  );
}
