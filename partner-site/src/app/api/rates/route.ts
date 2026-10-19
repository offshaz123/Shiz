import { NextResponse } from "next/server";
import { getRates } from "@/lib/rates";

/**
 * Rates for the browser.
 *
 * A route rather than reading them in the page, so the home page stays
 * statically rendered. The upstream call is cached in the module for an
 * hour, so this is cheap however many visitors ask.
 */
export async function GET() {
  const rates = await getRates();
  return NextResponse.json(rates, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
  });
}
