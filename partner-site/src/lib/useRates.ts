"use client";

import { useEffect, useState } from "react";
import type { Rates } from "@/lib/rates";

/**
 * Live rates in the browser, or undefined until they arrive.
 *
 * Every component using this must render something sensible while it is
 * undefined — the page is static and ships before this resolves, so a layout
 * that only works once rates land will visibly jump.
 */
export function useRates() {
  const [rates, setRates] = useState<Rates | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rates")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.rates) setRates(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return rates;
}

/** "1.3220" — four decimals is the convention for a major pair. */
export const formatRate = (value: number) =>
  value.toLocaleString("en-GB", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
