// Plate options, prices and registration rules. Prices are in pence so the
// maths never drifts; change them here and the builder, basket and checkout
// all follow.

export type StyleId = "standard" | "3d-gel" | "4d-3mm" | "4d-5mm" | "5mm-gel" | "7mm-gel";
export type PlateType = "legal" | "show";
export type WhichId = "pair" | "front" | "rear";
export type BadgeId = "none" | "green" | "green-uk" | "uk" | "eng" | "sco" | "cym";
export type FlagId = "uk" | "eng" | "sco" | "cym";
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
    blurb: "Classic flat print with a crisp, factory-fresh finish.",
    look: "flat",
    depth: 0,
    pair: 2999,
    single: 1799,
  },
  {
    id: "3d-gel",
    name: "3D Gel",
    blurb: "Raised, glossy resin gel letters that catch the light.",
    look: "gel",
    depth: 1,
    pair: 3999,
    single: 2399,
  },
  {
    id: "4d-3mm",
    name: "4D 3MM",
    blurb: "3mm laser-cut acrylic letters for a sharp, raised look.",
    look: "acrylic",
    depth: 1.6,
    pair: 4499,
    single: 2699,
  },
  {
    id: "4d-5mm",
    name: "4D 5MM",
    blurb: "Deeper 5mm laser-cut acrylic letters for a bolder finish.",
    look: "acrylic",
    depth: 2.6,
    pair: 4999,
    single: 2999,
  },
  {
    id: "5mm-gel",
    name: "5MM Gel",
    blurb: "5mm acrylic letters topped with glossy gel.",
    look: "gel",
    depth: 2.6,
    pair: 5499,
    single: 3299,
  },
  {
    id: "7mm-gel",
    name: "7MM Gel",
    blurb: "Our deepest 7mm gel letters. Maximum impact.",
    look: "gel",
    depth: 3.6,
    pair: 6499,
    single: 3899,
  },
];

export const whichPlates: { id: WhichId; name: string }[] = [
  { id: "pair", name: "Both Plates" },
  { id: "front", name: "Front Only" },
  { id: "rear", name: "Rear Only" },
];

// Badges allowed on UK plates since 2021. Each is a single panel on the left
// of the plate, so only one can be chosen. The green strip (plain, or with
// "UK" on it) is for zero-emission vehicles only.
export const badges: { id: BadgeId; name: string; code: string; flag: FlagId | null; green: boolean }[] = [
  { id: "none", name: "No Badge", code: "", flag: null, green: false },
  { id: "green", name: "Green Strip", code: "", flag: null, green: true },
  { id: "green-uk", name: "Green Strip UK", code: "UK", flag: null, green: true },
  { id: "uk", name: "UK Flag", code: "UK", flag: "uk", green: false },
  { id: "eng", name: "England Flag", code: "ENG", flag: "eng", green: false },
  { id: "sco", name: "Scotland Flag", code: "SCO", flag: "sco", green: false },
  { id: "cym", name: "Wales Flag", code: "CYM", flag: "cym", green: false },
];

export const borders: { id: BorderId; name: string }[] = [
  { id: "none", name: "No border" },
  { id: "black", name: "Black border" },
];

export const fixings: { id: FixingId; name: string; note: string; price: number }[] = [
  { id: "none", name: "None", note: "", price: 0 },
  { id: "pads", name: "Sticky Pads", note: "Sticky fixing pads", price: 199 },
  { id: "screws", name: "Screws", note: "Screws with matching caps", price: 249 },
  { id: "both", name: "Sticky Pads & Screws", note: "Pads and screws kit", price: 399 },
];

export const extrasPrice = {
  badge: 399,
  border: 349,
} as const;

export const delivery: { id: DeliveryId; name: string; note: string; price: number }[] = [
  { id: "standard", name: "Free Tracked Delivery", note: "1–2 working days", price: 0 },
  { id: "nextday", name: "Next Day Delivery", note: "Order before 2pm Mon–Fri", price: 499 },
];

export type PlateConfig = {
  type: PlateType;
  reg: string;
  style: StyleId;
  which: WhichId;
  border: BorderId;
  badge: BadgeId;
  fixing: FixingId;
};

export type CartItem = PlateConfig & { id: string; qty: number };

export const defaultConfig: PlateConfig = {
  type: "legal",
  reg: "",
  style: "3d-gel",
  which: "pair",
  border: "none",
  badge: "none",
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

// Show plates aren't road legal, so customers can type whatever they like:
// letters, numbers, a few symbols, and spaces anywhere (kept exactly as typed).
export const SHOW_MAX = 12;

export function cleanShowText(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9 &!?'.\-]/g, "")
    .slice(0, SHOW_MAX);
}

export function isValidShowText(input: string) {
  return cleanShowText(input).trim().length > 0;
}

// The text that goes on the plate: free text for show plates, the legally
// spaced registration for road-legal plates.
export function plateText(c: Pick<PlateConfig, "type" | "reg">) {
  return c.type === "show" ? cleanShowText(c.reg).trim() : formatReg(c.reg);
}

export function isValidPlateText(c: Pick<PlateConfig, "type" | "reg">) {
  return c.type === "show" ? isValidShowText(c.reg) : isValidReg(c.reg);
}

export function unitPrice(c: PlateConfig) {
  const style = styles.find((s) => s.id === c.style) ?? styles[0];
  let p = c.which === "pair" ? style.pair : style.single;
  if (c.badge !== "none") p += extrasPrice.badge;
  if (c.border !== "none") p += extrasPrice.border;
  p += fixings.find((f) => f.id === c.fixing)?.price ?? 0;
  return p;
}

export function describe(c: PlateConfig) {
  const style = styles.find((s) => s.id === c.style)!;
  const which = whichPlates.find((w) => w.id === c.which)!;
  const parts = [c.type === "show" ? "SHOW PLATE (not road legal)" : "Road Legal", style.name, which.name];
  const badge = badges.find((b) => b.id === c.badge)!;
  if (c.badge !== "none") parts.push(badge.name);
  if (c.border !== "none") parts.push("Black border");
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
  const type: PlateType = r.type === "show" ? "show" : "legal";
  const qty = Number(r.qty);
  if (!style || !which || !badge || !border || !fixing) return null;
  if (!isValidPlateText({ type, reg }) || !Number.isInteger(qty) || qty < 1 || qty > 10) return null;
  return {
    type,
    id: typeof r.id === "string" ? r.id.slice(0, 40) : "",
    reg: plateText({ type, reg }),
    style,
    which,
    badge,
    border,
    fixing,
    qty,
  };
}
