/** The journey a payment takes, as a numbered run of steps. */
export function FlowSteps({ steps }: { steps: readonly string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-3">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <span className="flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-on-ink">
              {index + 1}
            </span>
            <span className="text-sm font-semibold uppercase tracking-wide">{step}</span>
          </span>
          {index < steps.length - 1 && (
            <span className="text-accent-2" aria-hidden="true">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
