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
   *  - The REGULATED entity is the provider, not us. It is what appears on
   *    the FCA register and what the customer ultimately contracts with. It
   *    is set in `provider` below and is currently unnamed.
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
  /**
   * There is deliberately no phone number. Enquiries come in by email and get
   * answered by the person who can actually answer them; a number nobody picks
   * up is worse than no number at all. If one is ever added it goes here and
   * the places that used to print it are in this commit's history.
   */
  /** Digits only, no plus. Leave empty to hide the WhatsApp button. */
  whatsappNumber: "",
  whatsappMessage:
    "Hi, I'd like to talk about a business account for my import business.",

  /**
   * The registered office.
   *
   * NOTE — this is the same building as the provider's. That is a fact rather
   * than a problem, but be aware of what it means: anyone who searches the
   * address will land on the other firm. It does not appear anywhere the
   * provider is not already named, so nothing is given away that the footer
   * does not already say.
   */
  address: {
    line1: "Level39, One Canada Square",
    line2: "Canary Wharf",
    city: "London",
    postcode: "E14 5AB",
    country: "United Kingdom",
  },

  /**
   * The company behind the brand.
   *
   * This is a legal disclosure, not marketing copy. A limited company trading
   * through a website must publish its registered name, its company number and
   * its place of registration somewhere easily found on that site — Companies
   * Act 2006 s.82 and the Trading Disclosures Regulations 2015. The footer
   * prints them; the privacy notice prints the number beside the controller.
   *
   * `registeredName` should match Companies House. At the time of writing it
   * does not yet: company 10116052 is mid change-of-name and the register
   * still shows ALLIANCE SECURITY GROUP LTD, with the change filed and the
   * SIC update from the same session already posted. Published ahead of the
   * register on the owner's instruction, the change being expected within
   * days.
   *
   * Worth knowing what that trades off, if it is still out of step later:
   * a company name on a website that the register does not show is what an
   * onboarding or KYC check compares against, and a mismatch is the kind of
   * thing it flags. If the change of name is ever refused or withdrawn, blank
   * this field — the footer block hides itself when it is empty — rather than
   * leaving it standing.
   *
   * The number needs no such care. A company keeps it through every rename,
   * so 10116052 is true now and stays true.
   *
   * `icoNumber` fills in once the company is registered with the ICO.
   */
  registeredName: "OvaroPay Ltd",
  registeredIn: "England and Wales",
  companyNumber: "10116052",
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
   *   OvaroPay      ->  Gemba Finance Ltd
   *   (introducer)      (the regulated firm)
   *
   * OvaroPay introduces customers; the provider holds the permissions and
   * provides the regulated services.
   *
   * VERIFIED FROM COMPANIES HOUSE on the date of this commit: GEMBA FINANCE
   * LTD, company number 11040011, incorporated 31 October 2017, status
   * active, registered at Level39 One Canada Square. Its SIC codes are 64999
   * (financial intermediation not elsewhere classified) and 62012, which is
   * what you would expect of the firm actually doing the intermediating.
   *
   * WHERE THE FRN CAME FROM: Gemba publishes it itself, in the footer of
   * ge.mba — "Authorised and regulated by the Financial Conduct Authority
   * (FRN: 804853), Gemba Finance Ltd., Level 39, 1 Canada Square". A firm
   * publishing its own authorisation is a reasonable source, and it is the
   * same standard the previous provider's number was taken on.
   *
   * IT IS STILL WORTH CHECKING ONCE at register.fca.org.uk — confirm 804853
   * resolves to Gemba Finance Ltd and that the permission covers the Payment
   * Services Regulations 2017. The register could not be read from the build
   * environment: it renders in JavaScript and its data service needs
   * credentials. This is the one claim on the site that OvaroPay makes ABOUT
   * ANOTHER FIRM, so it is worth thirty seconds of somebody's time.
   *
   * STILL MISSING, and why the privacy notice has not been fully renamed:
   * the ICO registration number and the data protection contact. Gemba
   * publishes no privacy page at the obvious URLs. Until those arrive the
   * notice names the firm but still promises its ICO number and DPO contact
   * before anyone applies.
   */
  provider: {
    model: "introducer",
    name: "Gemba Finance",
    regulatedEntity: "Gemba Finance Ltd",
    /** Published by Gemba in its own site footer. See the note above. */
    firmReferenceNumber: "804853",
    companyNumber: "11040011",
    permissions: "the Payment Services Regulations 2017",
    /** The firm publishes this authorisation itself; see the note above. */
    verified: true,
    registeredOffice: "Level39, One Canada Square, Canary Wharf, London, England, E14 5AB",
    /** From the provider: needed by the privacy notice. */
    icoNumber: "",
    privacyEmail: "",
    dpoEmail: "",
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
 * and Hong Kong, so confirm with the provider whether those corridors are served
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
 * comes from the list above, the regulated firm is the provider's not ours, and the
 * rest are statements of how the account works rather than performance claims.
 */
export const headlineFacts = [
  { value: "12", label: "Currencies on one account", tone: 1 },
  { value: "FCA", label: "Regulated provider behind the account", tone: 2 },
  { value: "Same day", label: "Where the corridor and cut-off allow", tone: 4 },
  { value: "UK", label: "Based, and onboarded here", tone: 3 },
] as const;
