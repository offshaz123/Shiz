import { type PlateConfig, type StyleId, defaultConfig, styles, unitPrice } from "./plates";
import { site } from "./site";

// Everything we list on Google Shopping (feed.xml): each plate style as a
// road-legal pair, a single plate, a motorbike plate, a 4x4 / import pair, a
// hex pair and a show plate pair. Each has its own page (/plates/<style> for
// the pair, /plates/<style>/<kind> for the rest), the builder already set up
// for it, so the page shows the same price as Google.

export const KINDS = {
  pair: {
    config: {},
    title: (name: string) => `${name} Number Plates – Road Legal Pair (Front & Rear)`,
    text: "A pair of road-legal front and rear number plates made to order for your registration.",
  },
  single: {
    config: { which: "rear" },
    title: (name: string) => `${name} Number Plate – Single Road Legal Plate (Front or Rear)`,
    text: "One road-legal number plate, front (white) or rear (yellow), made to order for your registration.",
  },
  motorbike: {
    config: { size: "motorbike", which: "rear" },
    title: (name: string) => `${name} Motorbike Number Plate – Road Legal 9 × 7 in`,
    text: "A road-legal 9 × 7 in rear motorbike plate on two lines, made to order for your registration.",
  },
  "4x4-import": {
    config: { size: "square" },
    title: (name: string) => `${name} 4x4 / Import Square Number Plates – Road Legal Pair 11 × 8 in`,
    text: "A pair of road-legal 11 × 8 in square plates on two lines, for 4x4s and imports with a square plate space, made to order for your registration.",
  },
  hex: {
    config: { size: "hex7" },
    title: (name: string) => `${name} Hex Number Plates – Road Legal Pair`,
    text: "A pair of road-legal hex plates with pointed ends, cut to fit your registration, made to order.",
  },
  show: {
    config: { type: "show" },
    title: (name: string) => `${name} Show Plates – Custom Text Pair (Not Road Legal)`,
    text: "A pair of show plates with any text you like, for car shows, display and gifts. Show plates are not road legal and can't be used on the road.",
  },
} satisfies Record<string, { config: Partial<PlateConfig>; title: (name: string) => string; text: string }>;

export type Kind = keyof typeof KINDS;
export const isKind = (v: string): v is Kind => v in KINDS;

export type Listing = {
  id: string;
  style: StyleId;
  kind: Kind;
  path: string;
  title: string;
  description: string;
  config: Partial<PlateConfig>;
  // Today's price in pence, the same as the builder shows.
  price: number;
  image: string;
};

export function listing(style: StyleId, kind: Kind): Listing {
  const s = styles.find((x) => x.id === style)!;
  const k = KINDS[kind];
  const config: Partial<PlateConfig> = { ...k.config, style };
  const legal = kind === "show" ? "" : " Made to BS AU 145e by a DVLA registered supplier.";
  return {
    id: `PU-${style.toUpperCase()}-${kind.toUpperCase()}`,
    style,
    kind,
    path: kind === "pair" ? `/plates/${style}` : `/plates/${style}/${kind}`,
    title: k.title(s.name),
    description: `${s.blurb} ${k.text}${legal} Same day dispatch when you order before ${site.dispatchCutoff} on a working day.`,
    config,
    price: unitPrice({ ...defaultConfig, ...config }),
    image: `${site.url}/api/product-image?${new URLSearchParams({ style, kind })}`,
  };
}

export const allListings = () => styles.flatMap((s) => (Object.keys(KINDS) as Kind[]).map((k) => listing(s.id, k)));
