export type SwatchVisual =
  | { kind: "tint"; opacity: number }
  | { kind: "gradient"; from: string; to: string }
  | { kind: "solid"; hex: string };

export type Variant = {
  name: string;
  description: string;
  swatch?: SwatchVisual;
};

export type ProcessStep = {
  step: string;
  title: string;
  description: string;
};

export type PricePoint = {
  label: string;
  price: string;
};

export type LegalNote = {
  verdict: "legal" | "check";
  heading: string;
  body: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type ComparisonTable = {
  title: string;
  columnA: string;
  columnB: string;
  rows: { feature: string; a: string; b: string }[];
};

export type ServiceCategory = {
  slug: string;
  navTitle: string;
  title: string;
  shortDescription: string;
  description: string;
  whatIncluded?: { name: string; description: string }[];
  variantsIntro?: string;
  variants?: Variant[];
  legalNote?: LegalNote;
  highlights: string[];
  pricing?: PricePoint[];
  timeEstimate?: string;
  warranty?: string;
  processSteps?: ProcessStep[];
  tradeEnquiry?: boolean;
  gallery?: GalleryImage[];
  comparisonTable?: ComparisonTable;
  trustNote?: string;
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "car-window-tints",
    navTitle: "Window Tints",
    title: "Car Window Tints",
    shortDescription: "Legal tint shades from a light 70% through to a 5% limo tint, explained properly before you book.",
    description:
      "Pick your shade and we'll tell you straight whether it's legal for that window before we fit anything — no bubbling, no purple fading, just a clean finish.",
    variantsIntro: "Our shades, compared",
    variants: [
      { name: "No Tint", description: "Standard clear glass — shown here for comparison.", swatch: { kind: "tint", opacity: 0 } },
      {
        name: "70% — Front Legal Tint",
        description: "Our lightest film, for front windows and windscreens where the law requires the most light through.",
        swatch: { kind: "tint", opacity: 0.15 },
      },
      {
        name: "50% — Light Tint",
        description: "A subtle shade that cuts glare and heat without looking dark. A popular choice for rear windows.",
        swatch: { kind: "tint", opacity: 0.32 },
      },
      {
        name: "35% — Medium Tint",
        description: "Noticeably darker and more private, while still letting plenty of light in.",
        swatch: { kind: "tint", opacity: 0.48 },
      },
      {
        name: "20% — Factory Tint",
        description: "Matches the factory-tint look many cars come with from new — a versatile, popular shade.",
        swatch: { kind: "tint", opacity: 0.64 },
      },
      {
        name: "5% — Limo Tint",
        description: "Our darkest shade for maximum privacy — the classic 'limo' look.",
        swatch: { kind: "tint", opacity: 0.85 },
      },
    ],
    legalNote: {
      verdict: "check",
      heading: "Is it legal?",
      body:
        "By law, front windscreens must let at least 75% of light through, and front side windows at least 70% — so 70% is the darkest film we'll fit there. Rear side windows and the rear windscreen have no legal minimum, which is why the 50%, 35%, 20% and 5% shades are fitted to rear windows only. We'll always confirm what's right for your car before booking you in.",
    },
    highlights: [
      "Every shade explained and matched to what's legal for that window",
      "Quality film — no bubbling, peeling or purple fading",
      "Most cars done within about 2 hours",
    ],
    timeEstimate: "Around 2 hours for a full car",
    gallery: [
      { src: "/gallery/window-tints/bmw-7-series-tint.jpg", alt: "BMW 7 Series with window tints freshly fitted in the SMG Details studio" },
      { src: "/gallery/window-tints/mercedes-amg-tint.jpg", alt: "Mercedes-AMG GLE with dark window tints fitted by SMG Details" },
      { src: "/gallery/window-tints/vw-golf-r-tint.jpg", alt: "VW Golf R with window tints fitted at the SMG Details studio" },
      { src: "/gallery/window-tints/land-rover-defender-front-tint.jpg", alt: "Land Rover Defender in the SMG Details studio for window tinting" },
      { src: "/gallery/window-tints/land-rover-defender-rear-tint.jpg", alt: "Land Rover Defender rear view at the SMG Details tinting studio" },
    ],
    comparisonTable: {
      title: "Dyed vs Ceramic Film",
      columnA: "Dyed Film",
      columnB: "Ceramic Film",
      rows: [
        { feature: "Heat rejection", a: "Cuts glare, modest heat reduction", b: "Excellent heat rejection — noticeably cooler cabin" },
        { feature: "Look over time", a: "Can fade to purple with age", b: "Won't fade or discolour" },
        { feature: "Warranty", a: "Standard warranty", b: "Longer manufacturer warranty" },
        { feature: "Signal & electronics", a: "No interference", b: "No interference (non-metallic)" },
        { feature: "Best for", a: "Budget-friendly privacy", b: "Maximum heat control & longevity" },
      ],
    },
    trustNote: "Loved by repeat customers — a lot of our tint customers come back with their next car too.",
  },
  {
    slug: "tail-light-tinting",
    navTitle: "Tail Light Tints",
    title: "Tail Light Tinting",
    shortDescription: "Smoke and dark smoke tail light tints, full or partial, in various finishes.",
    description:
      "Transform the back of your car with premium tail light tinting — a subtle smoke or a full dark-smoke look, fitted with UV-protected film that won't fade or peel.",
    whatIncluded: [
      { name: "Finish Options", description: "Smoke, dark smoke, or a custom finish to match what you're after." },
      { name: "Full or Partial Coverage", description: "Tint the whole lens or just part of it, depending on the look you want." },
    ],
    highlights: [
      "Smoke, dark smoke and custom finishes",
      "UV-protected film material — won't fade or peel",
      "Professional installation guarantee",
    ],
    pricing: [{ label: "Tail light tinting", price: "From £79" }],
  },
  {
    slug: "chameleon-windscreen",
    navTitle: "Chameleon Windscreen",
    title: "Chameleon Windscreen",
    shortDescription: "A colour-shifting sun-strip finish across the top of your windscreen, in red/gold or blue.",
    description:
      "A striking colour-shift finish that changes tone depending on the light and angle you're looking from — fitted the legal way, as a sun-strip along the top edge of the windscreen.",
    variantsIntro: "Available finishes",
    variants: [
      {
        name: "Red / Gold Chameleon",
        description: "Shifts between a deep red and a warm gold depending on the angle and light.",
        swatch: { kind: "gradient", from: "#7a1f2b", to: "#d4a017" },
      },
      {
        name: "Blue Chameleon",
        description: "Shifts between deep blue and a cooler teal-silver depending on the angle and light.",
        swatch: { kind: "gradient", from: "#0b2f5c", to: "#3ec6d9" },
      },
    ],
    legalNote: {
      verdict: "check",
      heading: "Is it legal?",
      body:
        "UK law requires windscreens to let at least 75% of light through across the area the wipers sweep, so a full colour-shift film over that whole area wouldn't meet that limit. We fit this as a sun-strip along the top edge of the windscreen — above the wiped area — which is the legal way to add a tinted or coloured film to a windscreen. We'll talk you through exactly how it sits on your car before fitting.",
    },
    highlights: [
      "Eye-catching colour-shift most people haven't seen before",
      "Fitted as a legal sun-strip, not a full windscreen film",
      "Available in red/gold or blue",
    ],
    pricing: [{ label: "Chameleon sun-strip", price: "From £99" }],
  },
  {
    slug: "number-plates",
    navTitle: "Number Plates",
    title: "Number Plates",
    shortDescription: "3D, 4D, 5D, 6D and gel plates made to order, road-legal and DVLA compliant.",
    description:
      "Custom show plates made in a choice of raised finishes, ready in around 2 working days. Pay in full at order, and collect in-shop or we'll get them to you.",
    variantsIntro: "Finishes available",
    variants: [
      { name: "3D Plates", description: "Raised acrylic digits for a subtle, tactile finish." },
      { name: "4D Plates", description: "Laser-cut acrylic digits with a sharp, layered look." },
      { name: "5D Plates", description: "Gloss-finished raised digits with extra depth and shine." },
      { name: "6D Plates", description: "Our most premium raised finish, with the deepest 3D effect." },
      { name: "3D Gel Plates", description: "Smooth, glossy gel-resin digits for a clean, modern look." },
    ],
    highlights: [
      "Made to DVLA specification — fully road-legal",
      "Ready in around 2 working days",
      "Pay in full at order — collect in-shop or come and buy in person",
    ],
    timeEstimate: "Around 2 working days",
    tradeEnquiry: true,
  },
  {
    slug: "wraps-dechrome-debadge",
    navTitle: "Wraps & Dechrome",
    title: "Vehicle Wraps, Dechrome & Debadge",
    shortDescription: "Full and partial wraps in any finish, plus dechroming and debadging.",
    description:
      "Premium cast vinyl wraps in any finish, full blackout dechroming, and clean debadging — a full colour change or a subtle accent, delivered to a cinema-ready finish.",
    whatIncluded: [
      {
        name: "Full & Partial Wraps",
        description: "Full colour-change wraps or partial accents — roof, bonnet, mirrors — using premium cast vinyl (3M, Hexis).",
      },
      {
        name: "Dechroming",
        description: "Handles, trims and window surrounds blacked out in gloss or satin for a full or partial blackout look.",
      },
      {
        name: "Debadging",
        description: "Clean removal of badges and trim for a smoother, uncluttered finish.",
      },
    ],
    variantsIntro: "Finishes we work with",
    variants: [
      { name: "Gloss", description: "A bright, reflective finish.", swatch: { kind: "gradient", from: "#0a0a0c", to: "#4a4a52" } },
      { name: "Satin", description: "A soft, low-sheen finish.", swatch: { kind: "gradient", from: "#2a2a30", to: "#5a5a62" } },
      { name: "Matte", description: "A completely flat, non-reflective finish.", swatch: { kind: "solid", hex: "#3a3a40" } },
      { name: "Metallic", description: "A fine metallic sheen with depth.", swatch: { kind: "gradient", from: "#6b6f76", to: "#c8ccd2" } },
      { name: "Chrome", description: "A mirror-like, highly reflective finish.", swatch: { kind: "gradient", from: "#c8ccd2", to: "#f2f4f6" } },
    ],
    pricing: [
      { label: "Full vehicle wrap", price: "From £999" },
      { label: "Accent wrap (roof, bonnet or mirrors)", price: "From £150" },
      { label: "Debadge", price: "From £20" },
    ],
    warranty: "Up to 10 years manufacturer material warranty",
    timeEstimate: "Around 2 days for a full wrap",
    highlights: [
      "Premium cast vinyl — 3M and Hexis",
      "Fully reversible and protects your original paint underneath",
      "Up to 10 years material warranty",
    ],
    processSteps: [
      { step: "01", title: "Design", description: "We talk through the finish, colour and coverage with you before anything's cut." },
      { step: "02", title: "Strip & Prep", description: "Panels are cleaned, decontaminated and prepped so the vinyl bonds properly." },
      { step: "03", title: "Wrap", description: "Vinyl is applied, heat-formed and finished around every edge and curve." },
      { step: "04", title: "Reassemble", description: "Trims, handles and badges go back on and the car gets a final check." },
    ],
  },
  {
    slug: "paint-protection-film",
    navTitle: "Paint Protection Film",
    title: "Paint Protection Film (PPF)",
    shortDescription: "An invisible, self-healing layer that takes the hit so your paint doesn't stone-chip.",
    description:
      "PPF is a clear, virtually invisible film applied over your paintwork that absorbs stone chips, light scratches and road debris — and self-heals minor marks with a bit of heat, so your paint stays showroom-fresh underneath.",
    highlights: [
      "Invisible finish — doesn't change how your car looks",
      "Self-healing film shrugs off light scratches and swirls",
      "Protects the panels that take the most damage — front bumper, bonnet, mirrors",
    ],
    pricing: [{ label: "PPF protection", price: "From £499" }],
  },
  {
    slug: "ceramic-coating-detailing",
    navTitle: "Ceramic Coating & Detailing",
    title: "Ceramic Coating & Detailing",
    shortDescription: "Gtechniq and CarPro ceramic coatings, plus multi-stage machine polishing.",
    description:
      "A durable ceramic coating locks in a deep, glossy finish and makes your car far easier to keep clean, while our multi-stage polishing corrects swirls and scratches before it goes on.",
    whatIncluded: [
      { name: "Stage 1 Polish", description: "A light, single-stage polish to remove light swirl marks and add gloss — our lightest correction." },
      { name: "Stage 2 Polish", description: "A deeper, two-stage polish for more noticeable swirls and marring." },
      { name: "Stage 3 Polish", description: "Our most thorough correction, for cars with visible scratches — maximum gloss and clarity." },
    ],
    highlights: [
      "We use Gtechniq and CarPro coatings and products",
      "Full detailing service alongside the coating, not just a wipe-down",
      "Choose the polish stage that matches your paint's condition",
    ],
    pricing: [{ label: "Ceramic coating", price: "From £299" }],
  },
  {
    slug: "alloy-refurbishment",
    navTitle: "Alloy Refurb & Calipers",
    title: "Alloy Refurbishment & Caliper Painting",
    shortDescription: "Diamond cut, painted or powder-coated alloy refurb, plus calipers resprayed in any colour.",
    description:
      "Bring tired, kerbed or corroded alloys back to a factory finish, and finish the look with calipers resprayed in any colour you like — individually or as a full set.",
    whatIncluded: [
      {
        name: "Alloy Wheel Refurbishment",
        description: "Diamond cut, painted or powder-coated refurb to repair kerb damage, corrosion and scuffs.",
      },
      {
        name: "Caliper Painting",
        description: "Brake calipers resprayed in any colour, individually or as a full set, for a clean, durable finish.",
      },
    ],
    variantsIntro: "Popular caliper colours (any colour available)",
    variants: [
      { name: "Red", description: "A classic performance red.", swatch: { kind: "solid", hex: "#c1272d" } },
      { name: "Yellow", description: "A bright, high-visibility yellow.", swatch: { kind: "solid", hex: "#f2b705" } },
      { name: "Blue", description: "A bold, deep blue.", swatch: { kind: "solid", hex: "#1c5fc4" } },
      { name: "Gloss Black", description: "A stealthy factory-look black.", swatch: { kind: "solid", hex: "#161616" } },
    ],
    pricing: [
      { label: "Caliper painting — all 4 calipers", price: "£200" },
      { label: "Caliper painting — single caliper", price: "£70" },
    ],
    timeEstimate: "Caliper painting: around 6 hours",
    highlights: [
      "Diamond cut, painted or powder-coated alloy finishes",
      "Kerb damage, corrosion and scuffs repaired properly",
      "Any caliper colour — all four for £200, the better-value option",
    ],
  },
  {
    slug: "vehicle-security",
    navTitle: "Ghost Immobiliser & Tracker",
    title: "Vehicle Security: Ghost Immobiliser & Tracker",
    shortDescription: "Ghost immobiliser and car tracker fitting, to keep your car where you left it.",
    description:
      "Two ways to protect your car from theft — a Ghost immobiliser that stops it being driven away without your PIN sequence, and a tracker so it can be located if it ever is. Fit one, or both together for extra peace of mind.",
    whatIncluded: [
      { name: "Ghost Immobiliser", description: "An invisible, code-based immobiliser with a 2-year warranty — no key fob to clone, no aerial to jam." },
      { name: "Car Tracker", description: "A fitted tracking device so your car can be located if it's ever stolen." },
    ],
    warranty: "2 years (Ghost immobiliser)",
    highlights: [
      "2-year warranty on the Ghost immobiliser",
      "Fit one or both together for extra peace of mind",
      "No visible box or aerial to give it away",
    ],
  },
  {
    slug: "car-servicing",
    navTitle: "Car Servicing",
    title: "Car Servicing",
    shortDescription: "Major and minor services, plus brake pad and disc replacement.",
    description:
      "Keep your car running safely and reliably with a full service carried out to manufacturer standards, or a minor service and brake job to keep on top of routine maintenance.",
    whatIncluded: [
      { name: "Major Service", description: "A comprehensive service covering all key components, fluids and filters." },
      { name: "Minor Service", description: "Routine maintenance covering oil, filters and a full safety check." },
      { name: "Brake Pads & Discs", description: "Supply and fit of brake pads and discs, front or rear, for safe stopping power." },
    ],
    highlights: [
      "Manufacturer-standard service schedules",
      "Straightforward pricing before any work starts",
      "Brakes checked and replaced properly, front or rear",
    ],
  },
];

export function findServiceCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
