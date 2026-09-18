/**
 * Full-width backdrop behind the hero. A performance line that keeps drawing
 * itself with a marker running along it, bars breathing underneath, and orbit
 * rings arcing over the whole thing. Purely decorative, and it all holds
 * still for anyone who has asked for reduced motion.
 */

/** The trend line. Shared by the stroke, the fill and the marker's path. */
const TREND =
  "M -60 486 C 110 486 190 412 320 424 S 470 338 580 360 S 742 258 866 280 S 1030 176 1150 198 S 1330 96 1520 62";

const bars = [
  { x: 96, w: 26, h: 86, delay: "0s" },
  { x: 246, w: 26, h: 128, delay: "1.1s" },
  { x: 396, w: 26, h: 104, delay: "2.3s" },
  { x: 546, w: 26, h: 164, delay: "0.6s" },
  { x: 696, w: 26, h: 132, delay: "3.1s" },
  { x: 846, w: 26, h: 196, delay: "1.8s" },
  { x: 996, w: 26, h: 158, delay: "2.7s" },
  { x: 1146, w: 26, h: 232, delay: "0.3s" },
  { x: 1296, w: 26, h: 204, delay: "3.6s" },
];

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="brand-gradient-bg animate-drift-glow hero-glow absolute -left-72 -top-80 h-[560px] w-[720px] rounded-full blur-3xl" />

      <svg
        viewBox="0 0 1440 560"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="trend-stroke" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand-purple)" />
            <stop offset="50%" stopColor="var(--brand-pink)" />
            <stop offset="100%" stopColor="var(--brand-orange)" />
          </linearGradient>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-pink)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--brand-pink)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="orbit-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand-purple)" stopOpacity="0.7" />
            <stop offset="55%" stopColor="var(--brand-pink)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--brand-orange)" stopOpacity="0.28" />
          </linearGradient>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--brand-pink)" />
          </pattern>
        </defs>

        {/* Grid, faint enough to read as texture rather than a table */}
        <rect width="1440" height="560" fill="url(#hero-grid)" opacity="0.1" />

        {/* Bars along the baseline */}
        <g opacity="0.14">
          {bars.map((bar) => (
            <rect
              key={bar.x}
              className="animate-grow-bar"
              style={{ animationDelay: bar.delay }}
              x={bar.x}
              y={520 - bar.h}
              width={bar.w}
              height={bar.h}
              rx="6"
              fill="url(#trend-stroke)"
            />
          ))}
        </g>

        {/* Area under the trend */}
        <path d={`${TREND} L 1520 560 L -60 560 Z`} fill="url(#trend-fill)" />

        {/* The trend line itself, drawing and redrawing */}
        <path
          className="animate-draw-trend"
          d={TREND}
          fill="none"
          stroke="url(#trend-stroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Marker riding the line */}
        <circle
          className="animate-run-trend"
          style={{ offsetPath: `path("${TREND}")` }}
          r="5"
          fill="var(--brand-pink)"
        />

        {/* Orbit rings arcing across the whole hero */}
        <g transform="translate(1040 280)">
          <g className="animate-orbit-slow">
            <circle
              r="470"
              fill="none"
              stroke="url(#orbit-stroke)"
              strokeWidth="1.6"
              strokeDasharray="3 14"
            />
            <circle cx="470" cy="0" r="6" fill="var(--brand-pink)" opacity="0.65" />
            <circle cx="-332" cy="-332" r="4" fill="var(--brand-orange)" opacity="0.5" />
          </g>
          <g className="animate-orbit-medium">
            <circle
              r="330"
              fill="none"
              stroke="url(#orbit-stroke)"
              strokeWidth="1.3"
              strokeDasharray="2 12"
            />
            <circle cx="0" cy="-330" r="5" fill="var(--brand-purple)" opacity="0.7" />
            <circle cx="233" cy="233" r="3.5" fill="var(--brand-pink)" opacity="0.5" />
          </g>
          <g className="animate-orbit-fast">
            <circle
              r="205"
              fill="none"
              stroke="url(#orbit-stroke)"
              strokeWidth="1.3"
              strokeDasharray="2 9"
            />
            <circle cx="205" cy="0" r="4.5" fill="var(--brand-orange)" opacity="0.75" />
          </g>
          <circle className="animate-pulse-node" r="3.5" fill="var(--brand-pink)" />
        </g>
      </svg>

      {/* Softens where the bars meet the stats band, so the backdrop fades
          out rather than being sliced off by the section edge. */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent" />
    </div>
  );
}
