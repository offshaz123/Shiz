/**
 * Everything brand-specific about this site lives here.
 *
 * The name below is a PLACEHOLDER. Step one of the partner pack is "pick and
 * register the brand name; secure the domain" — once that is done, change the
 * values in this file and nothing else. Every page, the metadata, the sitemap,
 * the structured data and the enquiry emails all read from here.
 */
export const brand = {
  /** PLACEHOLDER — replace once the name is registered at Companies House. */
  name: "Northgate Payments",
  shortName: "Northgate",
  legalName: "Northgate Payments Ltd",

  /**
   * Must match the live domain exactly: it drives canonical URLs, the sitemap,
   * robots.txt and the Open Graph tags.
   */
  url: "https://northgatepayments.co.uk",

  description:
    "Business payment accounts in your own company name for UK importers, wholesalers and distributors. Collect from your retailers, convert at a proper rate, and pay suppliers in USD, AED, HKD and EUR the same day.",

  email: "hello@northgatepayments.co.uk",
  phoneDisplay: "020 0000 0000",
  phoneE164: "+442000000000",
  /** Digits only, no plus. Leave empty to hide the WhatsApp button. */
  whatsappNumber: "",
  whatsappMessage:
    "Hi, I'd like to talk about a business account for my import business.",

  address: {
    line1: "",
    city: "London",
    postcode: "",
    country: "United Kingdom",
  },

  /** Public profiles. Leave a value empty to omit it from the footer and schema. */
  social: {
    linkedin: "",
    instagram: "",
    tiktok: "",
  },

  /**
   * The regulated firm whose permissions the accounts are provided under.
   *
   * TODO before go-live: confirm with CoBanq the exact name of the regulated
   * entity and its FCA firm reference number, and put them here. The regulatory
   * wording in the footer only renders in full once `firmReferenceNumber` is
   * set — an unverified FRN on a payments website is worse than none.
   */
  provider: {
    name: "CoBanq",
    regulatedEntity: "",
    firmReferenceNumber: "",
  },

  /**
   * Published "from" prices for the software line only. Account pricing is
   * deliberately absent from the site: it is quoted against what the customer
   * is paying today, which you can only do in a conversation.
   */
  software: {
    setupFrom: "£2,000",
    monthlyFrom: "£300",
    /** Set false to take the figures off the public page and quote privately. */
    showPricing: true,
  },
} as const;

/** Currencies quoted across the site. Keep in step with the live rate card. */
export const currencies = ["USD", "AED", "HKD", "EUR", "CNY", "GBP"] as const;
