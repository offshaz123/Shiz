"use client";

import { useEffect, useRef } from "react";

/**
 * A soft brand-coloured light that follows the pointer.
 *
 * TheFXSoft has one of these and it is a large part of why their page feels
 * expensive — the background reacts to you rather than sitting there.
 *
 * Deliberately restrained: it trails the pointer rather than sticking to it,
 * it is heavily blurred, and it sits behind everything, so it reads as the
 * page being lit rather than as a cursor effect. Sections with their own
 * solid background cover it, which is intended — it shows through the hero
 * and the gaps between bands, not over the whole page.
 *
 * Only on devices with a real pointer. On a phone there is nothing to
 * follow, so it never runs and costs nothing.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // A fine pointer means a mouse or trackpad. Touch screens skip all of it.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame = 0;
    let visible = false;

    const tick = () => {
      // Easing towards the pointer rather than snapping to it. The lag is
      // what stops it feeling like a gimmick stuck to the cursor.
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      el.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;

      const settled = Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      frame ||= requestAnimationFrame(tick);
    };

    const onLeave = () => {
      visible = false;
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="brand-gradient-bg pointer-events-none fixed left-0 top-0 -z-10 h-[640px] w-[640px] rounded-full opacity-0 blur-[130px] transition-opacity duration-500"
      style={{ transform: "translate3d(-1000px, -1000px, 0)" }}
    />
  );
}
