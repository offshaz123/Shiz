/**
 * The published rate card.
 *
 * The figures here are the charges the business has set. The wording around
 * them is ours — a competitor's prices are facts and can be matched, their
 * copy is theirs and is not reproduced.
 *
 * Two rules this file exists to keep:
 *
 *  - Nothing says "TBA" on a customer-facing page. Where a charge is quoted
 *    case by case it says so in words, because a price list with a blank in
 *    it is worse than one that admits the number depends.
 *  - Every figure is exclusive of VAT and subject to the account agreement.
 *    Those two notes are not decoration; they are the difference between a
 *    rate card and a promise nobody checked.
 */

export type PlanRow = { label: string; values: [string, string, string] };
export type PlanGroup = { title: string; rows: PlanRow[] };

export const tiers = ["Bronze", "Gold", "Platinum"] as const;

export const tierSummary = [
  { name: "Bronze", monthly: "£49", forWho: "Getting started", fx: "1.00%", faster: "£0.99" },
  { name: "Gold", monthly: "£99", forWho: "Growing volume", fx: "0.75%", faster: "£0.79" },
  { name: "Platinum", monthly: "£199", forWho: "Higher volume", fx: "Quoted", faster: "£0.49" },
] as const;

/**
 * The same three tiers as numbers, for the chooser.
 *
 * `fxMargin` is null on Platinum because that margin is quoted against your
 * actual profile rather than published. The chooser says so rather than
 * guessing: a comparison that invents the figure it is comparing is worse
 * than one that admits the gap.
 */
export const tierMath = [
  { name: "Bronze", monthly: 49, fxMargin: 0.01, fasterOut: 0.99, swiftOut: 50 },
  { name: "Gold", monthly: 99, fxMargin: 0.0075, fasterOut: 0.79, swiftOut: 35 },
  { name: "Platinum", monthly: 199, fxMargin: null, fasterOut: 0.49, swiftOut: 25 },
] as const;

/** What each tier is for, and the four figures that decide it. */
export const plans = [
  {
    name: "Bronze",
    monthly: "£49",
    featured: false,
    forWho: "A business opening its first account with us",
    blurb:
      "Everything the account does, at the entry charge. Most people start here and move up when the volume says to.",
    highlights: [
      { label: "Margin on conversion", value: "1.00%" },
      { label: "Faster Payment, in or out", value: "£0.99" },
      { label: "SWIFT payment out", value: "£50" },
      { label: "CHAPS, in or out", value: "£25" },
    ],
  },
  {
    name: "Gold",
    monthly: "£99",
    featured: true,
    forWho: "Converting six figures a month, paying suppliers weekly",
    blurb:
      "Where most importers end up. The extra £50 a month pays for itself at about £20,000 converted.",
    highlights: [
      { label: "Margin on conversion", value: "0.75%" },
      { label: "Faster Payment, in or out", value: "£0.79" },
      { label: "SWIFT payment out", value: "£35" },
      { label: "CHAPS, in or out", value: "£22" },
    ],
  },
  {
    name: "Platinum",
    monthly: "£199",
    featured: false,
    forWho: "High volume, where the margin is worth negotiating",
    blurb:
      "The lowest published payment charges. The conversion margin stops being a list price and gets quoted against your actual flow.",
    highlights: [
      { label: "Margin on conversion", value: "Quoted" },
      { label: "Faster Payment, in or out", value: "£0.49" },
      { label: "SWIFT payment out", value: "£25" },
      { label: "CHAPS, in or out", value: "£20" },
    ],
  },
] as const;

/** Businesses: GBP banking, international payments and conversion. */
export const businessGroups: PlanGroup[] = [
  {
    title: "The account",
    rows: [
      { label: "Monthly account fee", values: ["£49", "£99", "£199"] },
      { label: "Account opening", values: ["No charge", "No charge", "No charge"] },
      {
        label: "Margin on currency conversion",
        values: ["1.00%", "0.75%", "Quoted before you commit"],
      },
    ],
  },
  {
    title: "UK payments",
    rows: [
      { label: "Faster Payments in", values: ["£0.99", "£0.79", "£0.49"] },
      { label: "Faster Payments out", values: ["£0.99", "£0.79", "£0.49"] },
      { label: "Between two accounts on the platform", values: ["Free", "Free", "Free"] },
      { label: "Bacs", values: ["£0.50", "£0.50", "£0.50"] },
      { label: "CHAPS in", values: ["£25", "£22", "£20"] },
      { label: "CHAPS out", values: ["£25", "£22", "£20"] },
    ],
  },
  {
    title: "International payments",
    rows: [
      { label: "GBP cross-border in", values: ["£25", "£25", "£25"] },
      { label: "GBP cross-border out", values: ["£25", "£25", "£25"] },
      { label: "SWIFT payment out", values: ["£50", "£35", "£25"] },
    ],
  },
  {
    title: "When a payment has to be chased",
    rows: [
      { label: "CHAPS investigation", values: ["£35", "£35", "£35"] },
      { label: "SWIFT investigation", values: ["£50", "£50", "£50"] },
    ],
  },
];

/** Payroll bureaux: the same rails, priced per payout. */
export const payrollGroups: PlanGroup[] = [
  {
    title: "Paying people",
    rows: [
      { label: "Faster Payments in", values: ["£0.99", "£0.79", "£0.49"] },
      { label: "Faster Payments out, per person paid", values: ["£0.99", "£0.79", "£0.49"] },
      { label: "Between two accounts on the platform", values: ["Free", "Free", "Free"] },
      { label: "Bacs", values: ["£0.50", "£0.50", "£0.50"] },
      { label: "CHAPS in or out", values: ["£25", "£22", "£20"] },
    ],
  },
  {
    title: "International payments",
    rows: [
      { label: "GBP cross-border in or out", values: ["£25", "£25", "£25"] },
      { label: "SWIFT payment out", values: ["£50", "£35", "£25"] },
    ],
  },
  {
    title: "When a payment has to be chased",
    rows: [
      { label: "CHAPS investigation", values: ["£35", "£35", "£35"] },
      { label: "SWIFT investigation", values: ["£50", "£50", "£50"] },
    ],
  },
];

/** Freelancers and small IT firms: no monthly fee, charged per payment. */
export const freelanceRows = [
  { label: "Account opening", value: "No charge", note: "Nothing to pay to open an eligible account." },
  { label: "Monthly fee", value: "No charge", note: "No subscription. You pay when money moves." },
  { label: "Money in", value: "1%", note: "On eligible incoming payments." },
  { label: "Money out", value: "1%", note: "On eligible outgoing payments." },
  { label: "SWIFT payment out", value: "£50", note: "To a supported international bank account." },
  {
    label: "Currency conversion",
    value: "Quoted",
    note: "The rate and the margin are both shown before you confirm.",
  },
] as const;

export const pricingNotes = [
  {
    title: "VAT",
    body: "Every figure on this page is exclusive of VAT. Where VAT applies it is added at the prevailing rate.",
  },
  {
    title: "Moving between tiers",
    body: "You can move up or down as your volume changes. A move up takes effect straight away and the new charges apply from your next payment.",
  },
  {
    title: "Conversion",
    body: "There is no separate fee for converting. The margin is in the rate, and you are shown the rate before you commit — not after.",
  },
  {
    title: "Other banks' charges",
    body: "Correspondent, intermediary and beneficiary-bank charges can apply to international payments. They are not ours and we do not mark them up.",
  },
  {
    title: "When a payment goes wrong",
    body: "An investigation charge applies only where a payment needs manual work to trace or correct — not as a matter of course.",
  },
  {
    title: "Higher volume",
    body: "Above the Platinum tier the pricing is built around your payment profile rather than taken from this page. Send us a month of real activity.",
  },
  {
    title: "What this page is",
    body: "A rate card, not a quote. What you actually pay depends on onboarding, the corridors you use and the configuration your account is approved for, and is set out in your account agreement.",
  },
] as const;

/**
 * The separate rate card for payment institutions and money service
 * businesses.
 *
 * It is not a fourth tier and must not be presented as one. The tiers above
 * are for a trading business running its own money through an account. This
 * is for a regulated firm that needs an operating account for its own costs,
 * where the onboarding work is heavier and the charge reflects it.
 *
 * `excludes` is the most important field on this page. An API or SPI reading
 * a page about business accounts assumes safeguarding, because that is the
 * account they spend their life trying to open. Saying no here, in the same
 * breath as the price, saves them a conversation and saves us an enquiry we
 * cannot fulfil.
 */
export const msbPricing = {
  rows: [
    { label: "Onboarding", value: "£499", note: "One-off, on account opening" },
    { label: "Monthly", value: "£299", note: "Flat, whatever the volume" },
    { label: "Each payment", value: "£0.99", note: "In or out, same charge" },
    { label: "Conversion", value: "from 0.65%", note: "Margin falls with volume" },
  ],
  includes: [
    "A GBP account in the firm's own registered name, not a pooled one",
    "Multi-currency: hold, convert and pay out from the same account",
    "For the firm's own operating costs — payroll, suppliers, rent, software, VAT",
  ],
  excludes: [
    "It cannot be used as a pooled or client account",
    "It cannot receive funds belonging to your customers",
    "It is not a safeguarding account and cannot be used to meet a safeguarding requirement",
  ],
} as const;
