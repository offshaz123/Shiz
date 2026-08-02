export type BlogSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date, e.g. "2026-07-31"
  keywords: string[];
  sections: BlogSection[];
};

// Newest first. Add new posts to the top of this array.
export const blogPosts: BlogPost[] = [
  {
    slug: "meta-instagram-ads-budget-guide-uk-small-business",
    title: "How Much Should You Spend on Meta & Instagram Ads? A UK Small Business Guide",
    description:
      "A practical guide to setting a realistic Meta & Instagram ads budget for UK small businesses — what ad spend actually buys, and where the money should go first.",
    publishedAt: "2026-08-02",
    keywords: [
      "Meta ads budget UK",
      "Instagram ads cost",
      "how much do Facebook ads cost",
      "small business advertising budget",
    ],
    sections: [
      {
        paragraphs: [
          "\"How much should I spend on Meta ads?\" is one of the most common questions we hear from business owners — and it's usually the wrong first question. Budget isn't a fixed number that applies to every business; it depends on your margins, your average customer value, and what you're actually trying to achieve.",
          "That said, there are some genuinely useful ways to think about it, so you're not just picking a number out of thin air.",
        ],
      },
      {
        heading: "Two separate numbers: ad spend and management",
        paragraphs: [
          "It helps to think of Meta advertising as two separate costs. Ad spend is what you pay Meta directly to actually show your ads — this scales with how much reach and volume you want. Management is the cost of the strategy, creative, targeting, and ongoing optimisation behind those ads — whether that's an in-house hire, a freelancer, or an agency.",
          "Conflating the two is where a lot of businesses go wrong, either by assuming a small management fee should come with a huge ad budget, or by spending heavily on ads with no one actually managing performance day to day.",
        ],
      },
      {
        heading: "What's a sensible starting ad spend?",
        paragraphs: [
          "Rather than picking an arbitrary figure, work backwards from your numbers. If your average customer is worth £500 and you're comfortable paying £50 to acquire one, that's your target cost per lead — everything else follows from there.",
          "Meta's own ad platform also performs best once an ad set has gathered enough data to exit its \"learning phase\" — in practice this means a campaign needs a consistent, sustained budget for several weeks rather than a small burst of spend followed by silence. A modest, steady budget run consistently for 4–6 weeks will almost always outperform a larger budget switched on and off unpredictably.",
        ],
      },
      {
        heading: "Where the budget actually goes to work",
        paragraphs: ["A few things determine whether a given budget performs well or gets wasted, regardless of how much you spend:"],
        bullets: [
          "Creative quality — a scroll-stopping video or image matters more to cost-per-result than almost anything else",
          "Landing page or lead form quality — sending clicks to a slow or confusing page wastes spend that already did its job",
          "Speed of follow-up — a lead that gets a reply within minutes converts at a very different rate to one left for hours",
          "Retargeting — showing ads again to people who already engaged is typically far cheaper than reaching cold audiences",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're not sure what a realistic budget looks like for your specific business, that's exactly what a strategy call is for — we'll work through your numbers with you rather than hand you a generic figure. Our plans separate ad spend from management clearly from day one; see the pricing page for how the packages break down.",
        ],
      },
    ],
  },
  {
    slug: "instagram-ads-for-car-dealerships",
    title: "Instagram Ads for Car Dealerships: A Complete Guide",
    description:
      "How UK car dealerships and automotive businesses can use Instagram & Meta ads to generate qualified buyer leads, not just likes.",
    publishedAt: "2026-07-31",
    keywords: [
      "Instagram ads for car dealerships",
      "automotive Instagram advertising",
      "Meta ads for automotive",
      "car dealership lead generation",
    ],
    sections: [
      {
        paragraphs: [
          "Automotive is one of the most competitive categories on Instagram and Facebook — but it's also one of the most rewarding when the campaign is built correctly. Car buyers scroll, compare, and message before they ever set foot on a forecourt, which makes Meta & Instagram ads one of the highest-leverage channels available to a dealership.",
          "This guide covers what actually works for automotive advertising on Meta's platforms, and the mistakes that quietly waste ad budget.",
        ],
      },
      {
        heading: "Why Instagram works for car buyers",
        paragraphs: [
          "Instagram's visual, video-first format suits vehicles better than almost any other product category. A well-shot reel of a car's interior, a walkaround video, or a short clip of a test drive consistently outperforms static image ads for engagement — and engagement is what Meta's algorithm rewards with cheaper distribution.",
          "Just as importantly, Instagram and Facebook Messenger give buyers a low-friction way to ask a quick question — \"is this still available?\", \"what's the finance option?\" — without picking up the phone. Dealerships that respond fast to these messages convert a meaningfully higher share of them into showroom visits.",
        ],
      },
      {
        heading: "What a strong automotive campaign structure looks like",
        paragraphs: ["A campaign built for lead generation (rather than just brand awareness) typically includes:"],
        bullets: [
          "Vehicle-specific ad sets for higher-margin or higher-demand stock, rather than one generic \"visit our dealership\" ad",
          "Video-first creative — walkarounds, feature highlights, and short customer-facing clips",
          "A lead form or landing page that captures interest without forcing a phone call",
          "Retargeting for anyone who engaged with a previous ad but didn't enquire",
          "Geographic targeting tuned to a realistic drive-time radius, not just a city-wide blast",
        ],
      },
      {
        heading: "The mistake most dealerships make",
        paragraphs: [
          "The single biggest waste of ad spend in automotive marketing is generating interest and then losing it. A buyer messages on Instagram, doesn't get a reply for six hours, and has already messaged three other dealerships by the time someone responds.",
          "This is exactly why lead generation and lead management need to be treated as one system, not two separate problems. An ad campaign that generates enquiries is only half the job — routing those enquiries into one inbox, replying fast (including with an AI receptionist outside business hours), and following up automatically is what turns interest into a sale.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're running an automotive business and want Meta & Instagram ads built around your stock, your margins, and a system that makes sure no enquiry goes unanswered, get in touch for a free strategy call.",
        ],
      },
    ],
  },
];
