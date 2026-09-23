/**
 * Everything brand-specific about this site lives here.
 *
 * Change a value here and it propagates to every page, the metadata, the
 * sitemap, the structured data and the enquiry emails.
 */
export const brand = {
  name: "OvaroPay",
  shortName: "OvaroPay",

  /**
   * CAREFUL. Two different entities can be in play and they must never be
   * conflated on a regulated website:
   *
   *  - The REGULATED entity is CoBanq Ltd, trading as OvaroPay. That is what
   *    appears on the FCA register and what the customer contracts with. It is
   *    set in `provider` below and RegulatoryNote publishes it.
   *  - `legalName` is what goes in the copyright line. It is the brand,
   *    because the brand is what owns this website — the regulated firm is
   *    named in the disclosure sentence directly above it, which is where
   *    that obligation actually sits.
   *
   * Once the operating company is incorporated, put its registered name here
   * ("OvaroPay Ltd", or whatever it ends up being). It must NOT imply that it
   * is the FCA-authorised firm; the disclosure line keeps those apart.
   */
  legalName: "OvaroPay",

  /**
   * Must match the live domain exactly: it drives canonical URLs, the sitemap,
   * robots.txt and the Open Graph tags.
   */
  url: "https://ovaropay.com",

  description:
    "Business payment accounts in your own company name for UK importers, wholesalers and distributors. Collect from your retailers, convert at a proper rate, and pay suppliers in USD, AED, HKD and EUR the same day.",

  email: "info@ovaropay.com",
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

  /**
   * The company behind the brand, for the privacy notice and the footer.
   *
   * Both are empty until the operating company is incorporated and registered
   * with the ICO. Every line that would print them is written to read
   * correctly without them, so leaving them empty is safe — but fill them in
   * as soon as you have them, because a privacy notice that cannot name its
   * controller is one the ICO will ask about.
   */
  companyNumber: "",
  icoNumber: "",

  /** Public profiles. Leave a value empty to omit it from the footer and schema. */
  social: {
    linkedin: "",
    instagram: "",
    tiktok: "",
  },

  /**
   * Who provides the regulated payment services, and what we are to them.
   *
   *   OvaroPay  ->  CoBanq Ltd
   *   (introducer)  (Authorised Payment Institution, FRN 508565)
   *
   * OvaroPay introduces customers; CoBanq provides the regulated services and
   * holds the permissions.
   *
   * Consequence of the introducer model: OvaroPay is NOT itself regulated and
   * must never imply otherwise — no "FCA-regulated" badge on our own name, and
   * no borrowing CoBanq's founding date as if it were ours.
   *
   * `verified` gates whether we name CoBanq and its FRN in public. It is true:
   * CoBanq publishes both numbers itself on cobanq.com/about ("Our FCA
   * Registration Number is 508565, and our Company Registration Number is
   * 04995400"), and we are naming them on instruction.
   *
   * Still worth doing once: check 508565 at register.fca.org.uk and keep a
   * dated screenshot of the entry. If the register ever disagrees with the
   * numbers below, set this back to false — that one line pulls the named
   * disclosure off every page.
   */
  provider: {
    /** "introducer" | "agent" | "trading-name" — each needs different wording. */
    model: "introducer",
    name: "CoBanq",
    regulatedEntity: "CoBanq Ltd",
    firmReferenceNumber: "508565",
    companyNumber: "04995400",
    permissions: "the Payment Services Regulations 2017",
    verified: true,

    /** Published by CoBanq on cobanq.com — used in the privacy notice. */
    registeredOffice: "Level39, One Canada Square, Canary Wharf, London, England, E14 5AB",
    icoNumber: "Z3153690",
    privacyEmail: "privacy@cobanq.com",
    dpoEmail: "dpo@cobanq.com",
  },

  /**
   * Published "from" prices for the software line only. Account pricing is
   * deliberately absent: it is quoted against what the customer pays today,
   * which you can only do in a conversation.
   */
  software: {
    setupFrom: "£2,000",
    monthlyFrom: "£480",
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
  { code: "GBP", name: "British Pound", country: "United Kingdom", iso: "GB" },
  { code: "USD", name: "US Dollar", country: "United States", iso: "US" },
  { code: "EUR", name: "Euro", country: "Eurozone", iso: "EU" },
  { code: "CAD", name: "Canadian Dollar", country: "Canada", iso: "CA" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland", iso: "CH" },
  { code: "DKK", name: "Danish Krone", country: "Denmark", iso: "DK" },
  { code: "NOK", name: "Norwegian Krone", country: "Norway", iso: "NO" },
  { code: "SEK", name: "Swedish Krona", country: "Sweden", iso: "SE" },
  { code: "PLN", name: "Polish Zloty", country: "Poland", iso: "PL" },
  { code: "CZK", name: "Czech Koruna", country: "Czechia", iso: "CZ" },
  { code: "HUF", name: "Hungarian Forint", country: "Hungary", iso: "HU" },
  { code: "RON", name: "Romanian Leu", country: "Romania", iso: "RO" },
] as const;

/**
 * Currency code -> the country whose flag stands for it.
 *
 * AED, HKD and CNY are not on our published currency list, but they are the
 * corridors customers ask about, so they resolve to a flag here too. Anything
 * with no entry renders without one rather than guessing.
 */
export const currencyFlags: Record<string, string> = {
  GBP: "GB",
  USD: "US",
  EUR: "EU",
  CAD: "CA",
  CHF: "CH",
  DKK: "DK",
  NOK: "NO",
  SEK: "SE",
  PLN: "PL",
  CZK: "CZ",
  HUF: "HU",
  RON: "RO",
  AED: "AE",
  HKD: "HK",
  CNY: "CN",
};

/** The three things done with the account, as our provider frames them. */
export const coreActions = [
  { name: "Receive", body: "Receive supported currencies into the account." },
  { name: "Convert", body: "Exchange supported currencies through integrated real-time FX." },
  { name: "Pay", body: "Make supported payments out from the relevant currency balance." },
] as const;

/**
 * The badge row under the hero. Four things that are true today — no founding
 * date we do not have, no customer count we have not earned.
 */
export const trustPoints = [
  { icon: "shield", label: "Regulated payment services", note: "Provided by an FCA-authorised firm" },
  { icon: "building", label: "Accounts in your own name", note: "Named, not shared" },
  { icon: "globe", label: "Twelve currencies", note: "On one account" },
  { icon: "handshake", label: "UK-based", note: "Onboarded by people here" },
] as const;

/**
 * The dark figures band. Every one of these is checkable: the currency count
 * comes from the list above, the firm reference number is CoBanq's, and the
 * rest are statements of how the account works rather than performance claims.
 */
export const headlineFacts = [
  { value: "12", label: "Currencies on one account", tone: 1 },
  { value: "FCA", label: "Authorised provider, No. 508565", tone: 2 },
  { value: "Same day", label: "Where the corridor and cut-off allow", tone: 4 },
  { value: "UK", label: "Based, and onboarded here", tone: 3 },
] as const;
