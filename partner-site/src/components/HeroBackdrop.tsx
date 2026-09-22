/**
 * The hero's background: a ledger grid, a glow, and a payment tracing the route
 * from the UK side of the page to the supplier side. The viewBox is sized to a
 * desktop hero so the route maps roughly 1:1 there and crops at the edges on
 * narrower screens. Decorative, so it is hidden from assistive tech and stops
 * entirely under reduced motion.
 */
// Kept in the lower band of the viewBox so it passes under the hero copy
// rather than through it.
const ROUTE = "M40 336C240 336 300 258 480 258S760 316 960 296 1300 238 1400 222";

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ledger-grid absolute inset-0 opacity-60" />

      <div
        className="hero-glow animate-drift-glow absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 50%, var(--accent), transparent 60%), radial-gradient(circle at 70% 50%, var(--accent-2), transparent 60%)",
        }}
      />

      <svg
        viewBox="0 0 1440 360"
        fill="none"
        className="absolute inset-x-0 bottom-0 h-[360px] w-full"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* The static route. The animated stroke above it starts fully dashed,
            so without this the hero would briefly show two unexplained dots. */}
        <path
          d={ROUTE}
          stroke="var(--border)"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d={ROUTE}
          stroke="var(--accent)"
          strokeOpacity="0.55"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-trace-route"
        />
        <circle
          r="5"
          fill="var(--accent)"
          className="animate-send-payment"
          style={{ offsetPath: `path("${ROUTE}")` }}
        />
        {[
          [480, 258],
          [960, 296],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="4"
            fill="var(--accent-2)"
            className="animate-pulse-node"
            style={{ animationDelay: `${index * 1.5}s` }}
          />
        ))}
      </svg>
    </div>
  );
}
