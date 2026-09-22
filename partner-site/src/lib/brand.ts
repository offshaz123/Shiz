/**
 * Everything brand-specific about this site lives here.
 *
 * Change a value here and it propagates to every page, the metadata, the
 * sitemap, the structured data and the enquiry emails.
 */
export const brand = {
  name: "Navera Pay",
  shortName: "Navera",
  legalName: "Navera Pay Ltd",

  /**
   * Must match the live domain exactly: it drives canonical URLs, the sitemap,
   * robots.txt and the Open Graph tags.
   */
  url: "https://naverapay.com",

  description:
    "Business payment accounts in your own company name for UK importers, wholesalers and distributors. Collect from your retailers, convert at a proper rate, and pay suppliers in USD, AED, HKD and EUR the same day.",

  email: "hello@naverapay.com",
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
   * These figures are taken from CoBanq's own website. CONFIRM THEM WITH COBANQ
   * IN WRITING before go-live — an FCA firm reference number published on a
   * payments site has to be right, and we have not yet verified this against
   * the FCA register itself (the register requires JavaScript and could not be
   * checked automatically).
   */
  provider: {
    name: "CoBanq",
    regulatedEntity: "CoBanq Ltd",
    firmReferenceNumber: "508565",
    companyNumber: "04995400",
    /** CoBanq is an authorised payment institution, not an e-money institution. */
    permissions: "the Payment Services Regulations 2017",
    verified: false,
  },

  /**
   * Published "from" prices for the software line only. Account pricing is
   * deliberately absent: it is quoted against what the customer pays today,
   * which you can only do in a conversation.
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

/** The trust strip under the hero, mirroring how our provider presents itself. */
export const trustPoints = [
  { label: "Provided on an FCA-regulated licence" },
  { label: "Partner established 2003" },
  { label: "Named accounts, your company" },
  { label: "UK-based" },
] as const;
