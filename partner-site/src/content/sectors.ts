export type Sector = {
  slug: string;
  /** Short label for nav and cards. */
  name: string;
  /** Full plural noun used in headings and body copy. */
  longName: string;
  title: string;
  description: string;
  intro: string;
  /** What their banking looks like today. */
  problems: string[];
  /** What the account does about it. */
  answers: string[];
  currencies: string[];
  keywords: string[];
};

export const sectors: Sector[] = [
  {
    slug: "mobile-phone-wholesalers",
    name: "Mobile wholesale",
    longName: "Mobile phone wholesalers",
    title: "Business accounts for mobile phone wholesalers",
    description:
      "Accounts built for UK handset and accessory wholesalers importing from China, Hong Kong and Dubai. Collect from your retailers, convert to USD, AED or HKD, and pay suppliers the same day.",
    intro:
      "You import handsets and accessories in bulk and sell them on to UK retailers and independent shops. Money comes in constantly from a spread of buyers, and goes out in large lumps to suppliers who invoice in dollars or dirhams. It is one of the hardest trades in the country to bank properly, and one of the easiest to run once the account fits the business.",
    problems: [
      "Payments held for days while someone decides whether a supplier invoice looks right.",
      "An account closed with two months' notice and no reason given, after years of clean trading.",
      "Two to three percent lost on every conversion, buried in the rate rather than shown as a fee.",
      "Inward payments from dozens of retailers landing in a personal or third-party account because nothing else would take them.",
    ],
    answers: [
      "A named account in your own company name, so retailers pay in cleanly and suppliers see who is paying them.",
      "Conversion into USD, AED and HKD at a rate you are quoted up front, not discovered afterwards.",
      "Same-day payment out to suppliers in China, Hong Kong and the UAE.",
      "Onboarding that expects an import business, rather than declining one on sight.",
    ],
    currencies: ["USD", "AED", "HKD", "CNY"],
    keywords: [
      "business account for mobile phone wholesalers",
      "phone wholesaler banking UK",
      "pay suppliers in Hong Kong",
      "import handsets from China payments",
    ],
  },
  {
    slug: "vape-and-e-liquid-distributors",
    name: "Vape distribution",
    longName: "Vape and e-liquid distributors",
    title: "Business accounts for vape and e-liquid distributors",
    description:
      "Payment accounts for UK vape and e-liquid distributors: collect from corner shops and specialist retailers, convert, and pay overseas manufacturers.",
    intro:
      "Import in volume, distribute to corner shops and specialist retailers, pay the manufacturer overseas. It is the same shape of business as mobile wholesale, with the same banking problem — a sector that high street banks put in a box marked too much work, whatever the individual company is actually doing.",
    problems: [
      "Declined at onboarding on the category alone, before anyone has read a single invoice.",
      "Card and payment providers withdrawing at short notice as their own policies change.",
      "Supplier payments to Shenzhen or Dubai queried every time, and delayed every time.",
      "Growth outrunning the account — volumes that were fine last year now triggering reviews.",
    ],
    answers: [
      "An account opened on what your business actually does, evidenced properly at the start.",
      "Inward collection from a long tail of small retail customers without every payment being questioned.",
      "Conversion and payout in the currencies your manufacturers invoice in.",
      "Volumes agreed up front, so growth is expected rather than treated as a red flag.",
    ],
    currencies: ["USD", "AED", "CNY", "EUR"],
    keywords: [
      "vape distributor business account",
      "e-liquid wholesaler banking",
      "high risk merchant account UK vape",
    ],
  },
  {
    slug: "trade-importers",
    name: "Trade import",
    longName: "General trade importers and wholesalers",
    title: "Business accounts for UK trade importers and wholesalers",
    description:
      "For any business that buys abroad and sells here: electronics, textiles, food and drink, car parts, toys, household goods and cosmetics.",
    intro:
      "If you buy abroad and sell here, the account fits. Electronics and components, textiles and garments, food and drink, car parts, toys, household goods, cosmetics — the sector label changes, the money does not. Stock is bought in a foreign currency, sold in sterling, and the gap between the two is where a bad rate quietly eats the margin.",
    problems: [
      "An FX rate you never see quoted, only applied.",
      "Payment cut-offs that mean a supplier is paid tomorrow rather than today, and a container waits.",
      "Documentation requests that arrive after the payment has already been held.",
      "A relationship manager who has never once asked what you import.",
    ],
    answers: [
      "One account that collects in sterling, converts, and pays out — without moving money between three providers to do it.",
      "A rate quoted before you commit, so you can price a purchase order properly.",
      "The paperwork asked for at onboarding, once, instead of on every payment.",
      "Someone on the end of a phone who knows what a proforma invoice is.",
    ],
    currencies: ["USD", "EUR", "AED", "HKD", "CNY"],
    keywords: [
      "business account for importers UK",
      "wholesale import payments",
      "pay overseas suppliers from UK",
      "foreign exchange for importers",
    ],
  },
  {
    slug: "security-companies",
    name: "Security payroll",
    longName: "Security companies with large payroll",
    title: "Payment accounts for security companies with large payroll",
    description:
      "Collect from contract clients and run weekly or fortnightly pay runs across a large guard roster, reliably and on time.",
    intro:
      "A different shape from the importers, and a useful one. Security firms run big guard rosters with high headcount and weekly or fortnightly pay runs. There is little foreign exchange in it — what there is instead is volume: hundreds of payments that have to clear on the day they are supposed to, every time, because the alternative is a guard who does not turn up.",
    problems: [
      "Bulk payment files rejected late in the day, with no time left to fix them.",
      "Contract clients paying in on different cycles while payroll runs on a fixed one.",
      "Payment limits designed for an office of six, not a roster of six hundred.",
      "High headcount and frequent staff turnover treated as a risk indicator rather than an industry norm.",
    ],
    answers: [
      "Volume payouts that clear reliably, on schedule, at the headcount you actually run.",
      "Inward collection from your contract clients into an account in your own name.",
      "A pay run you can prepare, check and release without surprises.",
      "Limits agreed against real payroll figures at onboarding.",
    ],
    currencies: ["GBP"],
    keywords: [
      "payroll payments for security companies",
      "bulk payments UK business account",
      "security company banking UK",
    ],
  },
];

export function getSector(slug: string) {
  return sectors.find((sector) => sector.slug === slug);
}
