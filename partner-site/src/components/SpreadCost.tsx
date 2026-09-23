/**
 * What a 2.5% FX margin costs, by monthly conversion volume.
 *
 * A single-series bar chart, so there is no legend: the heading names the one
 * thing being measured and every bar carries its own value. Bars are built in
 * HTML rather than SVG because the labels then wrap and scale like any other
 * text on the page, which matters more here than drawing precision.
 *
 * The arithmetic is the whole argument and it is arithmetic, not a claim about
 * our own pricing: 2.5% of the amount converted, monthly and annualised. The
 * note under the chart says exactly that.
 */
const rows = [
  { volume: 100_000, label: "£100,000" },
  { volume: 250_000, label: "£250,000" },
  { volume: 500_000, label: "£500,000" },
  { volume: 1_000_000, label: "£1m" },
];

const MARGIN = 0.025;
const max = rows[rows.length - 1].volume * MARGIN;

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

export function SpreadCost() {
  return (
    <figure className="card p-6 sm:p-8">
      <figcaption>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          What a 2.5% margin costs, by monthly volume
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Monthly cost of conversion, with the annual figure beside it.
        </p>
      </figcaption>

      <ul className="mt-8 space-y-6">
        {rows.map((row) => {
          const monthly = row.volume * MARGIN;
          const width = `${(monthly / max) * 100}%`;

          return (
            <li key={row.label}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-xs text-muted">{row.label} / month</span>
                <span className="text-sm font-semibold tabular-nums">
                  {money(monthly)}
                  <span className="ml-2 font-normal text-muted">
                    {money(monthly * 12)} a year
                  </span>
                </span>
              </div>

              <div className="mt-2.5 h-3 w-full rounded-full bg-surface-2">
                <div
                  className="h-3 rounded-full bg-accent"
                  style={{ width }}
                  title={`${row.label} a month converted at a 2.5% margin costs ${money(monthly)} a month, ${money(monthly * 12)} a year.`}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted">
        Illustrative arithmetic at a 2.5% margin — the middle of the 2–3% commonly charged on
        business FX, and usually taken inside the rate rather than shown as a fee. What you pay
        today depends on your provider and your volume. Send us one real conversion and we will
        price the same transaction beside it.
      </p>
    </figure>
  );
}
