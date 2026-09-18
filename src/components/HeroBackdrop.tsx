/**
 * Decorative orbit system behind the hero. Three rings turning at different
 * speeds with markers riding on them, plus a drifting glow. Purely visual,
 * and it holds still for anyone who has asked for reduced motion.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="brand-gradient-bg animate-drift-glow hero-glow absolute -left-72 -top-80 h-[560px] w-[720px] rounded-full blur-3xl" />

      <svg
        viewBox="0 0 600 600"
        className="absolute left-1/2 top-1/2 h-[860px] w-[860px] -translate-x-1/2 -translate-y-1/2 opacity-80 lg:left-[70%] lg:h-[980px] lg:w-[980px]"
      >
        <defs>
          <linearGradient id="orbit-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-purple)" stopOpacity="0.75" />
            <stop offset="55%" stopColor="var(--brand-pink)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <g className="animate-orbit-slow">
          <circle
            cx="300"
            cy="300"
            r="260"
            fill="none"
            stroke="url(#orbit-stroke)"
            strokeWidth="1.6"
            strokeDasharray="3 10"
          />
          <circle cx="560" cy="300" r="5" fill="var(--brand-pink)" opacity="0.7" />
          <circle cx="170" cy="75" r="3.5" fill="var(--brand-orange)" opacity="0.6" />
        </g>

        {/* Middle ring */}
        <g className="animate-orbit-medium">
          <circle
            cx="300"
            cy="300"
            r="190"
            fill="none"
            stroke="url(#orbit-stroke)"
            strokeWidth="1.3"
            strokeDasharray="1 9"
          />
          <circle cx="300" cy="110" r="4.5" fill="var(--brand-purple)" opacity="0.75" />
          <circle cx="465" cy="395" r="3" fill="var(--brand-pink)" opacity="0.55" />
        </g>

        {/* Inner ring */}
        <g className="animate-orbit-fast">
          <circle
            cx="300"
            cy="300"
            r="124"
            fill="none"
            stroke="url(#orbit-stroke)"
            strokeWidth="1.3"
            strokeDasharray="2 7"
          />
          <circle cx="424" cy="300" r="4" fill="var(--brand-orange)" opacity="0.8" />
        </g>

        {/* Nodes that breathe, so the middle isn't dead */}
        <circle className="animate-pulse-node" cx="300" cy="300" r="3" fill="var(--brand-pink)" />
        <circle
          className="animate-pulse-node"
          style={{ animationDelay: "1.3s" }}
          cx="380"
          cy="240"
          r="3"
          fill="var(--brand-purple)"
        />
        <circle
          className="animate-pulse-node"
          style={{ animationDelay: "2.6s" }}
          cx="228"
          cy="356"
          r="3"
          fill="var(--brand-orange)"
        />
      </svg>
    </div>
  );
}
