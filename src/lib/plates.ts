// Plate options, prices and registration rules. Prices are in pence so the
// maths never drifts; change them here and the builder, basket and checkout
// all follow.

export type StyleId = "standard" | "3d-gel" | "4d-3mm" | "4d-5mm" | "5mm-gel" | "7mm-gel";
export type WhichId = "pair" | "front" | "rear";
export type BadgeId = "none" | "uk" | "eng" | "sco" | "cym";
export type BorderId = "none" | "black";
export type FixingId = "none" | "pads" | "screws" | "both";
export type DeliveryId = "standard" | "nextday";

// Everything here is what we stock. Plates are standard car size only
// (520 × 111mm).
export const plateSize = { name: "Standard Car", mm: "520 × 111mm" };

export const styles: {
  id: StyleId;
  name: string;
  blurb: string;
  // How the characters are drawn in the preview.
  look: "flat" | "gel" | "acrylic";
  depth: number;
  pair: number;
  single: number;
}[] = [
  {
    id: "standard",
    name: "Standard",
    blurb: "Classic flat print. Clean, crisp and great value.",
    look: "flat",
    depth: 0,
    pair: 1999,
    single: 1199,
  },
  {
    id: "3d-gel",
    name: "3D Gel",
    blurb: "Raised, glossy resin gel letters that catch the light.",
    look: "gel",
    depth: 1,
    pair: 2999,
    single: 1799,
  },
  {
    id: "4d-3mm",
    name: "4D 3MM",
    blurb: "3mm laser-cut acrylic letters for a sharp, raised look.",
    look: "acrylic",
    depth: 1.6,
    pair: 3499,
    single: 2099,
  },
  {
    id: "4d-5mm",
    name: "4D 5MM",
    blurb: "Deeper 5mm laser-cut acrylic letters for a bolder finish.",
    look: "acrylic",
    depth: 2.6,
    pair: 3999,
    single: 2399,
  },
  {
    id: "5mm-gel",
    name: "5MM Gel",
    blurb: "5mm acrylic letters topped with glossy gel.",
    look: "gel",
    depth: 2.6,
    pair: 4499,
    single: 2699,
  },
  {
    id: "7mm-gel",
    name: "7MM Gel",
    blurb: "Our deepest 7mm gel letters. Maximum impact.",
    look: "gel",
    depth: 3.6,
    pair: 4999,
    single: 2999,
  },
];

export const whichPlates: { id: WhichId; name: string }[] = [
  { id: "pair", name: "Both Plates" },
  { id: "front", name: "Front Only" },
  { id: "rear", name: "Rear Only" },
];

// Flags allowed on UK plates since 2021.
export const badges: { id: BadgeId; name: string; code: string }[] = [
  { id: "none", name: "No badge", code: "" },
  { id: "uk", name: "Union Flag", code: "UK" },
  { id: "eng", name: "England", code: "ENG" },
  { id: "sco", name: "Scotland", code: "SCO" },
  { id: "cym", name: "Wales", code: "CYM" },
];

export const borders: { id: BorderId; name: string }[] = [
  { id: "none", name: "No border" },
  { id: "black", name: "Black border" },
];

export const fixings: { id: FixingId; name: string; note: string; price: number }[] = [
  { id: "none", name: "None", note: "", price: 0 },
  { id: "pads", name: "Pads", note: "Sticky fixing pads", price: 199 },
  { id: "screws", name: "Screws kit", note: "Screws with matching caps", price: 249 },
  { id: "both", name: "Both", note: "Pads and screws kit", price: 399 },
];

export const extrasPrice = {
  badge: 299,
  border: 299,
  ev: 299,
} as const;

export const delivery: { id: DeliveryId; name: string; note: string; price: number }[] = [
  { id: "standard", name: "Free Tracked Delivery", note: "1–2 working days", price: 0 },
  { id: "nextday", name: "Next Day Delivery", note: "Order before 2pm Mon–Fri", price: 499 },
];

export type PlateConfig = {
  reg: string;
  style: StyleId;
  which: WhichId;
  border: BorderId;
  badge: BadgeId;
  ev: boolean;
  fixing: FixingId;
};

export type CartItem = PlateConfig & { id: string; qty: number };

export const defaultConfig: PlateConfig = {
  reg: "",
  style: "3d-gel",
  which: "pair",
  border: "none",
  badge: "none",
  ev: false,
  fixing: "none",
};

const formats: { re: RegExp; split: number | ((s: string) => number) }[] = [
  // Current: AB12 CDE
  { re: /^[A-Z]{2}[0-9]{2}[A-Z]{3}$/, split: 4 },
  // Prefix: A123 BCD
  { re: /^[A-Z][0-9]{1,3}[A-Z]{3}$/, split: (s) => s.length - 3 },
  // Suffix: ABC 123D
  { re: /^[A-Z]{3}[0-9]{1,3}[A-Z]$/, split: 3 },
  // Dateless: ABC 1234
  { re: /^[A-Z]{1,3}[0-9]{1,4}$/, split: (s) => s.search(/[0-9]/) },
  // Dateless: 1234 ABC
  { re: /^[0-9]{1,4}[A-Z]{1,3}$/, split: (s) => s.search(/[A-Z]/) },
];

export function cleanReg(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

// Plates must use the legal spacing, so we apply it for the customer.
export function formatReg(input: string) {
  const s = cleanReg(input);
  for (const f of formats) {
    if (f.re.test(s)) {
      const at = typeof f.split === "number" ? f.split : f.split(s);
      return `${s.slice(0, at)} ${s.slice(at)}`;
    }
  }
  return s;
}

export function isValidReg(input: string) {
  const s = cleanReg(input);
  return formats.some((f) => f.re.test(s));
}

export function unitPrice(c: PlateConfig) {
  const style = styles.find((s) => s.id === c.style) ?? styles[0];
  let p = c.which === "pair" ? style.pair : style.single;
  if (c.badge !== "none") p += extrasPrice.badge;
  if (c.border !== "none") p += extrasPrice.border;
  if (c.ev) p += extrasPrice.ev;
  p += fixings.find((f) => f.id === c.fixing)?.price ?? 0;
  return p;
}

export function describe(c: PlateConfig) {
  const style = styles.find((s) => s.id === c.style)!;
  const which = whichPlates.find((w) => w.id === c.which)!;
  const parts = [style.name, which.name];
  const badge = badges.find((b) => b.id === c.badge)!;
  if (c.badge !== "none") parts.push(`${badge.code} badge`);
  if (c.border !== "none") parts.push("Black border");
  if (c.ev) parts.push("EV strip");
  if (c.fixing !== "none") parts.push(`Fixing: ${fixings.find((f) => f.id === c.fixing)!.name}`);
  return parts.join(" · ");
}

export function money(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

// Re-checks anything that came from the browser so a tampered basket can't
// change prices or sneak in an option we don't sell.
export function sanitiseItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, list: { id: T }[]) =>
    list.find((x) => x.id === v)?.id;
  const style = pick(r.style, styles);
  const which = pick(r.which, whichPlates);
  const badge = pick(r.badge, badges);
  const border = pick(r.border, borders);
  const fixing = pick(r.fixing, fixings);
  const reg = typeof r.reg === "string" ? r.reg : "";
  const qty = Number(r.qty);
  if (!style || !which || !badge || !border || !fixing) return null;
  if (!isValidReg(reg) || !Number.isInteger(qty) || qty < 1 || qty > 10) return null;
  return {
    id: typeof r.id === "string" ? r.id.slice(0, 40) : "",
    reg: formatReg(reg),
    style,
    which,
    badge,
    border,
    ev: r.ev === true,
    fixing,
    qty,
  };
}
