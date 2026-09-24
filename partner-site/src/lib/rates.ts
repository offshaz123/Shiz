import { currencies } from "@/lib/brand";

/**
 * Live mid-market reference rates, GBP base.
 *
 * Source is the European Central Bank's daily reference rates, via
 * frankfurter.dev — free, no key, no account. The ECB publishes once a
 * working day around 16:00 CET, so these are a daily reference, not a tick
 * feed, and the UI must not imply otherwise.
 *
 * WHAT THESE ARE NOT. They are not a quote, and they are not our pricing.
 * OvaroPay introduces customers to a regulated firm; it does not price
 * foreign exchange. Everywhere a rate appears it is labelled a mid-market
 * reference rate with the date it was published. Publishing something that
 * reads like an offer would stray into the activity the licence covers, and
 * the licence is not ours.
 *
 * Every currency on our list is one the ECB publishes, so nothing here is
 * derived or interpolated. Note that brand.ts records an open question about
 * whether AED and HKD are served at all; they are not on the currency list,
 * so they are not fetched, and this file should not be the place that
 * quietly answers that question.
 */

const ENDPOINT = "https://api.frankfurter.dev/v1/latest";

export type Rates = {
  base: "GBP";
  date: string;
  rates: Record<string, number>;
  /** False when the upstream call failed and nothing could be served. */
  live: boolean;
};

/** Cached in the module for an hour: the ECB only moves once a day. */
let cache: { value: Rates; until: number } | null = null;
const HOUR = 3_600_000;

export async function getRates(): Promise<Rates> {
  if (cache && cache.until > Date.now()) return cache.value;

  const wanted = currencies
    .map((currency) => currency.code)
    .filter((code) => code !== "GBP");

  try {
    const response = await fetch(`${ENDPOINT}?base=GBP&symbols=${wanted.join(",")}`, {
      // Next would otherwise cache this in its own layer as well, which just
      // makes two caches to reason about.
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`Upstream ${response.status}`);

    const data = (await response.json()) as { date: string; rates: Record<string, number> };
    const rates: Record<string, number> = { GBP: 1, ...data.rates };
    const value: Rates = { base: "GBP", date: data.date, rates, live: true };
    cache = { value, until: Date.now() + HOUR };
    return value;
  } catch (err) {
    console.error("Rates: upstream fetch failed", err);
    // Serve the last good answer rather than nothing, even past its hour. A
    // day-old reference rate labelled with its date is honest; a blank space
    // where a number should be looks broken.
    if (cache) return { ...cache.value, live: false };
    return { base: "GBP", date: "", rates: {}, live: false };
  }
}
