import { brand } from "@/lib/brand";

/** The three things a customer does with the account. The whole product. */
export const pillars = [
  {
    title: "Collect",
    body: "Take payments in from your retailers and buyers across the UK, into an account in your own company name.",
  },
  {
    title: "Convert",
    body: "Turn sterling into USD, AED, HKD, EUR and the other currencies your suppliers invoice in — at a rate quoted before you commit.",
  },
  {
    title: "Pay",
    body: "Send it out to suppliers in China, Hong Kong, Dubai and elsewhere, same day, without a letter asking what the money is for.",
  },
] as const;

/**
 * What the customer sends us to open an account. Taken straight from the
 * onboarding file requirements — a complete file is the single biggest factor
 * in how fast a decision comes back.
 */
export const onboardingChecklist = [
  {
    item: "Certificate of incorporation and full company details",
    note: "Companies House filings, share structure, and the trading name if it differs from the registered one.",
  },
  {
    item: "ID and proof of address for every director, and anyone holding 25% or more",
    note: "Passport or driving licence, plus a utility bill or bank statement from the last three months.",
  },
  {
    item: "Proof of the trading address",
    note: "The place the business actually operates from, not just the registered office. A lease, a rates bill or a utility bill in the company name.",
  },
  {
    item: "Recent bank statements",
    note: "Usually the last three to six months, showing the trade as it runs today.",
  },
  {
    item: "Sample invoices — both sides",
    note: "Invoices from your suppliers and invoices to your customers. They evidence the trade better than anything else in the file.",
  },
  {
    item: "Expected monthly volume in and out, and the currencies involved",
    note: "An honest estimate. Under-stating it causes more problems later than over-stating it.",
  },
  {
    item: "A plain-English description of the trade",
    note: "What you buy, who you buy it from, who you sell to, and how the money moves. This is the part that turns a borderline file into an approval.",
  },
] as const;

export const faqs = [
  {
    question: "Are you a bank?",
    answer: `No, and we do not pretend to be. ${brand.name} is a trading name of a UK payments firm authorised and regulated by the Financial Conduct Authority — a payment institution, not a bank. Your money sits in safeguarded accounts rather than being lent out, which is a different protection from a bank deposit: it is not covered by the FSCS, and we would rather tell you that now than have you find out later.`,
  },
  {
    question: "Is the account in my company name?",
    answer:
      "Yes. It is a named business account, so money arrives from your retailers cleanly and your suppliers can see who is paying them. No shared accounts, no payment references doing the work a company name should be doing.",
  },
  {
    question: "My last account was closed. Is there any point applying?",
    answer:
      "That is most of the conversations we have. A closure usually says more about a bank's appetite for a whole sector than about your business. We onboard properly instead of declining on sight, which means real paperwork up front — and then an account that stays open.",
  },
  {
    question: "How long does it take to open?",
    answer:
      "It depends almost entirely on how complete your file is when it goes in. Everything on our checklist, first time, and a decision comes back quickly. A file that has to be chased in pieces takes as long as the slowest piece.",
  },
  {
    question: "Can you guarantee I will be approved?",
    answer:
      "No. Every application goes through full KYB, anti-money-laundering and source-of-funds checks, and the decision comes after those, not before. Anyone who guarantees you an account up front is telling you something they cannot know.",
  },
  {
    question: "What does it cost?",
    answer:
      "There is a fee on funds received and a margin on currency conversion, quoted against what you are paying today. Tell us what your current provider charges you on a real transaction and we will price the same one next to it. That is a more useful answer than a rate card, because the number that matters is the difference.",
  },
  {
    question: "Do I have to move everything at once?",
    answer:
      "No, and we would not suggest it. Keep your existing account. Run your next import payment through us, compare the rate on that one transaction, and decide from there.",
  },
  {
    question: "Which currencies can I pay in?",
    answer:
      "USD, AED, HKD and EUR cover most of what our customers pay out, alongside sterling. If your supplier invoices in something else, ask — the list is longer than the one on this page.",
  },
] as const;
