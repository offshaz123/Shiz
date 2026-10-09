// UK address lookup.
// - Google Places (New) for "type an address, pick from the list". Needs
//   GOOGLE_MAPS_API_KEY with the "Places API (New)" enabled. The key stays on
//   the server; the browser only talks to our /api/address routes.
// - postcodes.io (free, no key) to fill in the town from a postcode.

const GOOGLE = process.env.GOOGLE_PLACES_API_BASE ?? "https://places.googleapis.com/v1";

export function isPlacesConfigured() {
  return Boolean(process.env.GOOGLE_MAPS_API_KEY);
}

// Simple per-visitor limit so nobody can run up the Google bill.
const hits = new Map<string, { n: number; reset: number }>();
export function rateLimited(ip: string, perMinute = 60) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) {
    hits.set(ip, { n: 1, reset: now + 60_000 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n++;
  return h.n > perMinute;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export type Suggestion = { id: string; main: string; secondary: string };

export async function suggest(input: string, sessionToken: string): Promise<Suggestion[]> {
  const res = await fetch(`${GOOGLE}/places:autocomplete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY! },
    body: JSON.stringify({
      input,
      sessionToken,
      includedRegionCodes: ["gb"],
      includedPrimaryTypes: ["street_address", "premise", "subpremise", "route"],
      languageCode: "en-GB",
    }),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Places error ${res.status}`);
  return (data.suggestions ?? [])
    .map((s: { placePrediction?: { placeId: string; text?: { text: string }; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } } }) => s.placePrediction)
    .filter(Boolean)
    .slice(0, 6)
    .map((p: { placeId: string; text?: { text: string }; structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } } }) => ({
      id: p.placeId,
      main: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
      secondary: p.structuredFormat?.secondaryText?.text ?? "",
    }));
}

export type Address = { address1: string; address2: string; town: string; postcode: string };

export async function details(placeId: string, sessionToken: string): Promise<Address> {
  const res = await fetch(`${GOOGLE}/places/${encodeURIComponent(placeId)}?sessionToken=${encodeURIComponent(sessionToken)}&languageCode=en-GB`, {
    headers: { "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY!, "X-Goog-FieldMask": "addressComponents" },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Places error ${res.status}`);
  const parts: { longText: string; types: string[] }[] = data.addressComponents ?? [];
  const get = (t: string) => parts.find((p) => p.types.includes(t))?.longText ?? "";
  const street = [get("street_number"), get("route")].filter(Boolean).join(" ");
  const building = [get("subpremise"), get("premise")].filter(Boolean).join(", ");
  return {
    address1: building && street ? `${building}, ${street}` : building || street,
    address2: get("neighborhood") || get("sublocality") || "",
    town: get("postal_town") || get("locality") || get("administrative_area_level_2"),
    postcode: get("postal_code").toUpperCase(),
  };
}

export async function townForPostcode(postcode: string) {
  const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const r = data.result;
  if (!r) return null;
  return { postcode: r.postcode as string, town: (r.post_town ?? r.admin_district ?? "") as string };
}
