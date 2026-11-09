export type Location = {
  slug: string;
  city: string;
  /** True only for the city we actually have an office in. */
  isBase: boolean;
  teaser: string;
  metaDescription: string;
  keywords: string[];
  /** Honest statement of our relationship to the city. */
  presence: string;
  context: string;
  strongSectors: string[];
};

export const locations: Location[] = [
  {
    slug: "canary-wharf",
    city: "Canary Wharf",
    isBase: true,
    teaser: "Where we actually are — Level 39, One Canada Square.",
    metaDescription:
      "Marketing agency in Canary Wharf, based at Level 39, One Canada Square. Meta and Google Ads, SEO, websites and CRM for London service businesses.",
    keywords: [
      "marketing agency Canary Wharf",
      "Canary Wharf advertising agency",
      "Google Ads agency Canary Wharf",
      "marketing agency One Canada Square",
    ],
    presence:
      "This is our address, not a forwarding one. We are at Level 39, One Canada Square, and if meeting in person is easier than a call then that is where you would come.",
    context:
      "Canary Wharf is an odd place to run a local marketing agency from, and we are aware of it. The businesses on the estate are mostly banks, law firms and the companies that serve them, and very few of them need what we do. Our customers are the trades and service businesses out past the estate — in Poplar, the Isle of Dogs, Stratford, Barking and further into Essex — who are competing for people within a half-hour drive rather than for international mandates. Being in the Wharf buys us two things: somewhere to sit down with a client that is easy to reach on the Jubilee line or the Elizabeth line, and a short walk to most of east London's actual customer base.",
    strongSectors: [
      "Automotive",
      "Home & trade services",
      "Health & beauty",
      "Professional services",
    ],
  },
  {
    slug: "london",
    city: "London",
    isBase: true,
    teaser: "Our office is here — Level 39, One Canada Square, Canary Wharf.",
    metaDescription:
      "Marketing agency in London, based at Level 39, One Canada Square, Canary Wharf. Meta and Google Ads, SEO and websites for London service businesses.",
    keywords: [
      "marketing agency London",
      "Meta ads agency London",
      "Instagram ads London",
    ],
    presence:
      "This is where we're based. Our office is at Level 39, One Canada Square in Canary Wharf, and we're happy to meet in person if that's easier than a call.",
    context:
      "London is the most expensive advertising market in the country, simply because more businesses are bidding for the same attention. That makes two things matter more here than elsewhere: targeting a genuinely tight radius rather than the whole city, and making sure enquiries get answered quickly enough to justify what you paid for them.",
    strongSectors: [
      "Health & beauty",
      "Professional services",
      "Hospitality",
      "Property",
    ],
  },
  {
    slug: "birmingham",
    city: "Birmingham",
    isBase: false,
    teaser:
      "We're not based in Birmingham, but we work with businesses here and everything runs remotely.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Birmingham businesses. London-based, working remotely with clients across the West Midlands. No office here.",
    keywords: [
      "marketing agency Birmingham",
      "Meta ads Birmingham",
      "Facebook ads agency Birmingham",
    ],
    presence:
      "We'll be straight with you: we're not based in Birmingham. Our office is in London. Everything we do runs remotely — campaigns, tracking, reporting and enquiry handling — so where we sit makes no difference to the work.",
    context:
      "Birmingham and the wider West Midlands is a big market with noticeably cheaper advertising costs than London, which means a budget goes further here. The catch is distance: a tight radius matters, because a customer twenty-five minutes away behaves very differently from one across the city.",
    strongSectors: [
      "Automotive",
      "Home & trades",
      "Health & beauty",
      "Hospitality",
    ],
  },
  {
    slug: "manchester",
    city: "Manchester",
    isBase: false,
    teaser:
      "London-based, working with Manchester businesses remotely. No local office, and we won't pretend otherwise.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Manchester businesses. A London agency working remotely across Greater Manchester, with no office up here.",
    keywords: [
      "marketing agency Manchester",
      "Meta ads Manchester",
      "Instagram ads Manchester",
    ],
    presence:
      "We don't have a Manchester office. We're in London, and we work with businesses here remotely. If you'd rather deal with someone who can come to your premises, that's a fair reason to pick somebody else — we'd rather say so than waste your time.",
    context:
      "Greater Manchester has a dense independent business scene and advertising costs well below London's. What tends to decide results here is the same thing as everywhere: not the targeting, but whether the enquiries that arrive in the evening get answered before the person books elsewhere.",
    strongSectors: ["Hospitality", "Health & beauty", "Retail", "Fitness"],
  },
  {
    slug: "liverpool",
    city: "Liverpool",
    isBase: false,
    teaser:
      "Remote, from London. A smaller market where a tight radius and fast replies go a long way.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Liverpool businesses. A London agency working remotely across Merseyside, honest about not being local.",
    keywords: [
      "marketing agency Liverpool",
      "Meta ads Liverpool",
      "Facebook ads Liverpool",
    ],
    presence:
      "No Liverpool office. We're London-based and everything runs remotely. In practice that means calls, screen shares and reporting rather than site visits.",
    context:
      "Liverpool is a smaller and cheaper market than Manchester or Birmingham, which cuts both ways. Advertising costs less, but the audience is smaller, so ads fatigue faster and creative needs refreshing more often than a London campaign would.",
    strongSectors: [
      "Hospitality",
      "Health & beauty",
      "Home & trades",
      "Automotive",
    ],
  },
  {
    slug: "leeds",
    city: "Leeds",
    isBase: false,
    teaser:
      "Worked remotely from London. Strong professional services market with very little social competition.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Leeds businesses. A London agency working remotely across West Yorkshire, honest about not being local.",
    keywords: [
      "marketing agency Leeds",
      "Meta ads Leeds",
      "Instagram ads Leeds",
    ],
    presence:
      "We're not in Leeds. Our office is in London and we work with Yorkshire businesses remotely, the same way we do everywhere outside the capital.",
    context:
      "Leeds has a substantial professional and financial services base, and very few of those firms advertise on paid social at all. That makes the auction cheap for anyone willing to do it properly, though the sales cycles are long enough that follow-up matters more than the ads.",
    strongSectors: [
      "Professional services",
      "Property",
      "Hospitality",
      "Fitness",
    ],
  },
  {
    slug: "glasgow",
    city: "Glasgow",
    isBase: false,
    teaser:
      "Remote from London. Scotland's biggest market, with its own legal and regulatory differences worth knowing.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Glasgow businesses. A London agency working remotely with clients across Scotland, with no Glasgow office.",
    keywords: [
      "marketing agency Glasgow",
      "Meta ads Glasgow",
      "Facebook ads Scotland",
    ],
    presence:
      "No Glasgow office — we're based in London and work with Scottish businesses remotely. Meta's targeting covers Glasgow exactly as it does anywhere else in the UK.",
    context:
      "Glasgow is the largest market in Scotland and advertising costs sit well below London's. One thing worth knowing if you're in property or anything regulated: Scotland has its own legal framework in several areas, so copy written for an English business doesn't always transfer without checking.",
    strongSectors: ["Hospitality", "Automotive", "Home & trades", "Retail"],
  },
];

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}

export type Faq = { question: string; answer: string };

/**
 * Location FAQs. The first question on every page that is not London is
 * whether we are actually there, and the answer is no — said plainly, because
 * a visitor finds that out in one click anyway and a page that dodged it has
 * already told them something about us.
 */
export const locationFaqs: Record<string, Faq[]> = {
  "canary-wharf": [
    {
      question: "Do you actually have an office in Canary Wharf?",
      answer:
        "Yes, at Level 39, One Canada Square. It is our address rather than a forwarding one, and if meeting in person is easier than a call that is where you would come.",
    },
    {
      question: "How much does a Canary Wharf marketing agency charge?",
      answer:
        "Our prices are published rather than quoted on a call: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month and websites from £300 one-off. No setup fees, and advertising budget is paid by you to the platform directly.",
    },
    {
      question: "Which businesses around Canary Wharf do you work with?",
      answer:
        "Mostly not the estate itself. Our clients are the trades and service businesses further out, in Poplar, the Isle of Dogs, Stratford, Barking and into Essex, competing for people within about a half hour drive.",
    },
  ],
  london: [
    {
      question: "Where in London are you based?",
      answer:
        "Level 39, One Canada Square in Canary Wharf. We are happy to meet in person if that is easier than a call.",
    },
    {
      question: "How much does a London marketing agency cost?",
      answer:
        "Ours are published on the pricing page: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month, websites from £300 one-off, and no setup fees. Your advertising budget is separate and paid straight to the platform on your own card.",
    },
    {
      question: "Do you only work with London businesses?",
      answer:
        "No. London is where we are and where a lot of our clients are, but the work runs remotely and we take on businesses across the UK.",
    },
  ],
  birmingham: [
    {
      question: "Do you have an office in Birmingham?",
      answer:
        "No, and we would rather say so up front. Our office is in London and everything runs remotely: campaigns, tracking, reporting and enquiry handling. If you would rather deal with somebody who can come to your premises, a local agency is the better fit and we will tell you that.",
    },
    {
      question: "How much do you charge Birmingham businesses?",
      answer:
        "The same as everybody else, and it is published: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month and websites from £300 one-off. No setup fees and no regional pricing.",
    },
    {
      question:
        "Can you do local SEO for Birmingham if you are not based there?",
      answer:
        "Yes. Local ranking is driven by your Google Business Profile, your website and what other sites say about you, none of which depends on where your agency sits. What we cannot do is walk into your unit, which is the honest trade-off.",
    },
  ],
  manchester: [
    {
      question: "Do you have a Manchester office?",
      answer:
        "No. We are in London and we work with Manchester businesses remotely, which in practice means calls, screen shares and reporting rather than site visits.",
    },
    {
      question: "What do you charge in Manchester?",
      answer:
        "The published prices, same everywhere: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month, websites from £300 one-off, no setup fees.",
    },
    {
      question: "Is a London agency a disadvantage for a Manchester business?",
      answer:
        "For the advertising itself, no. Google and Meta target Manchester the same way wherever the account is managed from. The genuine difference is that we cannot meet you at your premises, so if that matters to you it should count against us.",
    },
  ],
  liverpool: [
    {
      question: "Do you have an office in Liverpool?",
      answer:
        "No Liverpool office. We are London based and everything runs remotely, so calls, screen shares and reporting rather than visits.",
    },
    {
      question: "What does it cost to work with you from Liverpool?",
      answer:
        "Published and the same nationwide: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month, websites from £300 one-off, no setup fees. Advertising budget is paid by you to the platform directly.",
    },
    {
      question: "Can you help a Liverpool business rank locally?",
      answer:
        "Yes. What decides local ranking is your Google Business Profile, your site and what other sites say about you, and none of that is affected by where we sit. The free audit scores both your site and your listing before you commit to anything.",
    },
  ],
  leeds: [
    {
      question: "Are you based in Leeds?",
      answer:
        "No. Our office is in London and we work with Yorkshire businesses remotely, the same way we do everywhere outside the capital.",
    },
    {
      question: "How much do you charge?",
      answer:
        "The same published prices everywhere: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month and websites from £300 one-off, with no setup fees.",
    },
    {
      question: "Would a Leeds agency be better for a Leeds business?",
      answer:
        "If you want someone who can sit in your office, yes, and we will say so. If what you want is the campaigns run properly and reported honestly, where the agency sits makes no difference to the platforms.",
    },
  ],
  glasgow: [
    {
      question: "Do you have a Glasgow office?",
      answer:
        "No. We are based in London and work with Scottish businesses remotely.",
    },
    {
      question: "Can you advertise to Glasgow properly from London?",
      answer:
        "Yes. Meta and Google target Glasgow exactly as they do anywhere else in the UK, and the account does not know where it is being managed from. What we cannot do is come to you, which is worth weighing if that matters.",
    },
    {
      question: "What are your prices for a Scottish business?",
      answer:
        "The same as anywhere: Meta and Instagram ads from £499 a month, Google Ads management at £600 a month, local SEO from £350 a month, websites from £300 one-off. No setup fees and no regional pricing.",
    },
  ],
};

export function getLocationFaqs(slug: string): Faq[] {
  return locationFaqs[slug] ?? [];
}
