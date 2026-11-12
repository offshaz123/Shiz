"use client";

import { useEffect, useRef } from "react";

/**
 * Counts a figure up from zero when it reaches the screen.
 *
 * Takes the value as it is written — "200+", "97%", "4.9" — so the markup
 * stays the source of truth and nothing has to be restated as a number and a
 * suffix in two places.
 *
 * The finished value is what renders on the server and what sits in the DOM
 * before this runs, so a visitor without JavaScript, a crawler, or anyone who
 * has asked for reduced motion sees the real figure rather than a zero.
 * It only ever counts once.
 */

/** "200+" -> { target: 200, prefix: "", suffix: "+", decimals: 0 } */
function parse(value: string) {
  const match = value.match(/^(\D*?)([\d.,]+)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;

  const dot = digits.indexOf(".");
  return { target, prefix, suffix, decimals: dot === -1 ? 0 : digits.length - dot - 1 };
}

/** Fast at first, easing to a stop — a linear count looks mechanical. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: string;
  /** Milliseconds. */
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const parsed = parse(value);
    if (!parsed) return;

    const { target, prefix, suffix, decimals } = parsed;
    let frame = 0;
    let started = false;

    const run = (startedAt: number) => {
      const step = (now: number) => {
        const t = Math.min((now - startedAt) / duration, 1);
        const n = target * easeOut(t);
        el.textContent =
          prefix +
          n.toLocaleString("en-GB", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }) +
          suffix;
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started) continue;
          started = true;
          observer.disconnect();
          // Zero first, so the climb is visible rather than starting part-way.
          el.textContent = prefix + (0).toFixed(decimals) + suffix;
          run(performance.now());
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      // Whatever happens, leave the real figure behind.
      el.textContent = value;
    };
  }, [value, duration]);

  // The finished value renders on the server and is the fallback throughout.
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
