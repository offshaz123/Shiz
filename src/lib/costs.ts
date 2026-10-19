import { execute, query } from "./db";
import { type CartItem, type StyleId, charCount, plateText } from "./plates";

// What it costs to make the plates (materials only), for Admin → Costs and
// the true profit on the Money page. Material prices are kept with the date
// they started, so a change of supplier only affects orders from then on.

export type MaterialCosts = {
  acrylic: number; // £ per plate (standard or hex)
  reflective: number; // £ per plate, white or yellow
  flagSheet: number; // £ per plate with a flag or green strip, instead of the plain reflective
  letter4d: number; // £ per 4D letter
  letterGel: number; // £ per gel letter
  premiumExtra: number; // £ more per plate for premium acrylic
  border: number; // £ per plate with a border
  pads: number; // £ per set of sticky pads
  screws: number; // £ per set of screws
};

export const DEFAULT_COSTS: MaterialCosts = {
  acrylic: 1.6,
  reflective: 0.77,
  flagSheet: 1.308, // £1.09 + 20% VAT
  letter4d: 0.26,
  letterGel: 0.35,
  premiumExtra: 0,
  border: 0,
  pads: 0,
  screws: 0,
};

export const costLabels: Record<keyof MaterialCosts, string> = {
  acrylic: "Acrylic (per plate)",
  reflective: "Reflective sheet, white or yellow (per plate)",
  flagSheet: "Flag / green strip sheet (per plate, inc. VAT)",
  letter4d: "4D letter (each)",
  letterGel: "Gel letter (each)",
  premiumExtra: "Premium acrylic, extra per plate",
  border: "Border (per plate)",
  pads: "Sticky pads (per set)",
  screws: "Screws (per set)",
};

// Letters stacked on each character, per style.
export const recipes: Record<StyleId, { d4: number; gel: number; text: string }> = {
  standard: { d4: 0, gel: 0, text: "Printed, no letters" },
  "3d-gel": { d4: 0, gel: 1, text: "1 gel letter" },
  "4d-3mm": { d4: 1, gel: 0, text: "1 × 4D letter" },
  "4d-5mm": { d4: 2, gel: 0, text: "2 × 4D letters" },
  "5mm-gel": { d4: 2, gel: 1, text: "2 × 4D + 1 gel" },
  "7mm-gel": { d4: 3, gel: 1, text: "3 × 4D + 1 gel" },
};

export type CostsEntry = { from: number; costs: MaterialCosts };

export async function costHistory(): Promise<CostsEntry[]> {
  const rows = await query<{ value: string }>("SELECT value FROM app_settings WHERE name = 'material_costs'");
  try {
    const list = rows[0] ? (JSON.parse(rows[0].value) as CostsEntry[]) : [];
    return list.map((e) => ({ from: e.from, costs: { ...DEFAULT_COSTS, ...e.costs } })).sort((a, b) => a.from - b.from);
  } catch {
    return [];
  }
}

// The material prices that applied on a date.
export function costsOn(history: CostsEntry[], when: Date | number) {
  const t = new Date(when).getTime();
  let found = DEFAULT_COSTS;
  for (const e of history) if (e.from <= t) found = e.costs;
  return found;
}

export async function saveCosts(costs: MaterialCosts, from: number) {
  const list = (await costHistory()).filter((e) => e.from !== from);
  list.push({ from, costs });
  list.sort((a, b) => a.from - b.from);
  await execute("INSERT INTO app_settings (name, value) VALUES ('material_costs', ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [JSON.stringify(list)]);
}

const round = (pounds: number) => Math.round(pounds * 100);

// One plate (front or back), in pence.
export function plateCost(item: Pick<CartItem, "style" | "type" | "reg" | "badge" | "border" | "material">, c: MaterialCosts) {
  const r = recipes[item.style] ?? recipes.standard;
  const chars = charCount(plateText(item));
  let pounds = c.acrylic + (item.badge !== "none" ? c.flagSheet : c.reflective) + chars * (r.d4 * c.letter4d + r.gel * c.letterGel);
  if (item.material === "premium") pounds += c.premiumExtra;
  if (item.border !== "none") pounds += c.border;
  return round(pounds);
}

// A basket line: one or two plates, times the quantity, plus fixings. Pence.
export function itemCost(item: CartItem, c: MaterialCosts) {
  const plates = item.which === "pair" ? 2 : 1;
  const fixing = item.fixing === "pads" ? c.pads : item.fixing === "screws" ? c.screws : item.fixing === "both" ? c.pads + c.screws : 0;
  return item.qty * (plates * plateCost(item, c) + round(fixing));
}

export function orderCost(items: CartItem[], c: MaterialCosts) {
  return items.reduce((n, i) => n + itemCost(i, c), 0);
}
