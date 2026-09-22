/**
 * The hero visual: one payment, start to finish.
 *
 * Our provider puts an account dashboard here. We put the journey instead,
 * because the thing an importer wants to see is not a balance — it is money
 * arriving from his retailers and leaving for his supplier, with the cost of
 * the conversion shown rather than buried.
 *
 * Every figure is illustrative and the card says so.
 */
const steps = [
  {
    label: "Money in",
    party: "From your UK retailers",
    amount: "£48,200",
    currency: "GBP",
  },
  {
    label: "Converted",
    party: "Rate quoted before you commit",
    amount: "1.10",
    currency: "GBP → USD",
  },
  {
    label: "Paid out",
    party: "To your supplier in Shenzhen",
    amount: "$53,020",
    currency: "USD",
  },
];

export function PaymentFlowCard() {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          One payment, end to end
        </p>
        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
          Same day
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.label} className="relative">
            {index < steps.length - 1 && (
              <span
                className="absolute left-[15px] top-[42px] h-[calc(100%-26px)] w-px bg-border"
                aria-hidden="true"
              />
            )}
            <div className="flex gap-3.5">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[11px] text-accent">
                {index + 1}
              </span>
              <div className="flex-1 rounded-xl border border-border bg-background px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="font-mono text-sm tabular-nums">{step.amount}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="text-xs text-muted">{step.party}</span>
                  <span className="font-mono text-[11px] text-muted">{step.currency}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-[11px] leading-relaxed text-muted">
        Illustrative figures, not a real transaction. Rates and timings are corridor-specific.
      </p>
    </div>
  );
}
