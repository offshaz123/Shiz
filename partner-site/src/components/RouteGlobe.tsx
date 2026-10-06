"use client";

import { Flag } from "@/components/Flag";

/**
 * The payment, drawn landing where it lands.
 *
 * This replaces a stock photograph of a globe with a paper plane on it. The
 * photograph was the same picture whichever currency you tapped; this one
 * knows. Pick CHF and the arc runs from the UK to Zurich and the pin lands
 * on Switzerland.
 *
 * The positions are real. Each city is projected orthographically onto a
 * sphere centred on the North Atlantic (20°W, 38°N), which is the one view
 * that holds the UK, the whole of Europe and the east coast of North America
 * at once — every destination this account pays into. An arc that went to a
 * made-up dot would be worse than the photograph.
 *
 * There are no coastlines, deliberately: a hand-drawn approximation of a
 * world map gets a country's shape wrong and someone always notices. The
 * lattice reads as a sphere, and the pin, the arc and the label do the rest.
 *
 * Everything animates off a `key` that changes with the currency, which is
 * what restarts the CSS rather than a timer.
 */
const R = 168;
const LON0 = -20;
const LAT0 = 38;

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Orthographic projection. Returns null for anywhere on the far side. */
function project(lat: number, lon: number) {
  const dLon = rad(lon - LON0);
  const phi = rad(lat);
  const phi0 = rad(LAT0);
  const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(dLon);
  if (cosC <= 0) return null;
  return {
    x: R * Math.cos(phi) * Math.sin(dLon),
    // SVG y runs down, the globe's north runs up.
    y: -R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(dLon)),
  };
}

const ORIGIN = { lat: 54.0, lon: -2.0, label: "United Kingdom" };

/** Where each currency actually goes, and the city the card names. */
export const DESTINATIONS: Record<string, { lat: number; lon: number; city: string; country: string }> = {
  USD: { lat: 40.71, lon: -74.01, city: "New York", country: "United States" },
  EUR: { lat: 51.92, lon: 4.48, city: "Rotterdam", country: "Netherlands" },
  CAD: { lat: 43.65, lon: -79.38, city: "Toronto", country: "Canada" },
  CHF: { lat: 47.38, lon: 8.54, city: "Zurich", country: "Switzerland" },
  DKK: { lat: 55.68, lon: 12.57, city: "Copenhagen", country: "Denmark" },
  NOK: { lat: 59.91, lon: 10.75, city: "Oslo", country: "Norway" },
  SEK: { lat: 59.33, lon: 18.07, city: "Stockholm", country: "Sweden" },
  PLN: { lat: 52.23, lon: 21.01, city: "Warsaw", country: "Poland" },
  CZK: { lat: 49.2, lon: 16.61, city: "Brno", country: "Czechia" },
  HUF: { lat: 47.5, lon: 19.04, city: "Budapest", country: "Hungary" },
  RON: { lat: 44.43, lon: 26.1, city: "Bucharest", country: "Romania" },
};

/** Latitude rings, as half-chords of the sphere at each height. */
const latitudes = [-0.72, -0.42, -0.1, 0.22, 0.52, 0.78].map((f) => {
  const cy = Math.round(R * f);
  return { cy, rx: Math.round(Math.sqrt(R * R - cy * cy)) };
});
const meridians = [R, R * 0.72, R * 0.42, R * 0.15].map(Math.round);

export function RouteGlobe({ code, iso }: { code: string; iso: string }) {
  const destination = DESTINATIONS[code] ?? DESTINATIONS.EUR;
  const from = project(ORIGIN.lat, ORIGIN.lon);
  const to = project(destination.lat, destination.lon);

  // Both are always on the visible face for the currencies this account
  // supports, but the projection can return null and the component must not
  // explode if a currency is ever added that sits round the back.
  const a = from ?? { x: 0, y: 0 };
  const b = to ?? { x: 0, y: 0 };

  // Bow the arc away from the centre of the globe so it reads as travelling
  // over the surface rather than tunnelling through it.
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const span = Math.hypot(b.x - a.x, b.y - a.y);
  const out = Math.hypot(midX, midY) || 1;
  const lift = 1 + (span / R) * 0.42;
  const path = `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((midX / out) * out * lift).toFixed(1)} ${(
    (midY / out) * out * lift -
    span * 0.22
  ).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-ink p-5 text-on-ink sm:p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--accent) 26%, transparent), transparent 62%)",
        }}
      />

      <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/55">
        Where it lands
      </p>

      <svg
        viewBox="-190 -186 380 372"
        className="relative mx-auto mt-1 w-full"
        role="img"
        aria-label={`A payment routed from the United Kingdom to ${destination.city}, ${destination.country}.`}
      >
        <defs>
          <pattern id="route-dots" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="var(--accent)" fillOpacity="0.72" />
          </pattern>
          <clipPath id="route-clip">
            <circle cx="0" cy="0" r={R} />
          </clipPath>
          <radialGradient id="route-shade" cx="36%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="58%" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0.04" />
          </radialGradient>
          <mask id="route-mask">
            <circle cx="0" cy="0" r={R} fill="url(#route-shade)" />
          </mask>
        </defs>

        <g mask="url(#route-mask)">
          <g clipPath="url(#route-clip)">
            <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="url(#route-dots)" />
          </g>
        </g>

        <g stroke="var(--accent)" strokeOpacity="0.3" strokeWidth="1" fill="none">
          <circle cx="0" cy="0" r={R} strokeOpacity="0.62" strokeWidth="1.4" />
          {meridians.map((rx) => (
            <ellipse key={rx} cx="0" cy="0" rx={rx} ry={R} />
          ))}
          {latitudes.map((lat) => (
            <ellipse
              key={lat.cy}
              cx="0"
              cy={lat.cy}
              rx={lat.rx}
              ry={Math.max(5, lat.rx * 0.13)}
            />
          ))}
        </g>

        {/* Keyed on the currency: a new key is a new element, which is what
            makes the CSS animations run again from the top on every change. */}
        <g key={code}>
          <path
            d={path}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="animate-route-draw"
          />

          {/* Origin. Labelled: an arc that starts at an unmarked dot tells
              you nothing about which way the money is going. */}
          <circle cx={a.x} cy={a.y} r="4.5" fill="#f2fbfd" />
          <text
            x={a.x}
            y={a.y - 12}
            textAnchor="middle"
            fill="#f2fbfd"
            fillOpacity="0.72"
            style={{ font: "600 11px var(--font-inter), system-ui, sans-serif" }}
          >
            UK
          </text>

          {/* The payment itself. */}
          <circle
            r="5.5"
            fill="var(--accent)"
            className="animate-route-dot"
            style={{ offsetPath: `path("${path}")` }}
          />

          {/* Destination, landing after the dot gets there. */}
          <g className="animate-route-land">
            <circle cx={b.x} cy={b.y} r="19" fill="var(--accent)" fillOpacity="0.2" className="animate-route-ping" />
            <circle cx={b.x} cy={b.y} r="7" fill="var(--accent)" />
            <circle cx={b.x} cy={b.y} r="7" fill="none" stroke="#fff" strokeWidth="1.8" />
          </g>
        </g>
      </svg>

      <div key={`${code}-label`} className="animate-route-label relative mt-3 flex items-center justify-center gap-3">
        <span className="glass flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4">
          <Flag code={iso} className="h-4 w-6 border border-white/25" />
          <span className="text-sm font-semibold">{destination.city}</span>
          <span className="text-xs text-on-ink/55">{destination.country}</span>
        </span>
      </div>

      <p className="relative mt-3 text-center text-[11px] leading-relaxed text-on-ink/45">
        Illustrative route. Where a payment can land, and how quickly, depends on the corridor.
      </p>
    </div>
  );
}
