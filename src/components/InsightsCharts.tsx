import type { SpendDay } from "@/lib/ad-spend";
import type { Funnel } from "@/lib/insights";

// The charts on Admin → Insights: how far visits get before leaving, and ad
// spend per day.

const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;

export function FunnelCharts({ funnels }: { funnels: Funnel[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {funnels.map((f) => {
        const top = Math.max(1, ...f.steps.map((s) => s.count));
        return (
          <div key={f.id} className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{f.name}</p>
            <ul className="mt-3 space-y-3">
              {f.steps.map((s, i) => {
                const prev = i > 0 ? f.steps[i - 1].count : 0;
                const last = i === f.steps.length - 1;
                return (
                  <li key={s.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{s.label}</span>
                      <span className="font-bold tabular-nums">{s.count}</span>
                    </div>
                    <div className="mt-1 h-3 rounded-full bg-surface-2">
                      <div
                        className={`h-3 rounded-full ${last ? "bg-[#1f7a3d]" : "gold-bg"}`}
                        style={{ width: `${Math.max(s.count ? 2 : 0, (s.count / top) * 100)}%` }}
                      />
                    </div>
                    {i > 0 && prev > 0 && (
                      <p className={`mt-0.5 text-xs ${s.count / prev < 0.2 ? "font-semibold text-[#b42318]" : "text-muted"}`}>
                        {Math.round((s.count / prev) * 100)}% of the step before
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

const PLATFORMS = [
  { id: "tiktok", name: "TikTok", colour: "#e5194f" },
  { id: "google", name: "Google Ads", colour: "#1a73e8" },
  { id: "meta", name: "Meta", colour: "#7b4fd6" },
  { id: "other", name: "Other", colour: "#8a8378" },
] as const;

export function SpendChart({ days }: { days: SpendDay[] }) {
  const total = (d: SpendDay) => PLATFORMS.reduce((n, p) => n + d[p.id], 0);
  const top = Math.max(1, ...days.map(total));
  const sums = PLATFORMS.map((p) => ({ ...p, sum: days.reduce((n, d) => n + d[p.id], 0) })).filter((p) => p.sum > 0);
  const label = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {sums.length === 0 && <span className="text-muted">No ad spend in these dates.</span>}
        {sums.map((p) => (
          <span key={p.id} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: p.colour }} />
            {p.name} <strong className="tabular-nums">{gbp(p.sum)}</strong>
          </span>
        ))}
      </div>
      <div className="mt-4 flex h-48 items-end gap-[2px]" role="img" aria-label="Ad spend per day">
        {days.map((d) => (
          <div key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${label(d.day)}: ${gbp(total(d))}`}>
            {PLATFORMS.filter((p) => d[p.id] > 0).map((p) => (
              <div key={p.id} style={{ height: `${(d[p.id] / top) * 100}%`, background: p.colour }} className="w-full first:rounded-t-sm" />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{days[0] && label(days[0].day)}</span>
        <span>Highest day {gbp(top)}</span>
        <span>{days.at(-1) && label(days.at(-1)!.day)}</span>
      </div>
      <p className="mt-2 text-xs text-muted">TikTok shows on the day you topped up; Google and Meta on the day it was spent. What comes off your card, with any VAT and fees.</p>
    </div>
  );
}
