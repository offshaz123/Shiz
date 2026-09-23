import { headlineFacts } from "@/lib/brand";

/**
 * The dark figures band.
 *
 * Four numbers, each with a coloured rule under it in the tone of the tile set
 * so the band belongs to the same family as the cards. There is no founding
 * date and no customer count here, because we do not have either yet — every
 * figure is one a reader could check.
 */
export function HeadlineFacts() {
  return (
    <section className="ink-tint relative overflow-hidden text-on-ink">
      <div className="ledger-grid pointer-events-none absolute inset-0 opacity-[0.1]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        {headlineFacts.map((fact) => (
          <div key={fact.label} className="text-center">
            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {fact.value}
            </p>
            <span
              className={`mx-auto mt-4 block h-1 w-10 rounded-full icon-tile-${fact.tone}`}
              style={{ background: "var(--tone)" }}
              aria-hidden="true"
            />
            <p className="mt-4 text-sm leading-relaxed text-on-ink/60">{fact.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
