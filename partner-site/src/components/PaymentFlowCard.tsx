import { Flag } from "@/components/Flag";

/**
 * The hero visual: one payment, start to finish.
 *
 * Our provider puts an account dashboard here. We put the journey instead,
 * because the thing an importer wants to see is not a balance — it is money
 * arriving from his retailers and leaving for his supplier, with the cost of
 * the conversion shown rather than buried.
 *
 * Every figure is illustrative and the card says so.
 *
 * NOTE — this card is styled for the blue hero and appears nowhere else. Its
 * panels are translucent white over that band rather than solid, so it reads
 * as one piece of glass rather than a white box dropped on a dark ground. If
 * it is ever reused on a white section it will need its own light variant;
 * white-on-white would be invisible, which is exactly what happened when the
 * hero first went blue and these were still bg-background.
 */
const steps = [
  {
    label: "Money in",
    party: "From your UK retailers",
    /** The country the money is sitting in at this step. */
    partyFlag: "GB",
    amount: "£48,200",
    currency: "GBP",
    flags: ["GB"],
  },
  {
    label: "Converted",
    party: "Rate quoted before you commit",
    partyFlag: "",
    amount: "1.10",
    currency: "GBP → USD",
    flags: ["GB", "US"],
  },
  {
    label: "Paid out",
    party: "To your supplier in Shenzhen",
    partyFlag: "CN",
    amount: "$53,020",
    currency: "USD",
    flags: ["US"],
  },
];

export function PaymentFlowCard() {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
          One payment, end to end
        </p>
        <span className="rounded-full bg-[#7dd3fc] px-2.5 py-1 text-[11px] font-semibold text-[#052534]">
          Same day
        </span>
      </div>

      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step.label} className="relative">
            {index < steps.length - 1 && (
              <span
                className="absolute left-[15px] top-[42px] h-[calc(100%-26px)] w-px bg-white/20"
                aria-hidden="true"
              />
            )}
            <div className="flex gap-3.5">
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/15 font-mono text-[11px] font-semibold text-[#7dd3fc]">
                {index + 1}
              </span>
              <div className="flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold">{step.label}</span>
                  <span className="font-mono text-sm tabular-nums">{step.amount}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-white/60">
                    {step.partyFlag && (
                      <Flag code={step.partyFlag} className="h-2.5 w-[15px]" />
                    )}
                    {step.party}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[11px] text-white/60">
                    {step.flags.map((flag) => (
                      <Flag key={flag} code={flag} className="h-2.5 w-[15px]" />
                    ))}
                    {step.currency}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-[11px] leading-relaxed text-white/50">
        Illustrative figures, not a real transaction. Rates and timings are corridor-specific.
      </p>
    </div>
  );
}
