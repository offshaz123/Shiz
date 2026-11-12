"use client";

import { useEffect, useRef } from "react";

/**
 * A thin brand-gradient bar across the very top, filling as you scroll.
 *
 * TheFXSoft has one and it does real work on a long page: it says how much
 * is left, which stops the scroll feeling endless. Ours is a gradient rather
 * than a flat colour, so it reads as the brand rather than as a browser
 * loading bar.
 *
 * Written against the DOM rather than React state — this updates on every
 * scroll frame, and re-rendering a component that often would cost far more
 * than it is worth. The listener is passive so it never blocks scrolling,
 * and the work is one transform, which the compositor handles off the main
 * thread.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      // A page shorter than the window has nothing to report.
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      // One update a frame at most, however fast the events arrive.
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="brand-gradient-bg h-full w-full origin-left"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
