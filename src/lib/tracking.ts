// Parcel tracking numbers added when an order is dispatched.

export const carriers = {
  royalmail: { name: "Royal Mail", url: (n: string) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
  parcelforce: { name: "Parcelforce", url: (n: string) => `https://www.parcelforce.com/track-trace?trackNumber=${n}` },
  dpd: { name: "DPD", url: (n: string) => `https://track.dpd.co.uk/parcels/${n}` },
  evri: { name: "Evri", url: (n: string) => `https://www.evri.com/track/parcel/${n}` },
  inpost: { name: "InPost", url: (n: string) => `https://inpost.co.uk/tracking/?number=${n}` },
  yodel: { name: "Yodel", url: (n: string) => `https://www.yodel.co.uk/tracking/${n}` },
  ups: { name: "UPS", url: (n: string) => `https://www.ups.com/track?tracknum=${n}` },
  dhl: { name: "DHL", url: (n: string) => `https://www.dhl.com/gb-en/home/tracking.html?tracking-id=${n}` },
} as const;

export type CarrierId = keyof typeof carriers;

export function isCarrier(v: unknown): v is CarrierId {
  return typeof v === "string" && v in carriers;
}

// Our courier for a courier name as another service writes it ("Evri", "Hermes UK", "DPD Next Day").
export function carrierFromName(name: unknown): CarrierId | null {
  const n = String(name ?? "").toLowerCase();
  if (/evri|hermes/.test(n)) return "evri";
  if (/parcelforce/.test(n)) return "parcelforce";
  if (/royal ?mail/.test(n)) return "royalmail";
  if (/dpd/.test(n)) return "dpd";
  if (/inpost/.test(n)) return "inpost";
  if (/yodel/.test(n)) return "yodel";
  if (/ups/.test(n)) return "ups";
  if (/dhl/.test(n)) return "dhl";
  return null;
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
