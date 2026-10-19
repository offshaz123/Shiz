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
export type SizeId = "standard" | "hex4" | "hex5" | "hex6" | "hex7";
export type MaterialId = "standard" | "premium";

// Everything here is what we stock: the standard car plate (520 × 111mm) and
// hex plates cut to the length of the registration. A hex plate's ends come
// to a point, so it's a little longer than the characters need; `chars` is
// the most characters (not counting the space) that fit. Hex plates have no
// room for a flag or border.
export const sizes: { id: SizeId; name: string; short: string; width: number; height: number; chars: number; hex: boolean }[] = [
  { id: "standard", name: "Standard", short: "Standard", width: 520, height: 111, chars: 7, hex: false },
  { id: "hex4", name: "Hex Plate – up to 4 characters", short: "Hex 4", width: 330, height: 111, chars: 4, hex: true },
  { id: "hex5", name: "Hex Plate – 5 characters", short: "Hex 5", width: 390, height: 111, chars: 5, hex: true },
  { id: "hex6", name: "Hex Plate – 6 characters", short: "Hex 6", width: 450, height: 111, chars: 6, hex: true },
  { id: "hex7", name: "Hex Plate – 7 characters", short: "Hex 7", width: 520, height: 111, chars: 7, hex: true },
];
// Hex plates cost this much more than the same style in the standard shape.
export const HEX_EXTRA = 1500;

export const materials: { id: MaterialId; name: string; note: string; price: number }[] = [
  { id: "standard", name: "Standard Acrylic", note: "Our everyday road-legal acrylic", price: 0 },
  { id: "premium", name: "Premium Acrylic", note: "Thicker, high-gloss acrylic for a more premium finish", price: 399 },
];

export const sizeOf = (c: Pick<PlateConfig, "size">) => sizes.find((s) => s.id === c.size) ?? sizes[0];

// Characters on the plate, not counting spaces (what decides the hex size).
export const charCount = (text: string) => text.replace(/\s/g, "").length;

// The smallest plate size that fits this text (hex only).
export function hexSizeFor(text: string) {
  const n = charCount(text);
  return sizes.find((s) => s.hex && n <= s.chars) ?? null;
}

// Whether the text fits the chosen size.
export function fitsSize(c: Pick<PlateConfig, "size" | "type" | "reg">) {
  return charCount(plateText(c)) <= sizeOf(c).chars || !sizeOf(c).hex;
}

// Price changes set in the admin (Admin → Prices), loaded from the database
// on the server and handed to the browser with each page. A change with a
// future date is shown to customers as "goes up to £X on <date>" and starts
// automatically on that date. Until the database has been read, the launch
// price rise below is used.
export type PriceChange = { id?: number; style: StyleId; pair: number; single: number; startsAt: number };

export const LAUNCH_RISE: PriceChange[] = [
  { style: "3d-gel", pair: 4999, single: 2899, startsAt: Date.parse("2026-11-10T00:00:00Z") },
  { style: "4d-3mm", pair: 5499, single: 3199, startsAt: Date.parse("2026-11-10T00:00:00Z") },
  { style: "4d-5mm", pair: 5999, single: 3499, startsAt: Date.parse("2026-11-10T00:00:00Z") },
];

let priceChanges: PriceChange[] = LAUNCH_RISE;

export function setPriceChanges(list: PriceChange[]) {
  priceChanges = list;
}

export function getPriceChanges() {
  return priceChanges;
}

// A style's price today: its latest change that has started, or its base price.
function priceOf(id: StyleId, base: { pair: number; single: number }, now = Date.now()) {
  let current: PriceChange | null = null;
  for (const c of priceChanges) if (c.style === id && c.startsAt <= now && (!current || c.startsAt > current.startsAt)) current = c;
  return current ?? base;
}

// The next change for a style, when it's a rise customers should be told about.
export function upcomingPrice(id: StyleId, now = Date.now()) {
  const style = styles.find((s) => s.id === id);
  let next: PriceChange | null = null;
  for (const c of priceChanges) if (c.style === id && c.startsAt > now && (!next || c.startsAt < next.startsAt)) next = c;
  return next && style && next.pair > style.pair ? next : null;
}

// "10 November", and the day before it ("Sunday 9 November"), in UK time.
export function changeDay(startsAt: number) {
  return new Date(startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "Europe/London" });
}
export function lastDayBefore(startsAt: number) {
  return new Date(startsAt - 1).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" });
}

type StyleDef = {
  id: StyleId;
  name: string;
  blurb: string;
  // How the characters are drawn in the preview.
  look: "flat" | "gel" | "acrylic";
  depth: number;
  // Today's prices (pence), after any price change.
  readonly pair: number;
  readonly single: number;
};

const baseStyles: (Omit<StyleDef, "pair" | "single"> & { pair: number; single: number })[] = [
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

// The styles with their prices worked out live (base price, or the latest change).
export const styles: StyleDef[] = baseStyles.map((base) => {
  const style = { ...base };
  Object.defineProperties(style, {
    pair: { get: () => priceOf(base.id, base).pair, enumerable: true },
    single: { get: () => priceOf(base.id, base).single, enumerable: true },
  });
  return style;
});

export const basePrices = (id: StyleId) => {
  const b = baseStyles.find((s) => s.id === id)!;
  return { pair: b.pair, single: b.single };
};

export const whichPlates: { id: WhichId; name: string }[] = [
  { id: "pair", name: "Both Plates" },
  { id: "front", name: "Front Only" },
  { id: "rear", name: "Rear Only" },
];

// Badges allowed on UK plates since 2021. Each is a single panel on the left
// of the plate, so only one can be chosen. The green strip is for
// zero-emission vehicles only. Badges we no longer sell (offered: false) stay
// listed so older orders still show what was ordered.
export const badges: { id: BadgeId; name: string; code: string; flag: FlagId | null; green: boolean; offered: boolean }[] = [
  { id: "none", name: "No Badge", code: "", flag: null, green: false, offered: true },
  { id: "green", name: "Green Strip", code: "", flag: null, green: true, offered: true },
  { id: "uk", name: "UK Flag", code: "UK", flag: "uk", green: false, offered: true },
  { id: "eng", name: "England Flag", code: "ENG", flag: "eng", green: false, offered: true },
  { id: "green-uk", name: "Green Strip UK", code: "UK", flag: null, green: true, offered: false },
  { id: "sco", name: "Scotland Flag", code: "SCO", flag: "sco", green: false, offered: false },
  { id: "cym", name: "Wales Flag", code: "CYM", flag: "cym", green: false, offered: false },
];
export const offeredBadges = badges.filter((b) => b.offered);

export const borders: { id: BorderId; name: string }[] = [
  { id: "none", name: "No border" },
  { id: "black", name: "Black border" },
];

export const fixings: { id: FixingId; name: string; note: string; price: number }[] = [
  { id: "none", name: "None", note: "", price: 0 },
  { id: "pads", name: "Sticky Pads", note: "Sticky fixing pads", price: 199 },
  { id: "screws", name: "Screws", note: "Screws with matching caps", price: 299 },
  { id: "both", name: "Sticky Pads & Screws", note: "Pads and screws kit", price: 399 },
];

export const extrasPrice = {
  badge: 399,
  border: 399,
} as const;

// Tracked delivery is free once the plates come to this much (£100).
export const FREE_DELIVERY_FROM = 10000;

export const delivery: { id: DeliveryId; name: string; note: string; price: number }[] = [
  { id: "standard", name: "Tracked Delivery", note: "2–5 working days", price: 499 },
  { id: "nextday", name: "Next Day Delivery", note: "Next working day · order before 2pm Mon–Fri", price: 699 },
];

// What a delivery option costs for a basket of plates worth `subtotal`.
export function deliveryPrice(id: DeliveryId, subtotal: number) {
  const option = delivery.find((d) => d.id === id) ?? delivery[0];
  if (option.id === "standard" && subtotal >= FREE_DELIVERY_FROM) return 0;
  return option.price;
}


export type PlateConfig = {
  type: PlateType;
  reg: string;
  size: SizeId;
  material: MaterialId;
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
  size: "standard",
  material: "standard",
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
  if (sizeOf(c).hex) p += HEX_EXTRA;
  p += materials.find((m) => m.id === c.material)?.price ?? 0;
  // Hex plates can't have a flag or border.
  if (c.badge !== "none" && !sizeOf(c).hex) p += extrasPrice.badge;
  if (c.border !== "none" && !sizeOf(c).hex) p += extrasPrice.border;
  p += fixings.find((f) => f.id === c.fixing)?.price ?? 0;
  return p;
}

export function describe(c: PlateConfig) {
  const style = styles.find((s) => s.id === c.style)!;
  const which = whichPlates.find((w) => w.id === c.which)!;
  const parts = [c.type === "show" ? "SHOW PLATE (not road legal)" : "Road Legal"];
  if (sizeOf(c).hex) parts.push(sizeOf(c).short);
  parts.push(style.name);
  if (c.material === "premium") parts.push("Premium Acrylic");
  parts.push(which.name);
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
  return checkItem(raw, offeredBadges);
}

// The same check for orders already placed, which may have an option we've
// since stopped selling.
export function sanitiseSavedItem(raw: unknown): CartItem | null {
  return checkItem(raw, badges);
}

function checkItem(raw: unknown, badgeList: { id: BadgeId }[]): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, list: { id: T }[]) =>
    list.find((x) => x.id === v)?.id;
  const style = pick(r.style, styles);
  const which = pick(r.which, whichPlates);
  const badge = pick(r.badge, badgeList);
  const border = pick(r.border, borders);
  const fixing = pick(r.fixing, fixings);
  // Older baskets and orders were all standard size and material.
  const size = r.size === undefined ? "standard" : pick(r.size, sizes);
  const material = r.material === undefined ? "standard" : pick(r.material, materials);
  const hex = sizes.find((s) => s.id === size)?.hex ?? false;
  const reg = typeof r.reg === "string" ? r.reg : "";
  const type: PlateType = r.type === "show" ? "show" : "legal";
  const qty = Number(r.qty);
  if (!style || !which || !badge || !border || !fixing || !size || !material) return null;
  if (!isValidPlateText({ type, reg }) || !Number.isInteger(qty) || qty < 1 || qty > 10) return null;
  if (!fitsSize({ size, type, reg })) return null;
  return {
    type,
    id: typeof r.id === "string" ? r.id.slice(0, 40) : "",
    reg: plateText({ type, reg }),
    size,
    material,
    style,
    which,
    badge: hex ? "none" : badge,
    border: hex ? "none" : border,
    fixing,
    qty,
  };
}
