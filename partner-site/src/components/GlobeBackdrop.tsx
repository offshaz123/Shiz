/**
 * The hero backdrop: a globe that turns, built rather than photographed.
 *
 * A dot lattice scrolls horizontally inside a circular mask, which reads as a
 * sphere rotating; a rim light and a set of static meridians sell the curve.
 * Two payment routes orbit it with a dot running each one, which is the thing
 * this business actually does — money leaving one place and landing in
 * another — rather than a stock picture of a planet.
 *
 * Decorative, so it is hidden from assistive tech, and it stops completely
 * under `prefers-reduced-motion`.
 *
 * The dot field is two identical 560px tiles side by side and the animation
 * translates the pair by exactly one tile, so the loop has no seam.
 */

/** Latitude rings: rx is the half-chord of the sphere at that height. */
const R = 260;
const latitudes = [-190, -110, -30, 50, 130, 205].map((cy) => ({
  cy,
  rx: Math.round(Math.sqrt(R * R - cy * cy)),
}));

/** Meridians, drawn as ellipses of decreasing width to suggest the turn. */
const meridians = [R, R * 0.72, R * 0.42, R * 0.15];

const ORBIT_ONE = "M-330 70C-210 -30 -60 -74 90 -66S330 -6 372 74";
const ORBIT_TWO = "M-360 -40C-250 76 -80 128 80 112S330 30 366 -54";

export function GlobeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* The light the globe sits in. */}
      <div
        className="hero-glow animate-drift-glow absolute left-[62%] top-[6%] h-[620px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at 40% 45%, var(--accent), transparent 62%), radial-gradient(circle at 70% 60%, var(--accent-2), transparent 60%)",
        }}
      />

      <svg
        viewBox="-420 -300 840 600"
        className="absolute left-1/2 top-1/2 h-[820px] w-[1150px] -translate-x-[34%] -translate-y-1/2 opacity-80 sm:-translate-x-[26%] lg:left-[68%] lg:-translate-x-1/2"
        fill="none"
      >
        <defs>
          <pattern id="globe-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="var(--accent-2)" />
          </pattern>

          <clipPath id="globe-clip">
            <circle cx="0" cy="0" r={R} />
          </clipPath>

          {/* Fades the lattice towards the limb, so the sphere has a terminator
              rather than a hard cut at the edge. */}
          <radialGradient id="globe-shade" cx="38%" cy="34%" r="76%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
          </radialGradient>

          <mask id="globe-mask">
            <circle cx="0" cy="0" r={R} fill="url(#globe-shade)" />
          </mask>

          <linearGradient id="orbit-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g mask="url(#globe-mask)">
          <g clipPath="url(#globe-clip)">
            <g className="animate-globe">
              <rect x="-280" y="-300" width="560" height="600" fill="url(#globe-dots)" />
              <rect x="280" y="-300" width="560" height="600" fill="url(#globe-dots)" />
            </g>
          </g>
        </g>

        {/* Wireframe over the lattice. */}
        <g stroke="var(--accent)" strokeOpacity="0.18" strokeWidth="1">
          <circle cx="0" cy="0" r={R} strokeOpacity="0.4" />
          {meridians.map((rx) => (
            <ellipse key={rx} cx="0" cy="0" rx={rx} ry={R} />
          ))}
          {latitudes.map((lat) => (
            <ellipse key={lat.cy} cx="0" cy={lat.cy} rx={lat.rx} ry={Math.max(6, lat.rx * 0.13)} />
          ))}
        </g>

        {/* Routes running past it, each carrying one payment. */}
        {[ORBIT_ONE, ORBIT_TWO].map((path, index) => (
          <g key={path}>
            <path d={path} stroke="url(#orbit-line)" strokeWidth="1.5" strokeLinecap="round" />
            <circle
              r="4"
              fill="var(--accent-strong)"
              className="animate-orbit"
              style={{ offsetPath: `path("${path}")`, animationDelay: `${index * 5.5}s` }}
            />
          </g>
        ))}
      </svg>

      {/* Sinks the bottom of the globe into the page rather than cropping it. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
