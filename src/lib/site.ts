// Everything about the business in one place. Change these and the whole
// site updates. Anything marked TODO still needs the real details.
export const site = {
  name: "PlatedUp",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://platedup.co.uk",
  description:
    "Design and order fully road-legal 2D, 3D gel and 4D number plates. Premium materials, free tracked delivery from £100 and 100% DVLA compliant.",
  // TODO: real contact details
  email: "info@platedup.co.uk",
  // WhatsApp number in international format without the + (447…).
  whatsapp: "447539559947",
  // Workshop address (shown publicly; not a home address).
  address: "PlatedUp, Barking IG11 9XY",
  // Printed on every plate alongside the business name (a legal requirement).
  postcode: "IG11 9XY",
  companyNumber: "",
  // When someone replies on WhatsApp. The shop itself takes orders 24/7.
  hours: "Mon–Fri 9am–6pm, Sat 10am–2pm",
  dispatchCutoff: "2pm",
  instagram: "https://www.instagram.com/platedupltd",
  instagramHandle: "@platedupltd",
} as const;

export const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Hi PlatedUp, I'm a customer and I need some help",
)}`;

export const nav = [
  { href: "/design", label: "Plate Builder" },
  { href: "/2d-printed-plates", label: "2D Printed Plates" },
  { href: "/3d-gel-plates", label: "3D Gel Plates" },
  { href: "/4d-plates", label: "4D Plates" },
  { href: "/faqs", label: "FAQs" },
  { href: "/blog", label: "Blog" },
  { href: "/trade", label: "Trade" },
  { href: "/about", label: "About Us" },
  { href: "/legal", label: "Legal & Compliance" },
  { href: "/contact", label: "Contact Us" },
] as const;

export const policyLinks = [
  { href: "/legal", label: "DVLA Compliance" },
  { href: "/delivery", label: "Delivery Policy" },
  { href: "/returns-policy", label: "Returns Policy" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
] as const;

// A "next" address to return to after logging in, only if it's a page on
// this site ("/checkout"). Blocks tricks like "//evil.com" or "/\evil.com".
export function safeNext(next: unknown) {
  return typeof next === "string" && /^\/(?![\/\\])[^\\\s]*$/.test(next) ? next : "";
}

// The offer in the gold bar at the top of every page. Set to null to hide it.
// The code itself is managed in Admin → Discount codes.
export const announcement: { text: string; code: string } | null = {
  text: "10% OFF your first order",
  code: "WELCOME10",
};

// Advert and analytics tags. These IDs are public (they show in every page),
// so they live here rather than in the Hostinger settings. Leave one empty
// to switch that tag off. Nothing loads until a visitor accepts cookies.
export const tracking = {
  // Meta (Facebook/Instagram) Pixel ID: Events Manager → Data sources, 15–16 digits.
  metaPixelId: "1088838000391366",
  // Google Analytics 4 measurement ID, e.g. "G-ABC123XYZ".
  googleAnalyticsId: "G-4K6ZCCYTQ9",
  // Google Ads: conversion ID ("AW-123456789") and the label of the purchase conversion.
  googleAdsId: "",
  googleAdsPurchaseLabel: "",
};
