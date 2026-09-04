export const siteConfig = {
  name: "Executive Tints & Repairs",
  shortName: "Executive Tints & Repairs",
  description:
    "Premium window tinting and vehicle repairs. Standard dyed, ceramic and chameleon window tints, dechroming, brakes and oil servicing — finished to an executive standard, backed by a lifetime warranty on ceramic.",
  url: "https://executiveontop.com",
  email: "executivetints.ontop@gmail.com",
  phoneDisplay: "07300 303538",
  phoneE164: "+447300303538",
  whatsappNumber: "447300303538",
  whatsappMessage: "Hi Executive Tints & Repairs, I'd like to get a quote.",
  address: {
    line1: "15 Cecil Road",
    line2: "",
    city: "London",
    postcode: "E17 5DH",
    country: "United Kingdom",
  },
  // `day`/`time` are what visitors read. `schemaDays`/`opens`/`closes` feed the
  // AutoRepair JSON-LD, which needs individual day names and 24-hour times —
  // Google won't parse "Monday - Sunday" or "9:00am" for rich results.
  hours: [
    {
      day: "Monday - Sunday",
      time: "9:00am - 6:00pm",
      schemaDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  // Public social profiles. Leave a value empty to omit it. Use full URLs.
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
  // Public review rating, shown as a star badge and published in the
  // Organization schema. Fill these in ONLY from reviews genuinely received on
  // a real profile — the count and average must match what's publicly visible
  // there. While `count` is 0, no rating is published, which is deliberate:
  // publishing a rating you can't evidence breaches UK consumer protection
  // rules and risks a Google manual action.
  reviews: {
    averageRating: 0,
    count: 0,
    profileUrl: "",
  },
};

export const hasPublishedReviews = siteConfig.reviews.count > 0;

export const socialProfileUrls = Object.values(siteConfig.social).filter(Boolean);

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;

export type TintService = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  fromPrice: string;
  priceNote?: string;
  badge?: string;
};

export const tintServices: TintService[] = [
  {
    slug: "standard-dyed-tint",
    name: "Standard Dyed Window Tint",
    tagline: "Sharp looks, solid glare & UV protection",
    description:
      "Our entry-level tint film bonds a dye layer to the inside of your glass to cut glare, block harmful UV rays and give your car a clean, uniform finish — a great choice if you want the classic tinted look without the ceramic price tag.",
    features: [
      "Blocks up to 99% of harmful UV rays",
      "Reduces glare and interior fade",
      "Available in a full range of legal shades",
      "2 year warranty against bubbling & peeling",
    ],
    fromPrice: "£99",
  },
  {
    slug: "ceramic-tint",
    name: "Ceramic Window Tint",
    tagline: "The market-leading finish — heat rejection that dyed film can't match",
    description:
      "Ceramic tint uses nano-ceramic particles instead of dye, rejecting significantly more heat and infrared radiation while staying crystal clear and non-reflective. It's the film we fit on our own cars, made from premium material that simply outperforms the standard tint sold by most competitors — which is why it's the only tint we back with a lifetime warranty.",
    features: [
      "Rejects up to 99% of infrared heat",
      "Blocks up to 99.9% of harmful UV rays",
      "Won't fade, bubble, purple or interfere with signal",
      "Lifetime warranty — the only tint we cover for life",
    ],
    fromPrice: "£180",
    badge: "10% off + Lifetime Warranty",
  },
  {
    slug: "chameleon-tint",
    name: "Chameleon Tint",
    tagline: "Colour-shifting tint in blue or red",
    description:
      "Chameleon tint is our head-turning specialist film that shifts colour as the light changes across it. Available in blue and red, it's the finish for owners who want their windows to be as much a feature as the paintwork.",
    features: [
      "One flat price for any standard car, in blue or red",
      "Eye-catching, showroom-grade finish",
      "UV and glare protection built in",
      "Hand-fitted for a flawless edge-to-edge finish",
    ],
    fromPrice: "£150",
    priceNote: "Any car — excluding performance cars, which are quoted individually",
  },
  {
    slug: "dechroming",
    name: "Dechroming (Chrome Delete)",
    tagline: "Blacked-out trim for a stealth, executive look",
    description:
      "We wrap or vinyl your factory chrome trim — window surrounds, grilles and badges — in a satin or gloss black finish, giving your car a cleaner, more aggressive look that pairs perfectly with a fresh tint.",
    features: [
      "Removes factory chrome without permanent damage",
      "Satin or gloss black finish available",
      "Fully reversible — chrome trim protected underneath",
      "Often booked alongside a tint for a full transformation",
    ],
    fromPrice: "£150",
  },
];

export type RepairService = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  fromPrice: string;
  priceLabel?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export const repairServices: RepairService[] = [
  {
    slug: "brakes",
    name: "Brakes",
    tagline: "Pads, discs & full brake servicing",
    description:
      "Spongy pedal, squealing or grinding? Our technicians inspect, repair and replace brake pads and discs so you can stop with total confidence — all work carried out with quality parts and checked before your car leaves us.",
    features: [
      "Free brake inspection with every quote",
      "Pads, discs and full brake system work",
      "Quality parts, fitted and checked properly",
      "Straightforward, upfront pricing",
    ],
    fromPrice: "£150",
  },
  {
    slug: "oil-change-minor-service",
    name: "Minor Service — Oil Change",
    tagline: "Engine oil & oil filter",
    description:
      "Our minor service covers exactly what your engine needs to stay protected between full services: a fresh oil fill using the correct grade for your vehicle, plus a new oil filter.",
    features: [
      "Engine oil (correct grade for your vehicle)",
      "New oil filter",
      "Fluid level check",
      "Fixed price, no surprises",
    ],
    fromPrice: "£150",
  },
  {
    slug: "oil-change-major-service",
    name: "Major Service — Full Service",
    tagline: "All filters plus a full oil change",
    description:
      "Our major service goes further than the oil change alone — every filter on the car is inspected and replaced alongside a full oil service, keeping your engine, air intake and cabin running as they should.",
    features: [
      "Engine oil & oil filter",
      "Air filter, fuel filter & cabin (pollen) filter",
      "Full multi-point vehicle check",
      "Fixed price, no surprises",
    ],
    fromPrice: "£249",
  },
  {
    slug: "polishing",
    name: "Polishing",
    tagline: "Stage 1, 2 & 3 machine polishing",
    description:
      "Every car's paint is different, so polishing is split into three stages depending on how much correction it needs — from a light refresh to serious swirl and scratch removal. We'll recommend the right stage after seeing the car, and confirm the exact price before starting.",
    features: [
      "Stage 1 (Minor) — a light refresh for paint in good condition, from £200",
      "Stage 2 (Medium) — corrects moderate swirls & scratches, from £400",
      "Stage 3 (Heavy) — full correction for neglected or heavily marked paint, from £600",
      "Exact price confirmed after inspection",
    ],
    fromPrice: "£200",
  },
  {
    slug: "ceramic-detailing",
    name: "Ceramic Detailing",
    tagline: "Long-term paint protection with a showroom finish",
    description:
      "A ceramic coating bonds to your paintwork to give lasting gloss, hydrophobic water-beading and protection against everyday dirt, UV and light scratching — priced individually based on your car's size and paint condition.",
    features: [
      "Deep, long-lasting gloss finish",
      "Hydrophobic — dirt and water bead straight off",
      "Added protection against UV fade & light scratches",
      "Best paired with a Stage 2 polish — see our bundle below",
    ],
    fromPrice: "Contact Us",
    priceLabel: "",
  },
  {
    slug: "number-plates",
    name: "Number Plates",
    tagline: "Standard, 3D, 4D & 5D — gel or standard, in any shape",
    description:
      "From standard printed plates through to raised 3D, 4D and 5D gel plates, in short, hexagon or normal shapes — see the full range and how they compare.",
    features: [
      "Standard printed plates",
      "3D & 3D Gel plates",
      "4D & 4D Gel plates",
      "5D & 5D Gel plates",
      "Short, hexagon & normal plate shapes",
    ],
    fromPrice: "",
    ctaLabel: "View Options →",
    ctaHref: "/number-plates",
  },
];

export type PolishStage = {
  stage: string;
  name: string;
  description: string;
  fromPrice: string;
};

export const polishStages: PolishStage[] = [
  {
    stage: "Stage 1",
    name: "Minor Polish",
    description:
      "A light machine polish for paint that's already in decent condition — removes light swirls and restores gloss without heavy correction.",
    fromPrice: "£200",
  },
  {
    stage: "Stage 2",
    name: "Medium Polish",
    description:
      "Our most popular stage — corrects moderate swirl marks, light scratches and dullness for a noticeably sharper, deeper finish.",
    fromPrice: "£400",
  },
  {
    stage: "Stage 3",
    name: "Heavy Correction",
    description:
      "For paint that's been neglected or heavily marked — a full multi-step correction to remove deeper scratches and restore the paint properly.",
    fromPrice: "£600",
  },
];

export const detailingBundle = {
  name: "Ceramic Detailing + Stage 2 Polish",
  description:
    "Our most popular package — a Stage 2 machine polish to correct and sharpen your paintwork, finished with a full ceramic coating for lasting protection and gloss.",
  price: "£400",
};

export type NumberPlateFinish = {
  id: string;
  name: string;
  description: string;
};

export const numberPlateFinishes: NumberPlateFinish[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Flat, printed digits — road legal and the most affordable option.",
  },
  {
    id: "3d",
    name: "3D",
    description: "Raised, resin-built digits that stand proud of the plate for a sharper look.",
  },
  {
    id: "3d-gel",
    name: "3D Gel",
    description: "3D digits finished with a domed gel overlay for extra depth and shine.",
  },
  {
    id: "4d",
    name: "4D",
    description: "Laser-cut acrylic digits, taller and glossier than 3D for a premium look.",
  },
  {
    id: "4d-gel",
    name: "4D Gel",
    description: "4D acrylic digits with a gel-domed finish for maximum depth and gloss.",
  },
  {
    id: "5d",
    name: "5D",
    description: "Our top-tier finish — thicker, glossier acrylic digits with crisp, precise edges.",
  },
  {
    id: "5d-gel",
    name: "5D Gel",
    description: "5D digits finished with a gel dome — the deepest, glossiest finish we offer.",
  },
];

export const numberPlateShapes = [
  { name: "Normal", description: "Standard rectangular plate shape." },
  { name: "Short", description: "Compact plate for cars with a smaller plate recess." },
  { name: "Hexagon", description: "Angled hexagon-cut corners for a sportier look." },
];

// Ad-tracking IDs for the London PPC landing page. Leave empty to disable —
// each tracking component renders nothing until its ID is filled in.
export const trackingConfig = {
  googleAdsConversionId: "AW-17885565913",
  // The form conversion is detected by Google itself from the /thank-you page
  // load, so it needs no label here — filling one in would double-count it.
  googleAdsConversionLabel: "",
  googleAdsCallConversionLabel: "UaiYCPzwj-4cENmnwNBC", // "Click to call"
  ga4MeasurementId: "", // e.g. "G-XXXXXXXXXX"
  metaPixelId: "", // e.g. "1234567890123456"
};
