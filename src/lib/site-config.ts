export const siteConfig = {
  name: "Exclusive Tints & Repairs",
  shortName: "Exclusive Tints & Repairs",
  description:
    "Premium window tinting and vehicle repairs. Standard dyed, ceramic and chameleon window tints, dechroming, brakes and oil servicing — finished to an executive standard, backed by a lifetime warranty on ceramic.",
  url: "https://exclusivetintsandrepairs.co.uk",
  email: "executivetints.ontop@gmail.com",
  phoneDisplay: "07300 303538",
  phoneE164: "+447300303538",
  whatsappNumber: "447300303538",
  whatsappMessage: "Hi Exclusive Tints & Repairs, I'd like to get a quote.",
  address: {
    line1: "Unit 4, Industrial Estate",
    line2: "",
    city: "London",
    postcode: "E1 6AN",
    country: "United Kingdom",
  },
  hours: [
    { day: "Monday - Friday", time: "9:00am - 6:00pm" },
    { day: "Saturday", time: "9:00am - 4:00pm" },
    { day: "Sunday", time: "Closed" },
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
    fromPrice: "£249",
    badge: "10% off + Lifetime Warranty",
  },
  {
    slug: "chameleon-tint",
    name: "Chameleon Tint",
    tagline: "Colour-shifting tint in blue or red",
    description:
      "Chameleon tint is our head-turning specialist film that shifts colour as the light changes across it. Available in blue and red, it's the finish for owners who want their windows to be as much a feature as the paintwork.",
    features: [
      "Available in blue or red colour-shift",
      "Eye-catching, showroom-grade finish",
      "UV and glare protection built in",
      "Hand-fitted for a flawless edge-to-edge finish",
    ],
    fromPrice: "£299",
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
    fromPrice: "£129",
  },
];

export type RepairService = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  fromPrice: string;
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
    fromPrice: "£89",
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
];
