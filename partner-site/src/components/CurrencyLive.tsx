"use client";

import { useCallback, useEffect, useState } from "react";
import { CurrencyShowcase, SHOWN } from "@/components/CurrencyShowcase";
import { RouteGlobe } from "@/components/RouteGlobe";

/**
 * Holds the currency the whole section is showing, so the card and the globe
 * beside it agree.
 *
 * The state has to live above both of them. It used to sit inside the
 * showcase, with a stock photograph next to it that never changed whichever
 * currency you picked.
 */
export function CurrencyLive() {
  const [index, setIndex] = useState(0);
  const active = SHOWN[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SHOWN.length);
    }, 4600);
    return () => clearInterval(timer);
    // Re-armed by `index`, so a tap restarts the dwell rather than cutting it
    // short a moment later.
  }, [index]);

  const select = useCallback((next: number) => setIndex(next), []);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-center">
      <div className="card reveal p-6 sm:p-8">
        <CurrencyShowcase index={index} onSelect={select} />
      </div>
      <RouteGlobe code={active.code} iso={active.iso} />
    </div>
  );
}
