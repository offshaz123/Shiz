// Everything about the business in one place. Change these and the whole
// site updates. Anything marked TODO still needs the real details.
export const site = {
  name: "PlatedUp",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://platedup.co.uk",
  description:
    "Design and order fully road-legal 2D, 3D gel and 4D number plates. Premium materials, free tracked delivery and 100% DVLA compliant.",
  // TODO: real contact details
  phone: "07000 000000",
  email: "hello@platedup.co.uk",
  // WhatsApp number in international format without the + (447…).
  whatsapp: "447000000000",
  address: "PlatedUp, Unit 1, Your Street, Your Town",
  // Printed on every plate alongside the business name (a legal requirement).
  postcode: "AB1 2CD",
  companyNumber: "",
  hours: "Mon–Fri 9am–5pm, Sat 10am–2pm",
  dispatchCutoff: "2pm",
  instagram: "https://www.instagram.com/platedup",
  instagramHandle: "@platedup",
} as const;

export const whatsappHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
  "Hi PlatedUp, I'd like to order some number plates",
)}`;

export const nav = [
  { href: "/design", label: "Plate Builder" },
  { href: "/2d-printed-plates", label: "2D Printed Plates" },
  { href: "/3d-gel-plates", label: "3D Gel Plates" },
  { href: "/4d-plates", label: "4D Plates" },
  { href: "/faqs", label: "FAQs" },
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
