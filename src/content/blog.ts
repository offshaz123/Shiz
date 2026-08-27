export type BlogSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date, e.g. "2026-08-27"
  keywords: string[];
  sections: BlogSection[];
};

// Newest first. Add new posts to the top of this array.
export const blogPosts: BlogPost[] = [
  {
    slug: "3d-vs-4d-vs-5d-number-plates",
    title: "3D vs. 4D vs. 5D Number Plates: What's Actually Different?",
    description:
      "Standard, 3D, 4D and 5D plates all look similar in a photo but feel completely different in person. Here's what each finish actually gets you.",
    publishedAt: "2026-08-30",
    keywords: [
      "3D number plates",
      "4D number plates",
      "5D number plates",
      "gel number plates",
      "number plate finishes explained",
    ],
    sections: [
      {
        paragraphs: [
          "\"What's the actual difference between 3D, 4D and 5D plates?\" is one of the most common questions we get, and it's a fair one — in photos they can look almost identical. In person, the difference is obvious the moment you run a finger over the digits.",
        ],
      },
      {
        heading: "Standard plates",
        paragraphs: [
          "A standard plate has flat, printed digits — no raised texture at all. It's completely road legal and the most affordable option, and for a lot of drivers it's simply not something they think about.",
        ],
      },
      {
        heading: "3D plates",
        paragraphs: [
          "3D plates use digits built up from a resin that sits proud of the plate surface, giving a visible raised edge and a subtle shadow line. It's the first step up from standard, and the difference is noticeable without being flashy.",
          "3D Gel takes the same raised digit and adds a domed, glass-like resin layer over the top, giving extra depth and a glossier finish under light.",
        ],
      },
      {
        heading: "4D plates",
        paragraphs: [
          "4D plates are laser-cut from acrylic rather than moulded from resin, which gives cleaner edges and a glossier black finish than 3D. They sit slightly taller too, so the raised effect reads more clearly from a distance.",
          "As with 3D, a 4D Gel option adds a domed resin coating over the acrylic digits for even more shine and depth.",
        ],
      },
      {
        heading: "5D plates",
        paragraphs: [
          "5D is our top-tier finish — thicker acrylic than 4D, cut with the same laser precision, giving the crispest edges and the deepest, glossiest look of any finish we offer. 5D Gel adds the domed top layer for the most premium finish available.",
        ],
      },
      {
        heading: "Which one should you get?",
        paragraphs: [
          "If budget is the priority, standard plates do the job and are completely road legal. If you want a visible upgrade without spending a lot more, 3D is the natural first step. If you want the plates to genuinely stand out, 4D or 5D — especially with the Gel finish — is where the difference becomes obvious even to people who don't know plates.",
          "Shape matters too — we also offer short, hexagon and normal (standard rectangular) plate shapes, so you can match the plate to your car's plate recess or just to the look you're after.",
          "Send us your registration and the finish and shape you'd like, and we'll get your plates made up.",
        ],
      },
    ],
  },
  {
    slug: "ceramic-vs-standard-window-tint",
    title: "Ceramic vs. Standard Dyed Window Tint: Which One Should You Choose?",
    description:
      "Standard dyed tint is cheaper, but ceramic rejects far more heat, won't fade, and is the only film we back with a lifetime warranty. Here's how to decide.",
    publishedAt: "2026-08-27",
    keywords: [
      "ceramic vs standard tint",
      "ceramic window tint",
      "dyed window tint",
      "best car window tint UK",
    ],
    sections: [
      {
        paragraphs: [
          "It's the first question almost every customer asks us: standard or ceramic? Both will make your windows legally darker and give your car a cleaner look, but underneath that similar appearance they're genuinely different products, built from different materials, with different lifespans.",
          "Here's the honest breakdown — not the version that just tries to upsell you.",
        ],
      },
      {
        heading: "What standard dyed tint actually is",
        paragraphs: [
          "Dyed window tint works by bonding a layer of dye between the glass and an adhesive layer. That dye absorbs light rather than reflecting or scattering it, which is what darkens the glass and cuts glare.",
          "It's a well-established, reliable product, and for a lot of drivers it does exactly what they need: a smart, uniform tinted look, decent UV protection, and a lower price point than ceramic.",
        ],
      },
      {
        heading: "Where dyed tint falls short",
        paragraphs: [
          "The dye itself is the limiting factor. It absorbs heat rather than rejecting it, so a lot of that heat still ends up radiating into the cabin — you'll notice this most on a hot day with the sun directly on the glass.",
          "Dye also isn't permanently stable. Over several years of UV exposure it can fade or shift towards a purple or brown tint, which looks patchy rather than premium. That's part of why dyed film typically only carries a couple of years of warranty — the manufacturer knows it has a shelf life.",
        ],
      },
      {
        heading: "What makes ceramic different",
        paragraphs: [
          "Ceramic tint replaces the dye with microscopic, non-conductive ceramic particles embedded in the film. These particles reject infrared radiation — the part of sunlight responsible for most of the heat you feel — rather than just absorbing visible light.",
          "The result is a film that keeps a car noticeably cooler in direct sun, without needing to go any darker than a dyed equivalent. It also stays optically clear rather than looking grey or flat, and because ceramic doesn't rely on dye, it doesn't fade or discolour with age.",
        ],
        bullets: [
          "Rejects up to 99% of infrared heat, versus moderate rejection from dyed film",
          "Blocks up to 99.9% of harmful UV rays, protecting your skin and your interior",
          "Won't fade, bubble or turn purple over time",
          "Doesn't interfere with phone signal, GPS or any in-car electronics",
        ],
      },
      {
        heading: "Why we only put a lifetime warranty on ceramic",
        paragraphs: [
          "This is the part that says the most about the difference: we fit premium ceramic film that's genuinely a step above what a lot of competitors sell as \"ceramic,\" and because of that, we're confident enough to warranty it for as long as you own the car — not for one or two years, for life.",
          "We couldn't offer that on dyed film even if we wanted to, because the material itself isn't built to last that long. A lifetime warranty is only as good as what's underneath it, and that's exactly why it's exclusive to our ceramic tint.",
        ],
      },
      {
        heading: "So which one should you pick?",
        paragraphs: [
          "If budget is the main factor and you mainly want the look and basic UV protection, standard dyed tint is a solid, honest choice — that's exactly why we still offer it.",
          "If you want the best possible heat rejection, a finish that won't age, and the peace of mind of a lifetime warranty, ceramic is the clear upgrade — and right now it's also 10% off, so the price gap is smaller than you'd think.",
          "Not sure which is right for your car and budget? Send us your reg on WhatsApp and we'll give you an honest recommendation, not just the more expensive option.",
        ],
      },
    ],
  },
  {
    slug: "why-choose-ceramic-tint-over-competitors",
    title: "Why Our Ceramic Tint Beats What Most Competitors Are Selling",
    description:
      "Not all \"ceramic tint\" is equal. Here's what actually separates premium ceramic film from the budget version many shops fit under the same name.",
    publishedAt: "2026-08-24",
    keywords: [
      "best window tint shop",
      "premium ceramic tint",
      "lifetime warranty window tint",
      "window tint quality",
    ],
    sections: [
      {
        paragraphs: [
          "\"Ceramic tint\" has become a bit of a marketing term. Plenty of shops advertise it, but the quality of the actual ceramic film varies enormously — and most customers have no easy way to tell the difference until years later, when a cheap film starts underperforming or ageing badly.",
          "Here's what we look for, and why it matters.",
        ],
      },
      {
        heading: "Particle quality and density",
        paragraphs: [
          "The heat-rejecting performance of ceramic tint comes down to the quality and concentration of the ceramic nano-particles used in the film. Budget ceramic films use a lower grade and lower density of these particles to hit a price point, which means they perform closer to a standard dyed film than a true premium ceramic — while still being sold at ceramic prices.",
          "We use a premium-grade film specifically because the heat rejection numbers actually back up the claims on the box, not just the marketing.",
        ],
      },
      {
        heading: "Optical clarity",
        paragraphs: [
          "A genuine giveaway of a lower quality film is a slightly hazy or grey cast, especially noticeable at night or in low light. Premium ceramic film stays optically clear and true to colour — you shouldn't be able to tell it's there beyond the shade itself.",
        ],
      },
      {
        heading: "Adhesive and installation matter just as much as the film",
        paragraphs: [
          "Even the best film will fail early if it's cut and fitted poorly. Air bubbles, lifted edges and dust trapped under the film are almost always an installation issue, not a film issue — which is why hand-fitting and a clean workspace matter as much as the material itself.",
          "Every job we do is fitted edge-to-edge with the same care, checked before the car leaves us.",
        ],
      },
      {
        heading: "The warranty tells you everything",
        paragraphs: [
          "This is the simplest way to compare shops: ask what warranty they'll put behind their ceramic tint. A shop backing a 2 or 5 year warranty is telling you, indirectly, how long they expect the film to genuinely perform.",
          "We back our ceramic tint for life, because we've made the decision to fit material that earns that confidence rather than film that just needs to look good on day one.",
        ],
      },
    ],
  },
  {
    slug: "chameleon-tint-explained",
    title: "Chameleon Tint Explained: The Colour-Shift Trend in Blue & Red",
    description:
      "Chameleon tint is one of the most eye-catching finishes available right now. Here's how it works, and why we offer it in blue and red.",
    publishedAt: "2026-08-20",
    keywords: [
      "chameleon window tint",
      "colour shift car tint",
      "blue chameleon tint",
      "red chameleon tint",
    ],
    sections: [
      {
        paragraphs: [
          "If you've seen a car roll past with windows that seem to change colour depending on the angle you're looking from, you've seen chameleon tint. It's become one of the most requested specialist finishes we fit, and for good reason — nothing else on the market looks quite like it.",
        ],
      },
      {
        heading: "How the colour-shift effect works",
        paragraphs: [
          "Chameleon film is manufactured with multiple thin layers that reflect and transmit light differently depending on the viewing angle and the light source. That's what creates the shifting effect — the same window can look one shade when viewed straight on and a noticeably different tone from an angle, or under different lighting.",
          "It's a genuinely different category of product from standard or ceramic tint, more comparable to a specialist wrap than a conventional window film.",
        ],
      },
      {
        heading: "Blue and red — our two chameleon options",
        paragraphs: [
          "We currently stock chameleon tint in blue and red, both finished to the same executive, hand-fitted standard as the rest of our range. Blue tends to suit cooler paint tones — blacks, whites, silvers and blues — for a subtle-until-you-look-twice effect, while red gives a bolder, more dramatic finish that pairs particularly well with darker paintwork.",
          "Both still provide the UV and glare protection you'd expect from any tint we fit — the colour-shift effect is a bonus on top, not a trade-off.",
        ],
      },
      {
        heading: "Is chameleon tint right for you?",
        paragraphs: [
          "If you want your car to stand out and you're comfortable with a statement finish, chameleon tint is hard to beat. It's not the most subtle option we offer, and that's exactly the point — it's built for owners who want their car noticed.",
          "Send us a photo of your car on WhatsApp and we can talk through which colour would work best before you commit.",
        ],
      },
    ],
  },
  {
    slug: "what-is-dechroming",
    title: "What Is Dechroming, and Is It Worth Doing With Your Tint?",
    description:
      "Blacked-out trim has become one of the most popular finishing touches for a modern, executive look. Here's what dechroming actually involves.",
    publishedAt: "2026-08-17",
    keywords: [
      "dechroming",
      "chrome delete",
      "black out trim car",
      "gloss black chrome delete",
    ],
    sections: [
      {
        paragraphs: [
          "Dechroming — sometimes called a \"chrome delete\" — is the process of covering a car's factory chrome trim in black vinyl or wrap, rather than leaving it in its original bright chrome finish. It's one of the simplest changes you can make that has one of the biggest visual impacts.",
        ],
      },
      {
        heading: "What gets dechromed",
        paragraphs: [
          "Most commonly we're covering window surrounds, door handles, grille surrounds and badges — anywhere factory chrome trim breaks up an otherwise clean paint job. Satin black is the most popular finish for a subtle, factory-look result, though gloss black is available for a sharper contrast.",
        ],
      },
      {
        heading: "Why it pairs so well with a fresh tint",
        paragraphs: [
          "Chrome trim and dark tinted glass tend to fight each other visually — the bright chrome draws the eye away from the clean, blacked-out look a good tint job creates. Dechroming removes that contrast, so the whole car reads as one cohesive, executive-look finish rather than tint plus untouched trim.",
          "It's one of the most common combinations we book in, and doing both at once means one visit instead of two.",
        ],
      },
      {
        heading: "Is it permanent?",
        paragraphs: [
          "No — that's one of the advantages over a full respray. The original chrome trim is fully protected underneath the wrap, so if you ever want to return to standard (for example, before selling the car), it can be removed without any damage to the factory finish.",
        ],
      },
    ],
  },
  {
    slug: "minor-vs-major-service-explained",
    title: "Minor vs. Major Service: What's the Difference, and Which Does Your Car Need?",
    description:
      "Our minor service covers the oil and filter essentials from £150. Our major service goes further with every filter. Here's how to know which one your car is due.",
    publishedAt: "2026-08-13",
    keywords: [
      "minor service vs major service",
      "car oil change price",
      "full car service UK",
      "how often service car",
    ],
    sections: [
      {
        paragraphs: [
          "\"Does my car need a minor or a major service?\" is one of the most common questions we get on the repairs side of the business, and the honest answer is: it depends on mileage, how long it's been since the last full service, and what the manufacturer recommends for your specific car.",
          "Here's what's actually included in each, so you can make an informed call.",
        ],
      },
      {
        heading: "Minor Service — £150",
        paragraphs: [
          "Our minor service covers the two things that matter most for keeping your engine protected between full services:",
        ],
        bullets: [
          "A full engine oil change, using the correct grade of oil for your vehicle",
          "A new oil filter",
          "A basic fluid level check",
        ],
      },
      {
        heading: "Major Service — from £249",
        paragraphs: [
          "Our major service includes everything in the minor service, plus every other filter that needs replacing on a typical car:",
        ],
        bullets: [
          "Engine oil and oil filter",
          "Air filter — keeps your engine breathing properly and running efficiently",
          "Fuel filter — protects the fuel system from contamination",
          "Cabin (pollen) filter — keeps the air inside the car clean",
          "A full multi-point vehicle check",
        ],
      },
      {
        heading: "So which one do you need?",
        paragraphs: [
          "As a general rule, most manufacturers recommend an oil change (our minor service) roughly every 6,000–12,000 miles or once a year, whichever comes first, and a full service (our major service) less frequently, alternating with minor services depending on your car's specific schedule.",
          "If you're not sure what your car is due, the simplest thing to do is send us the mileage and the date of your last service — we'll tell you honestly which one it needs rather than upselling you to the major service by default.",
        ],
      },
    ],
  },
];
