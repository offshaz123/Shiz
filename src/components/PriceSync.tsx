"use client";

import { type PriceChange, setPriceChanges } from "@/lib/plates";

// Hands the shop's current price changes to the browser before anything
// that shows a price is drawn (it sits first in the page).
export function PriceSync({ changes }: { changes: PriceChange[] }) {
  setPriceChanges(changes);
  return null;
}
