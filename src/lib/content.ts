import { site } from "./site";
import type { StyleId } from "./plates";

export const promos = [
  "FREE tracked delivery on every order",
  `Same-day dispatch when you order before ${site.dispatchCutoff}`,
  "100% road legal · BS AU 145e",
  "DVLA registered number plate supplier",
  "3D gel & 4D plates made to order",
];

export const products: {
  slug: string;
  styles: StyleId[];
  title: string;
  heading: string;
  intro: string;
  points: string[];
}[] = [
  {
    slug: "2d-printed-plates",
    styles: ["standard"],
    title: "2D Printed Number Plates",
    heading: "2D Printed Plates",
    intro:
      "The classic UK number plate. Crisp black print on a tough acrylic plate, made to the latest British Standard and ready to fit.",
    points: [
      "Road legal and MOT compliant",
      "Made to BS AU 145e on high-impact acrylic",
      "Legal Charles Wright font and spacing",
      "Optional flag badge, EV green flash and border",
      "Great value for a straight replacement",
    ],
  },
  {
    slug: "3d-gel-plates",
    styles: ["3d-gel", "5mm-gel", "7mm-gel"],
    title: "3D Gel Number Plates",
    heading: "3D Gel Plates",
    intro:
      "Raised, domed gel characters with a glossy finish that catches the light. Choose classic 3D Gel, or go deeper with 5mm and 7mm gel.",
    points: [
      "Raised resin-gel characters with a glossy finish",
      "Fully road legal with solid black characters",
      "Made to BS AU 145e",
      "Optional flag badge, EV green flash and border",
      "Available in 3D, 5mm and 7mm depths",
    ],
  },
  {
    slug: "4d-plates",
    styles: ["4d-3mm", "4d-5mm"],
    title: "4D Number Plates",
    heading: "4D Plates",
    intro:
      "Laser-cut solid acrylic letters bonded to the plate for a bold, sharp-edged 3D look. Available in 3mm and 5mm.",
    points: [
      "3mm or 5mm laser-cut acrylic characters with crisp, sharp edges",
      "Fully road legal with solid black characters",
      "Made to BS AU 145e",
      "Optional flag badge, EV green flash and border",
      "Built to last, won't fade or peel",
    ],
  },
];

export const faqs: { q: string; a: string }[] = [
  {
    q: "Are your number plates road legal?",
    a: "Yes. Every plate we make meets British Standard BS AU 145e, uses the legal Charles Wright font and spacing, and carries our supplier name and postcode as the law requires.",
  },
  {
    q: "What documents do I need to provide?",
    a: "Two things: proof you're entitled to the registration (V5C logbook, V5C/2 new keeper slip, V750 or V778 certificate, or a hire/lease agreement) and photo ID or proof of address in your name (driving licence, passport, utility bill or bank statement).",
  },
  {
    q: "How do I upload my documents?",
    a: "You can upload them at checkout, or afterwards on our Upload Documents page using your order number. A clear phone photo is fine.",
  },
  {
    q: "How long does delivery take?",
    a: `Orders placed before ${site.dispatchCutoff} on a working day (once we have your documents) are made and dispatched the same day. Free tracked delivery usually takes 1–2 working days, or choose Next Day Delivery at checkout.`,
  },
  {
    q: "Are 3D gel and 4D plates legal?",
    a: "Yes. Raised characters are legal as long as they're solid black with no shading or two-tone effect, which is exactly how ours are made.",
  },
  {
    q: "What is an illegal number plate?",
    a: "Anything with the wrong font, altered spacing, decorative screws that change how characters look, coloured or two-tone characters, or missing British Standard and supplier markings. You can be fined up to £1,000 and your car can fail its MOT.",
  },
  {
    q: "Can I buy show plates?",
    a: "Yes. Choose Show Plate in the plate builder. Show plates are for display and off-road use only (car shows, private land, photos). They are not road legal, so you can't fit them to a car used on the road. No documents are needed for show plates.",
  },
  {
    q: "What size plates do you offer?",
    a: "We make standard UK car plates (520 × 111mm), which fit the vast majority of cars.",
  },
  {
    q: "Do the plates come with fittings?",
    a: "You can add sticky pads, a screws kit with matching caps, or both in the plate builder.",
  },
  {
    q: "Can you remove the branding from the plate?",
    a: "No. By law every plate must show the supplier's name and postcode, and the British Standard mark.",
  },
  {
    q: "Will the plates pass an MOT?",
    a: "Yes. Our plates meet the standards MOT testers check for.",
  },
  {
    q: "Can you space my registration differently?",
    a: "No. Changing the spacing is illegal, so we always use the legal spacing for your registration.",
  },
  {
    q: "Do you offer returns?",
    a: "Plates are made to order with your registration, so we can't take them back if you change your mind. If anything arrives damaged or we've made a mistake, we'll replace it free. See our Returns Policy.",
  },
  {
    q: "How long do the plates last?",
    a: "Our plates are made from high-impact acrylic and tested to resist weather, UV and impact, so they should last for years.",
  },
];
