export type ServiceItem = {
  name: string;
  description: string;
};

export type ServiceCategory = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  items: ServiceItem[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "window-tinting-wrapping",
    title: "Window Tinting & Wrapping",
    shortDescription: "Car window tinting, vehicle wrapping and dechroming, plus tints for homes, shops and commercial units.",
    description:
      "From a single car to a full commercial unit, we tint, wrap and dechrome to a premium standard using quality film and vinyl, finished clean with no bubbling or peeling.",
    items: [
      {
        name: "Car Window Tinting",
        description: "Legal, high-quality tint film fitted to any car, in a range of shades to suit your vehicle.",
      },
      {
        name: "Car Wrapping",
        description: "Full and partial vehicle wraps in gloss, matte or colour-change finishes to transform your car's look.",
      },
      {
        name: "Dechroming",
        description: "Gloss or satin black-out of chrome trim, badges and window surrounds for a stealth finish.",
      },
      {
        name: "Home, Commercial & Shop Tinting",
        description: "Privacy and solar control window film fitted to homes, shopfronts and commercial premises.",
      },
    ],
  },
  {
    slug: "car-servicing",
    title: "Car Servicing",
    shortDescription: "Major and minor services, plus brake pad and disc replacement.",
    description:
      "Keep your car running safely and reliably with a full service carried out to manufacturer standards, or a minor service and brake job to keep on top of routine maintenance.",
    items: [
      {
        name: "Major Service",
        description: "A comprehensive service covering all key components, fluids and filters.",
      },
      {
        name: "Minor Service",
        description: "Routine maintenance covering oil, filters and a full safety check.",
      },
      {
        name: "Brake Pads & Discs",
        description: "Supply and fit of brake pads and discs, front or rear, for safe stopping power.",
      },
    ],
  },
  {
    slug: "number-plates",
    title: "Number Plates",
    shortDescription: "3D, 4D and gel number plates made to order, road-legal and DVLA compliant.",
    description:
      "Custom number plates made while you wait, in a choice of raised acrylic 3D, laser-cut 4D, or premium gel finishes — all fully road-legal.",
    items: [
      {
        name: "3D Plates",
        description: "Raised acrylic gel digits for a subtle, tactile finish.",
      },
      {
        name: "4D Plates",
        description: "Laser-cut acrylic digits with a sharp, layered 3D effect.",
      },
      {
        name: "Gel Plates",
        description: "Smooth, glossy gel-resin digits for a clean, modern look.",
      },
    ],
  },
  {
    slug: "alloy-refurbishment",
    title: "Alloy Refurbishment",
    shortDescription: "Alloy wheel refurb and respray, plus brake caliper respray.",
    description:
      "Bring tired, kerbed or corroded alloys back to a factory finish, and add a splash of colour with a caliper respray in the shade of your choice.",
    items: [
      {
        name: "Alloy Wheel Refurbishment",
        description: "Diamond cut, painted or powder-coated refurb to repair kerb damage, corrosion and scuffs.",
      },
      {
        name: "Caliper Respray",
        description: "Brake caliper respray in any colour for a sharp finishing touch.",
      },
    ],
  },
];

export function findServiceCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}
