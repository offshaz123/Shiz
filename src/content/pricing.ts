export type PricingPlan = {
  name: string;
  price: string;
  priceSuffix?: string;
  tagline: string;
  popular?: boolean;
  features: string[];
  term?: string;
  ctaLabel?: string;
};

export type PricingGroup = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  serviceSlug: string;
  serviceLabel: string;
  plans: PricingPlan[];
  footnote: string;
};

export const pricingGroups: PricingGroup[] = [
  {
    id: "meta-ads",
    eyebrow: "Meta & Instagram Ads",
    title: "Facebook and Instagram ad management",
    intro:
      "Done-for-you ad campaigns that put enquiries in front of you instead of likes. Every plan includes the campaign build, the landing page and a place for the leads to land. Pick the level of automation and support that fits where you are right now.",
    serviceSlug: "meta-instagram-ads",
    serviceLabel: "More on Meta & Instagram ads",
    plans: [
      {
        name: "Starter",
        price: "£400",
        priceSuffix: "/month",
        tagline: "For businesses ready to switch on Meta and Instagram lead generation.",
        features: [
          "Meta & Instagram ad campaign setup",
          "1 active ad campaign, fully managed",
          "High-converting lead capture landing page",
          "Unified Instagram + Facebook inbox",
          "Lead notifications straight to you",
          "Monthly performance report",
          "Email support",
        ],
      },
      {
        name: "Growth",
        price: "£700",
        priceSuffix: "/month",
        tagline: "Our most popular plan, built to turn ad spend into a real pipeline.",
        popular: true,
        features: [
          "Everything in Starter, plus:",
          "Up to 3 active campaigns + A/B creative testing",
          "Full CRM pipeline built around your business",
          "All-in-one inbox: Instagram, Messenger, WhatsApp & SMS",
          "Automated lead follow-up (SMS + email sequences)",
          "Missed-call text-back so no enquiry is lost",
          "Fortnightly strategy calls",
          "Priority support",
        ],
      },
      {
        name: "Scale",
        price: "£1,400",
        priceSuffix: "/month",
        tagline: "For businesses ready to dominate their market across every channel.",
        features: [
          "Everything in Growth, plus:",
          "Unlimited campaigns across Meta & Instagram",
          "Advanced retargeting & lookalike funnels",
          "24/7 AI receptionist & chatbot for instant replies",
          "Automated booking, reminders & review requests",
          "Multi-location / multi-channel support",
          "Dedicated account manager",
          "Weekly reporting & strategy calls",
        ],
      },
    ],
    footnote:
      "Ad spend is separate from your management fee and is paid directly to Meta. Plans run monthly with no long-term contract, cancel anytime.",
  },
  {
    id: "google-ads",
    eyebrow: "Google Ads",
    title: "Google Ads management, one flat price",
    intro:
      "Most agencies charge you a management fee and then charge again for the landing page, again for tracking and again for the system that holds your leads. We don't. One price covers the lot, and the work carries on every month rather than stopping the day the campaign goes live.",
    serviceSlug: "google-ads",
    serviceLabel: "More on Google Ads",
    plans: [
      {
        name: "Google Ads Management",
        price: "£600",
        priceSuffix: "/month",
        popular: true,
        tagline:
          "Everything needed to run Google Ads properly, in one monthly fee. No setup charge and no add-ons.",
        features: [
          "Full Google Ads account build, or a rebuild of the one you already have",
          "Keyword research and a negative keyword list that keeps growing",
          "Search campaigns written, launched and managed for you",
          "A landing page built for the campaign, included at no extra cost",
          "Conversion tracking and call tracking set up properly, so you know what actually worked",
          "CRM built in if you need one, so every enquiry lands somewhere instead of an inbox",
          "Monthly optimisation: ads rewritten, budgets moved, wasted keywords cut out",
          "Monthly report in plain English, plus a call whenever you want one",
        ],
        ctaLabel: "Start With Google Ads",
      },
    ],
    footnote:
      "Ad spend is separate and paid directly to Google, so you always know what's going to advertising and what's going to us. Runs monthly with no long-term contract. If your click spend goes past £3,000 a month we'll talk about moving to a percentage, and we'll be the ones to raise it.",
  },
  {
    id: "seo",
    eyebrow: "SEO & Local Search",
    title: "SEO and local search",
    intro:
      "SEO is not a switch, it's a build. The first month is groundwork, the results come later. That's why these plans run on a minimum term. It isn't us tying you in, it's us making sure you don't pay for the foundations and walk away before the house is on top of them.",
    serviceSlug: "seo",
    serviceLabel: "More on SEO",
    plans: [
      {
        name: "Local SEO",
        price: "£350",
        priceSuffix: "/month",
        term: "3 month minimum",
        tagline:
          "For a business that gets its customers from one town or city. The aim is the map pack, not the whole country.",
        features: [
          "Google Business Profile fully optimised and posted to weekly",
          "Local citations built, cleaned up and kept consistent",
          "Review generation system so new reviews come in on their own",
          "One location or service page written every month",
          "On-page fixes to the pages that matter most",
          "Monthly ranking report for your area",
        ],
      },
      {
        name: "SEO Growth",
        price: "£650",
        priceSuffix: "/month",
        term: "6 month minimum",
        popular: true,
        tagline:
          "For a business competing beyond one town, or one that already gets traffic and wants more of it to convert.",
        features: [
          "Everything in Local SEO, plus:",
          "Full technical audit and the fixes actually carried out",
          "Two content pieces a month, written and published",
          "On-page optimisation across the whole site",
          "Internal linking structure built out",
          "Link building on a steady monthly basis",
          "Monthly strategy call",
        ],
      },
      {
        name: "SEO Scale",
        price: "£1,200",
        priceSuffix: "/month",
        term: "6 month minimum",
        tagline:
          "For a business in a competitive market that wants to own the search results rather than appear in them.",
        features: [
          "Everything in SEO Growth, plus:",
          "Four content pieces a month",
          "Serious link acquisition and digital PR",
          "Competitor gap analysis, refreshed quarterly",
          "Conversion rate work on the pages that already rank",
          "Multi-location or national campaigns",
          "Fortnightly reporting and calls",
        ],
      },
    ],
    footnote:
      "We will never promise you a position on Google, and be careful of anyone who does. What we promise is the work, done every month, and reporting honest enough that you can see it happening.",
  },
  {
    id: "social-media-management",
    eyebrow: "Social Media Management",
    title: "Social media management",
    intro:
      "If you want the posting, the planning and the replying handled for you, we do that too. The price depends on how many platforms you want covered and how often you want posting, so it's a conversation rather than a number on a page.",
    serviceSlug: "social-media-management",
    serviceLabel: "More on social media management",
    plans: [
      {
        name: "Social Media Management",
        price: "Ask us",
        priceSuffix: "on a call",
        tagline:
          "Priced around what you actually need. Tell us the platforms and the posting schedule and we'll give you a straight number on the call.",
        features: [
          "Content planned and scheduled across the platforms you choose",
          "Posts, reels and stories designed in your branding",
          "Captions and hashtags written for you",
          "Comments and DMs answered, all in one inbox",
          "Monthly content calendar agreed with you in advance",
          "Reporting on what people actually engaged with",
        ],
        ctaLabel: "Book A Call",
      },
    ],
    footnote:
      "We'll quote on the call, not before. That way you're paying for the platforms you want rather than a package built for somebody else.",
  },
];
