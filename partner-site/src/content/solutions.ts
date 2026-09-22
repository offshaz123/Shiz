export type Solution = {
  slug: string;
  /** Name from the house icon set. */
  icon: string;
  /** Short label for the nav and cards. */
  name: string;
  /** The one-line description used in the menu, as our provider phrases it. */
  tagline: string;
  title: string;
  description: string;
  intro: string;
  /** What the customer can actually do. */
  capabilities: string[];
  /** Who this line is for, in prose. */
  audience: string;
  /** Headline facts for the stat row. No invented numbers. */
  stats: { label: string; value: string; note: string }[];
  /** The journey a payment takes on this line. */
  flow: string[];
  /** Named audiences, shown as cards. */
  audiences: { name: string; body: string }[];
  keywords: string[];
};

export const solutions: Solution[] = [
  {
    slug: "business-payments",
    icon: "route",
    name: "Business payments",
    tagline: "Cross-border payments built to scale",
    title: "Business payments for UK companies trading abroad",
    description:
      "Collect from customers, convert, and pay suppliers and beneficiaries overseas — through one account, on a UK-regulated licence.",
    intro:
      "Money in from your customers, currency converted at a rate you are quoted before you commit, money out to suppliers abroad. Most businesses run those three steps across three providers, and lose time and margin at every handover. This is the three in one place.",
    capabilities: [
      "Receive payments from your customers and counterparties in supported currencies.",
      "Convert between currencies through integrated real-time FX.",
      "Pay suppliers, contractors and beneficiaries overseas.",
      "Settle supplier invoices the same day where the corridor and cut-off allow it.",
    ],
    audience:
      "Importers, wholesalers and distributors buying abroad and selling in the UK — and any business paying counterparties in another currency.",
    stats: [
      { label: "Accounts", value: "One IBAN", note: "in your own company name" },
      { label: "Currencies", value: "Real-time FX", note: "across supported currencies" },
      { label: "Payments", value: "Domestic + international", note: "payment capabilities" },
      { label: "Licence", value: "UK-regulated", note: "provided through our partner" },
    ],
    flow: ["Receive", "FX", "Pay"],
    audiences: [
      { name: "Importers & wholesalers", body: "Buy abroad, sell in the UK, pay suppliers in their currency." },
      { name: "Exporters", body: "Get paid by overseas customers without losing it to conversion." },
      { name: "Distributors", body: "Collect from a long tail of UK retailers into one account." },
    ],
    keywords: [
      "business payments UK",
      "cross-border business payments",
      "pay overseas suppliers",
      "supplier settlement",
    ],
  },
  {
    slug: "multi-currency-accounts",
    icon: "wallet",
    name: "Multi-currency accounts",
    tagline: "Foreign currencies alongside GBP on one IBAN",
    title: "Multi-currency business accounts",
    description:
      "Hold, receive and convert multiple currencies alongside sterling on a single account in your own company name.",
    intro:
      "One account, in your company's own name, holding balances in the currencies you actually trade in. Your retailers pay in, your balances sit where you need them, and conversion happens when the rate suits you rather than when a payment forces it.",
    capabilities: [
      "Hold balances in supported currencies alongside GBP on one IBAN.",
      "Receive from customers and platforms in the currency they pay in.",
      "Convert between held currencies through integrated real-time FX.",
      "Pay out from the currency balance you are holding, without a round trip through sterling.",
    ],
    audience:
      "Businesses invoicing or being paid in more than one currency — importers, exporters, online sellers and anyone with overseas customers.",
    stats: [
      { label: "Accounts", value: "12 currencies", note: "on one IBAN" },
      { label: "Currencies", value: "Real-time FX", note: "across supported currencies" },
      { label: "Balances", value: "Hold & convert", note: "when the rate suits you" },
      { label: "Name", value: "Your company", note: "named account, not shared" },
    ],
    flow: ["Receive", "Hold", "Convert", "Pay"],
    audiences: [
      { name: "Businesses trading across markets", body: "Receive, convert and pay across supported currencies." },
      { name: "Online sellers", body: "Take payment in the currency your marketplace settles in." },
      { name: "Freelancers & contractors", body: "Receive international income and hold the balance." },
    ],
    keywords: [
      "multi-currency business account UK",
      "foreign currency account",
      "multi currency IBAN",
    ],
  },
  {
    slug: "global-payroll",
    icon: "team",
    name: "Global payroll",
    tagline: "Pay distributed teams across borders",
    title: "Global payroll and volume payouts",
    description:
      "Run pay runs across borders and at volume — distributed teams, contractors, agents and large domestic rosters.",
    intro:
      "Payroll is the least forgiving payment there is. It has to clear on the day it is supposed to, in the currency the person is paid in, every time — because the alternative is someone who does not turn up. This is built for that, at volume.",
    capabilities: [
      "Pay distributed teams and contractors in their own currency.",
      "Run bulk payouts across a large roster on a fixed cycle.",
      "Collect from your contract clients into the same account the pay run leaves from.",
      "Prepare, check and release a pay run without last-minute file rejections.",
    ],
    audience:
      "Companies with staff or contractors overseas, and UK businesses running large domestic rosters — security firms, agencies and logistics operators among them.",
    stats: [
      { label: "Payouts", value: "At volume", note: "across a large roster" },
      { label: "Currencies", value: "Local currency", note: "paid where the person is" },
      { label: "Cycle", value: "Weekly or monthly", note: "on a fixed schedule" },
      { label: "Collection", value: "Same account", note: "clients pay into it" },
    ],
    flow: ["Collect", "FX", "Pay run"],
    audiences: [
      { name: "Distributed teams", body: "Pay staff and contractors abroad in their own currency." },
      { name: "Security & facilities firms", body: "Large UK rosters on weekly or fortnightly pay runs." },
      { name: "Agencies & logistics", body: "High headcount, frequent turnover, fixed pay cycles." },
    ],
    keywords: [
      "global payroll payments",
      "international contractor payments",
      "bulk payouts UK",
      "payroll payments security companies",
    ],
  },
];

export function getSolution(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}

/**
 * Availability, payout method, currency, limits and processing times are
 * corridor-specific — the standing caveat our provider puts against every
 * corridor claim, and one we should not quietly drop.
 */
export const corridorCaveat =
  "Availability, payout method, currency, transaction limits and processing times are corridor-specific.";
