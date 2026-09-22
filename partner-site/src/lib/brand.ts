/**
 * Everything brand-specific about this site lives here.
 *
 * Change a value here and it propagates to every page, the metadata, the
 * sitemap, the structured data and the enquiry emails.
 */
export const brand = {
  name: "Orvopay",
  shortName: "Orvopay",

  /**
   * CAREFUL. Two different entities can be in play and they must never be
   * conflated on a regulated website:
   *
   *  - The REGULATED entity is CoBanq Ltd, trading as Orvopay. That is what
   *    appears on the FCA register and what the customer contracts with. It is
   *    set in `provider` below and RegulatoryNote publishes it.
   *  - `legalName` here is whatever company owns this brand and takes the
   *    revenue share — likely a separate services company. It is used only for
   *    the copyright line.
   *
   * If a separate "Orvopay Ltd" is incorporated, the site must NOT imply that
   * it is the FCA-authorised firm. Leave this as the regulated entity until
   * the group structure is settled, which is the safe default.
   */
  legalName: "CoBanq Ltd",

  /**
   * Must match the live domain exactly: it drives canonical URLs, the sitemap,
   * robots.txt and the Open Graph tags.
   */
  url: "https://orvopay.com",

  description:
    "Business payment accounts in your own company name for UK importers, wholesalers and distributors. Collect from your retailers, convert at a proper rate, and pay suppliers in USD, AED, HKD and EUR the same day.",

  email: "hello@orvopay.com",
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
   * How we relate to the regulated firm.
   *
   * "trading-name" means Orvopay IS CoBanq Ltd trading under another name —
   * the customer contracts with CoBanq, and every regulated communication has
   * to say so. That is a different arrangement from the introducer model the
   * partner pack describes ("you introduce and you support"), and it changes
   * who holds the customer relationship, who employs the sales team, and how
   * the revenue share is actually documented.
   *
   * BEFORE GO-LIVE, two things must happen:
   *  1. CoBanq registers "Orvopay" as a trading name against its FCA
   *     permissions, and it appears on the Financial Services Register.
   *  2. Someone confirms the FRN and company number below in writing. They
   *     were read off CoBanq's website, not the register, which is why
   *     `verified` is still false and the site publishes cautious wording.
   */
  provider: {
    name: "CoBanq",
    relationship: "trading-name",
    regulatedEntity: "CoBanq Ltd",
    firmReferenceNumber: "508565",
    companyNumber: "04995400",
    /** CoBanq is an authorised payment institution, not an e-money institution. */
    permissions: "the Payment Services Regulations 2017",
    /** Flip to true once the FRN is confirmed AND the trading name is registered. */
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

/**
 * The multi-currency set, as our provider publishes it: 11 foreign currencies
 * alongside GBP on one IBAN.
 *
 * NOTE — the partner pack promises USD, AED and HKD, but AED and HKD are NOT on
 * this list. Priority-one customers (mobile wholesalers) pay suppliers in Dubai
 * and Hong Kong, so confirm with CoBanq whether those corridors are served
 * another way before the sales team promises them.
 */
export const currencies = [
  { code: "GBP", name: "British Pound" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "DKK", name: "Danish Krone" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "PLN", name: "Polish Zloty" },
  { code: "CZK", name: "Czech Koruna" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "RON", name: "Romanian Leu" },
] as const;

/** The three things done with the account, as our provider frames them. */
export const coreActions = [
  { name: "Receive", body: "Receive supported currencies into the account." },
  { name: "Convert", body: "Exchange supported currencies through integrated real-time FX." },
  { name: "Pay", body: "Make supported payments out from the relevant currency balance." },
] as const;

/** The trust strip under the hero, mirroring how our provider presents itself. */
export const trustPoints = [
  { label: "FCA-regulated" },
  { label: "Established 2003" },
  { label: "Named accounts, your company" },
  { label: "UK-based" },
] as const;
