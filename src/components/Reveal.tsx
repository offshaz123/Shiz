"use client";

import { useEffect, useRef } from "react";

/**
 * Rises its children into place when they reach the screen.
 *
 * TheFXSoft's page feels alive the whole way down because every section
 * arrives rather than already being there. Ours appeared fully formed, which
 * on a long page reads as a static document.
 *
 * Built so the content is never lost if anything goes wrong:
 *
 *  - The markup is identical on the server, so crawlers and readers get the
 *    whole page whatever happens here. opacity does not hide text from
 *    Google, and the noscript rule in the layout un-hides it without JS.
 *  - One observer for every instance rather than one each.
 *  - A 1.5s backstop reveals everything regardless, so a slow or failed
 *    observer can never leave the page blank.
 *  - Nothing moves at all under prefers-reduced-motion.
 *
 * Once revealed an element is unobserved and stays put — things that fade
 * back out as you scroll up are irritating to read.
 */

let observer: IntersectionObserver | null = null;
let backstop: ReturnType<typeof setTimeout> | null = null;

function reveal(el: Element) {
  el.classList.add("is-in");
  observer?.unobserve(el);
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;

  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    },
    // Fires a little before the element's top edge arrives, so the movement
    // finishes about when it is comfortably in view rather than starting late.
    { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
  );

  return observer;
}

/**
 * Safety net for the case where the observer exists but does not fire for
 * something already on screen.
 *
 * Deliberately limited to what is actually in the viewport. Revealing the
 * whole page would undo the point of the thing: a first version did exactly
 * that at 1.5s, and on any normal load it beat the scrolling and showed
 * every section at once.
 */
function armBackstop() {
  if (backstop) return;
  backstop = setTimeout(() => {
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) el.classList.add("is-in");
    });
  }, 2500);
}

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  /** Seconds. For staggering siblings. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }

    const io = getObserver();
    if (!io) {
      el.classList.add("is-in");
      return;
    }

    armBackstop();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
