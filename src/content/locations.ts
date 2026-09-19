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
    slug: "london",
    city: "London",
    isBase: true,
    teaser: "Our office is here — Level 39, One Canada Square, Canary Wharf.",
    metaDescription:
      "Marketing agency in London, based at Level 39, One Canada Square, Canary Wharf. Meta and Google Ads, SEO and websites for London service businesses.",
    keywords: ["marketing agency London", "Meta ads agency London", "Instagram ads London"],
    presence:
      "This is where we're based. Our office is at Level 39, One Canada Square in Canary Wharf, and we're happy to meet in person if that's easier than a call.",
    context:
      "London is the most expensive advertising market in the country, simply because more businesses are bidding for the same attention. That makes two things matter more here than elsewhere: targeting a genuinely tight radius rather than the whole city, and making sure enquiries get answered quickly enough to justify what you paid for them.",
    strongSectors: ["Health & beauty", "Professional services", "Hospitality", "Property"],
  },
  {
    slug: "birmingham",
    city: "Birmingham",
    isBase: false,
    teaser: "We're not based in Birmingham, but we work with businesses here and everything runs remotely.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Birmingham businesses. London-based, working remotely with clients across the West Midlands. No office here.",
    keywords: ["marketing agency Birmingham", "Meta ads Birmingham", "Facebook ads agency Birmingham"],
    presence:
      "We'll be straight with you: we're not based in Birmingham. Our office is in London. Everything we do runs remotely — campaigns, tracking, reporting and enquiry handling — so where we sit makes no difference to the work.",
    context:
      "Birmingham and the wider West Midlands is a big market with noticeably cheaper advertising costs than London, which means a budget goes further here. The catch is distance: a tight radius matters, because a customer twenty-five minutes away behaves very differently from one across the city.",
    strongSectors: ["Automotive", "Home & trades", "Health & beauty", "Hospitality"],
  },
  {
    slug: "manchester",
    city: "Manchester",
    isBase: false,
    teaser: "London-based, working with Manchester businesses remotely. No local office, and we won't pretend otherwise.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Manchester businesses. A London agency working remotely across Greater Manchester, with no office up here.",
    keywords: ["marketing agency Manchester", "Meta ads Manchester", "Instagram ads Manchester"],
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
    teaser: "Remote, from London. A smaller market where a tight radius and fast replies go a long way.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Liverpool businesses. A London agency working remotely across Merseyside, honest about not being local.",
    keywords: ["marketing agency Liverpool", "Meta ads Liverpool", "Facebook ads Liverpool"],
    presence:
      "No Liverpool office. We're London-based and everything runs remotely. In practice that means calls, screen shares and reporting rather than site visits.",
    context:
      "Liverpool is a smaller and cheaper market than Manchester or Birmingham, which cuts both ways. Advertising costs less, but the audience is smaller, so ads fatigue faster and creative needs refreshing more often than a London campaign would.",
    strongSectors: ["Hospitality", "Health & beauty", "Home & trades", "Automotive"],
  },
  {
    slug: "leeds",
    city: "Leeds",
    isBase: false,
    teaser: "Worked remotely from London. Strong professional services market with very little social competition.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Leeds businesses. A London agency working remotely across West Yorkshire, honest about not being local.",
    keywords: ["marketing agency Leeds", "Meta ads Leeds", "Instagram ads Leeds"],
    presence:
      "We're not in Leeds. Our office is in London and we work with Yorkshire businesses remotely, the same way we do everywhere outside the capital.",
    context:
      "Leeds has a substantial professional and financial services base, and very few of those firms advertise on paid social at all. That makes the auction cheap for anyone willing to do it properly, though the sales cycles are long enough that follow-up matters more than the ads.",
    strongSectors: ["Professional services", "Property", "Hospitality", "Fitness"],
  },
  {
    slug: "glasgow",
    city: "Glasgow",
    isBase: false,
    teaser: "Remote from London. Scotland's biggest market, with its own legal and regulatory differences worth knowing.",
    metaDescription:
      "Meta and Google Ads, SEO and websites for Glasgow businesses. A London agency working remotely with clients across Scotland, with no Glasgow office.",
    keywords: ["marketing agency Glasgow", "Meta ads Glasgow", "Facebook ads Scotland"],
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
