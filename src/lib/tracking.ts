// Parcel tracking numbers added when an order is dispatched.

export const carriers = {
  royalmail: { name: "Royal Mail", url: (n: string) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
  parcelforce: { name: "Parcelforce", url: (n: string) => `https://www.parcelforce.com/track-trace?trackNumber=${n}` },
  dpd: { name: "DPD", url: (n: string) => `https://track.dpd.co.uk/parcels/${n}` },
  evri: { name: "Evri", url: (n: string) => `https://www.evri.com/track/parcel/${n}` },
} as const;

export type CarrierId = keyof typeof carriers;

export function isCarrier(v: unknown): v is CarrierId {
  return typeof v === "string" && v in carriers;
}

// Letters and numbers only, as carriers print them.
export function cleanTrackingNumber(v: unknown) {
  return String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 40);
}

export function trackingLink(o: { tracking_number: string | null; tracking_carrier: string | null }) {
  if (!o.tracking_number) return null;
  const carrier = isCarrier(o.tracking_carrier) ? carriers[o.tracking_carrier] : carriers.royalmail;
  return { carrier: carrier.name, number: o.tracking_number, url: carrier.url(encodeURIComponent(o.tracking_number)) };
}
