"use client";

import { useEffect, useRef } from "react";
import { Flag } from "@/components/Flag";
import { landPoints } from "@/content/worldDots";

/**
 * The payment, drawn landing where it lands, on a globe that turns.
 *
 * This replaces a stock photograph of a paper plane that was the same picture
 * whichever currency you tapped. Pick CHF and the globe turns until Europe is
 * facing you, the arc runs from the UK to Zurich and the pin lands on
 * Switzerland. Left alone it keeps turning, so Asia, Africa and the Americas
 * all come round.
 *
 * The land is real: Natural Earth 1:110m, sampled onto a 2-degree grid and
 * coloured by continent — see content/worldDots.ts. Orthographic projection,
 * so it is a sphere seen from outside rather than a map bent into a circle,
 * and anything on the far side is simply not drawn.
 *
 * Canvas, not SVG. There are about two thousand land dots facing you at any
 * moment and they all move every frame; that is a repaint React should never
 * be asked to do as elements. Nothing here re-renders — the loop writes
 * pixels and the component renders once.
 */
const R_FRACTION = 0.46;
const LAT0 = 24;
const DRIFT = 0.055; // degrees per frame when nothing has been picked

const CONTINENT_COLOURS = [
  "#38bdf8", // Europe
  "#5eead4", // Asia
  "#fbbf24", // Africa
  "#a78bfa", // North America
  "#fb7185", // South America
  "#4ade80", // Oceania
];

const rad = (deg: number) => (deg * Math.PI) / 180;

const ORIGIN = { lat: 54.0, lon: -2.0 };

/** Where each currency actually goes, and the city the card names. */
export const DESTINATIONS: Record<
  string,
  { lat: number; lon: number; city: string; country: string }
> = {
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

/** Unit vector for a lat/lon, in a frame where x is out through 0E 0N. */
function vector(lat: number, lon: number): [number, number, number] {
  const p = rad(lat);
  const l = rad(lon);
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
}

/** Great-circle interpolation, so the route bends the way the Earth does. */
function slerp(a: number[], b: number[], t: number) {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  dot = Math.max(-1, Math.min(1, dot));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const k0 = Math.sin((1 - t) * omega) / s;
  const k1 = Math.sin(t * omega) / s;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
}

/** Shortest signed distance between two longitudes, so it never goes the long way round. */
function shortestTurn(from: number, to: number) {
  let delta = ((to - from + 540) % 360) - 180;
  if (delta === -180) delta = 180;
  return delta;
}

export function RouteGlobe({ code, iso }: { code: string; iso: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Everything the loop mutates lives in refs. Putting rotation in state
  // would re-render the component sixty times a second to paint a canvas
  // that React does not manage anyway.
  const lon0 = useRef(-30);
  const target = useRef<number | null>(null);
  const journey = useRef(0);
  const destRef = useRef(DESTINATIONS[code] ?? DESTINATIONS.EUR);

  // A currency change points the globe at the new route and restarts the
  // flight. The `code` dependency is the whole mechanism.
  useEffect(() => {
    const next = DESTINATIONS[code] ?? DESTINATIONS.EUR;
    destRef.current = next;
    // Sit the camera between the two ends so both are comfortably in view.
    target.current = (ORIGIN.lon + next.lon) / 2;
    journey.current = 0;
  }, [code]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const land = landPoints();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = wrap.clientWidth;
      height = Math.round(width * 0.92);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const draw = () => {
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * R_FRACTION;

      // Rotation: ease to the picked route, otherwise keep turning so the
      // rest of the world comes round.
      if (target.current !== null) {
        // project() subtracts lon0, so the longitude we want in the middle of
        // the disc IS lon0. Negating it here turned the globe to the opposite
        // side of the world: picking USD centred the camera on 38E, which is
        // Sudan, rather than 38W in the mid-Atlantic.
        const delta = shortestTurn(lon0.current, target.current);
        if (Math.abs(delta) < 0.4 || still) {
          lon0.current = target.current;
          target.current = null;
        } else {
          lon0.current += delta * 0.07;
        }
      } else if (!still) {
        lon0.current -= DRIFT;
      }
      if (journey.current < 1) journey.current = Math.min(1, journey.current + (still ? 1 : 0.012));

      const phi0 = rad(LAT0);
      const sinPhi0 = Math.sin(phi0);
      const cosPhi0 = Math.cos(phi0);

      const project = (lat: number, lon: number) => {
        const dLon = rad(lon - lon0.current);
        const phi = rad(lat);
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        const cosDLon = Math.cos(dLon);
        const depth = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosDLon;
        return {
          x: cx + R * cosPhi * Math.sin(dLon),
          y: cy - R * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosDLon),
          depth,
        };
      };

      context.clearRect(0, 0, width, height);

      // The ocean, lit from the upper left.
      const ocean = context.createRadialGradient(
        cx - R * 0.35,
        cy - R * 0.4,
        R * 0.1,
        cx,
        cy,
        R,
      );
      ocean.addColorStop(0, "#0d4f6b");
      ocean.addColorStop(0.62, "#0a3650");
      ocean.addColorStop(1, "#06233a");
      context.beginPath();
      context.arc(cx, cy, R, 0, Math.PI * 2);
      context.fillStyle = ocean;
      context.fill();

      // Graticule.
      context.strokeStyle = "rgba(125, 211, 252, 0.13)";
      context.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        context.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const p = project(lat, lon);
          if (p.depth <= 0) {
            started = false;
            continue;
          }
          if (!started) {
            context.moveTo(p.x, p.y);
            started = true;
          } else context.lineTo(p.x, p.y);
        }
        context.stroke();
      }
      for (let lon = -180; lon < 180; lon += 30) {
        context.beginPath();
        let started = false;
        for (let lat = -85; lat <= 85; lat += 4) {
          const p = project(lat, lon);
          if (p.depth <= 0) {
            started = false;
            continue;
          }
          if (!started) {
            context.moveTo(p.x, p.y);
            started = true;
          } else context.lineTo(p.x, p.y);
        }
        context.stroke();
      }

      // Land, batched one path per continent so the whole world costs six
      // fills rather than four thousand.
      const dot = Math.max(1.05, R * 0.0105);
      for (let c = 0; c < CONTINENT_COLOURS.length; c += 1) {
        context.beginPath();
        for (const point of land) {
          if (point.continent !== c) continue;
          const p = project(point.lat, point.lon);
          if (p.depth <= 0.04) continue;
          context.moveTo(p.x + dot, p.y);
          context.arc(p.x, p.y, dot, 0, Math.PI * 2);
        }
        context.fillStyle = CONTINENT_COLOURS[c];
        // Dots near the limb are turning away, so they dim rather than
        // stopping dead at the edge.
        context.globalAlpha = 0.92;
        context.fill();
        context.globalAlpha = 1;
      }

      // A terminator, so the sphere has a lit side.
      const shade = context.createRadialGradient(
        cx - R * 0.3,
        cy - R * 0.35,
        R * 0.2,
        cx,
        cy,
        R * 1.02,
      );
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(0.72, "rgba(2,16,28,0.18)");
      shade.addColorStop(1, "rgba(2,16,28,0.72)");
      context.beginPath();
      context.arc(cx, cy, R, 0, Math.PI * 2);
      context.fillStyle = shade;
      context.fill();

      // Rim light.
      context.beginPath();
      context.arc(cx, cy, R, 0, Math.PI * 2);
      context.strokeStyle = "rgba(94, 234, 212, 0.4)";
      context.lineWidth = 1.2;
      context.stroke();

      // The route.
      const destination = destRef.current;
      const from = vector(ORIGIN.lat, ORIGIN.lon);
      const to = vector(destination.lat, destination.lon);
      const STEPS = 72;
      const arc: { x: number; y: number; depth: number }[] = [];
      for (let i = 0; i <= STEPS; i += 1) {
        const t = i / STEPS;
        const v = slerp(from, to, t);
        const lat = (Math.asin(Math.max(-1, Math.min(1, v[2]))) * 180) / Math.PI;
        const lon = (Math.atan2(v[1], v[0]) * 180) / Math.PI;
        const p = project(lat, lon);
        // Lift the middle of the arc off the surface so it reads as a flight
        // rather than a line drawn on the ground.
        const lift = 1 + 0.17 * Math.sin(Math.PI * t);
        arc.push({ x: cx + (p.x - cx) * lift, y: cy + (p.y - cy) * lift, depth: p.depth });
      }

      const shown = Math.floor(arc.length * journey.current);
      context.beginPath();
      let drawing = false;
      for (let i = 0; i < shown; i += 1) {
        const p = arc[i];
        if (p.depth <= -0.08) {
          drawing = false;
          continue;
        }
        if (!drawing) {
          context.moveTo(p.x, p.y);
          drawing = true;
        } else context.lineTo(p.x, p.y);
      }
      context.strokeStyle = "#f8fafc";
      context.lineWidth = 2.2;
      context.lineCap = "round";
      context.stroke();

      const pin = (p: { x: number; y: number; depth: number }, colour: string, size: number) => {
        if (p.depth <= -0.05) return;
        context.beginPath();
        context.arc(p.x, p.y, size, 0, Math.PI * 2);
        context.fillStyle = colour;
        context.fill();
        context.lineWidth = 1.8;
        context.strokeStyle = "rgba(255,255,255,0.9)";
        context.stroke();
      };

      pin(arc[0], "#f8fafc", 4.5);

      // The payment itself, and the pin it lands on.
      if (journey.current < 1) {
        const head = arc[Math.max(0, shown - 1)];
        if (head && head.depth > -0.08) {
          context.beginPath();
          context.arc(head.x, head.y, 5.5, 0, Math.PI * 2);
          context.fillStyle = "#5eead4";
          context.fill();
        }
      } else {
        const end = arc[arc.length - 1];
        if (end.depth > -0.05) {
          const pulse = (Math.sin(frame / 22) + 1) / 2;
          context.beginPath();
          context.arc(end.x, end.y, 9 + pulse * 9, 0, Math.PI * 2);
          context.fillStyle = `rgba(94, 234, 212, ${0.3 - pulse * 0.26})`;
          context.fill();
        }
        pin(end, "#5eead4", 6);
      }

      frame += 1;
    };

    let raf = 0;
    const loop = () => {
      draw();
      raf = window.requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const destination = DESTINATIONS[code] ?? DESTINATIONS.EUR;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-ink p-5 text-on-ink sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-ink/55">
        Where it lands
      </p>

      <div ref={wrapRef} className="mt-2">
        <canvas
          ref={canvasRef}
          className="w-full"
          role="img"
          aria-label={`A globe showing a payment routed from the United Kingdom to ${destination.city}, ${destination.country}.`}
        />
      </div>

      <div
        key={`${code}-label`}
        className="animate-route-label mt-1 flex items-center justify-center gap-3"
      >
        <span className="glass flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4">
          <Flag code={iso} className="h-4 w-6 border border-white/25" />
          <span className="text-sm font-semibold">{destination.city}</span>
          <span className="text-xs text-on-ink/55">{destination.country}</span>
        </span>
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-on-ink/45">
        Illustrative route. Where a payment can land, and how quickly, depends on the corridor.
      </p>
    </div>
  );
}
