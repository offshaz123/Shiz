export type Service = {
  slug: string;
  name: string;
  /** Short line for the homepage grid. */
  teaser: string;
  /** Pills shown under the teaser, like the sub-services on a card. */
  tags: string[];
  /** Longer intro used at the top of the service's own page. */
  intro: string;
  metaDescription: string;
  keywords: string[];
  whoFor: string;
  includes: { title: string; body: string }[];
  /** Headline price, linked through to the matching block on /pricing. */
  pricing?: { headline: string; note: string; anchor: string };
  /** A related article, so each service page points into the blog. */
  readMore?: { label: string; href: string };
};

export const services: Service[] = [
  {
    slug: "meta-instagram-ads",
    name: "Meta & Instagram Ads",
    teaser:
      "Facebook and Instagram campaigns built for enquiries rather than likes, managed properly and tested continuously.",
    tags: ["Facebook Ads", "Instagram Ads", "Lead Forms", "Retargeting", "Creative"],
    intro:
      "Most businesses have pressed Boost at some point and been disappointed. A real campaign is a different thing entirely: it optimises for enquiries rather than engagement, it can run lead forms, and it can test several versions and drop the ones that don't work.",
    metaDescription:
      "Meta and Instagram ad campaigns for UK businesses, built and managed for qualified enquiries rather than likes. From £400 a month, ad spend separate.",
    keywords: ["Meta ads agency UK", "Instagram ads management", "Facebook ads for small business"],
    whoFor:
      "Service businesses who need a steady flow of enquiries and have someone able to answer them quickly.",
    includes: [
      { title: "Campaign build and management", body: "Structure, targeting, budgets and daily management. Not set and forget." },
      { title: "Creative written and tested", body: "At least two versions running against each other so we learn what your customers respond to." },
      { title: "Lead forms or landing pages", body: "Whichever suits your business, set up to collect what you actually need to qualify someone." },
      { title: "Tracking installed properly", body: "Meta Pixel and Conversions API, so the system learns from real conversions rather than clicks." },
      { title: "Category compliance", body: "Some sectors sit under restricted rules. We handle the declaration and the copy so your account stays safe." },
    ],
    pricing: {
      headline: "From £400 a month",
      note: "Three plans: £400, £700 and £1,400 a month depending on how many campaigns you want running and how much automation you need behind them. Ad spend is separate and paid directly to Meta. No long-term contract.",
      anchor: "meta-ads",
    },
    readMore: { label: "What makes ad creative actually convert", href: "/blog/what-makes-ad-creative-actually-convert" },
  },
  {
    slug: "google-ads",
    name: "Google Ads",
    teaser:
      "Search campaigns that catch people at the moment they're looking for what you sell, rather than waiting to be found.",
    tags: ["Search Ads", "Local Campaigns", "Call Ads", "Conversion Tracking"],
    intro:
      "Paid social reaches people who aren't looking yet. Google reaches people who already are. For anything urgent or problem-driven, that intent is worth paying for, and the two together cover far more ground than either alone.",
    metaDescription:
      "Google Ads management for UK businesses. Search campaigns built around genuine buying intent, with proper conversion tracking and honest reporting.",
    keywords: ["Google Ads agency UK", "Google Ads management small business", "PPC agency UK"],
    whoFor:
      "Businesses whose customers actively search for them — emergency trades, garages, clinics, anything urgent.",
    includes: [
      { title: "Keyword and intent research", body: "What people actually type, and which of those searches are worth paying for." },
      { title: "Campaign build and management", body: "Structure, bidding and budgets, adjusted as the data comes in." },
      { title: "Negative keyword management", body: "The ongoing work that stops your budget going on searches that were never going to convert." },
      { title: "Conversion tracking", body: "Calls and form submissions tracked properly, so you can see which searches produce customers." },
    ],
    pricing: {
      headline: "£600 a month, flat",
      note: "One price covers the account build, the campaigns, a landing page built for the campaign, the conversion and call tracking, a CRM if you need one, and the monthly optimisation. No setup fee and no add-ons. Ad spend is separate and paid directly to Google.",
      anchor: "google-ads",
    },
    readMore: { label: "Meta Ads vs Google Ads: which is right for you", href: "/blog/meta-ads-vs-google-ads-which-is-right" },
  },
  {
    slug: "crm-automation",
    name: "CRM & Automation",
    teaser:
      "Every enquiry in one place, tracked through to won or lost, with the follow-up happening whether you remember or not.",
    tags: ["Unified Inbox", "Pipelines", "Automated Follow-Up", "Missed-Call Text-Back"],
    intro:
      "Most businesses lose more money to enquiries that never got answered than to any weakness in their advertising. A CRM is simply somewhere every enquiry lives visibly, at whatever stage it's currently at, instead of in someone's head and four different apps.",
    metaDescription:
      "CRM setup and automation for UK small businesses. One inbox for Instagram, Facebook, WhatsApp and web forms, with pipelines and automated follow-up.",
    keywords: ["CRM for small business UK", "lead management system", "automated follow up"],
    whoFor:
      "Any business handling more than a handful of enquiries a week, particularly where they arrive outside working hours.",
    includes: [
      { title: "One inbox for every channel", body: "Instagram, Facebook, WhatsApp, SMS and your website forms, all in one place." },
      { title: "A pipeline built around your business", body: "Named after what actually happens, not sales jargon. Four to six stages you can say from memory." },
      { title: "Automated follow-up", body: "The sequence that runs on day two, day four and day eight, so nobody gets forgotten in a busy week." },
      { title: "Missed-call text-back", body: "An automatic message when you can't pick up, so the enquiry doesn't go straight to a competitor." },
    ],
    readMore: { label: "CRM pipelines explained, without the jargon", href: "/blog/crm-pipelines-explained-for-business-owners" },
  },
  {
    slug: "seo",
    name: "SEO & Local Search",
    teaser:
      "Being found when people search, and making sure your Google listing does the work it's capable of.",
    tags: ["Local SEO", "Google Business Profile", "On-Page SEO", "Content"],
    intro:
      "For a local business the free Google listing is often seen more than the website is, and it's usually the least maintained thing they own. Search captures demand that already exists, which makes it the natural companion to advertising rather than an alternative to it.",
    metaDescription:
      "SEO and local search for UK businesses. Google Business Profile optimisation, business listings, on-page work and content that earns its place.",
    keywords: ["local SEO UK", "Google Business Profile optimisation", "SEO agency small business"],
    whoFor:
      "Local businesses serving a defined area, and anyone whose customers search before they buy.",
    includes: [
      { title: "Google Business Profile", body: "Categories, services, photos, posts and the review habit that keeps it ranking." },
      { title: "Business listings tidied up", body: "Your name, address and phone number made consistent everywhere they appear." },
      { title: "On-page work", body: "Titles, descriptions, structure and the technical basics that let a search engine understand the site." },
      { title: "Content that answers real questions", body: "Written around what people actually search for, not stuffed with keywords." },
    ],
    pricing: {
      headline: "From £350 a month",
      note: "Local SEO £350, SEO Growth £650, SEO Scale £1,200. There's a 3 or 6 month minimum term depending on the plan, because SEO takes time to show and we'd rather say that up front than let you pay for groundwork and leave before it pays.",
      anchor: "seo",
    },
    readMore: { label: "Your Google Business Profile is doing more work than your website", href: "/blog/google-business-profile-does-more-than-your-website" },
  },
  {
    slug: "web-design",
    name: "Website Design & Build",
    teaser:
      "Fast, mobile-first sites built around one job: turning a visitor into an enquiry. From £300.",
    tags: ["Web Design", "Landing Pages", "Tracking Setup", "Mobile-First"],
    intro:
      "A website that looks good and produces nothing is a common and expensive thing to own. We build around the enquiry: what someone needs to see, how quickly they can act, and whether you can measure any of it afterwards.",
    metaDescription:
      "Website design and build for UK businesses from £300. Mobile-first, fast, and built around getting enquiries, with tracking set up from day one.",
    keywords: ["website design UK small business", "landing page design", "web design from £300"],
    whoFor:
      "Businesses with no website, or one that gets visitors and produces nothing.",
    includes: [
      { title: "Built for enquiries", body: "Structure, copy and layout aimed at the form completion rather than decoration." },
      { title: "Fast on a phone", body: "Which is where almost all your advertising traffic lands." },
      { title: "Tracking from day one", body: "Meta Pixel, Conversions API, Google Analytics and Search Console, installed and verified rather than half-set-up." },
      { title: "Yours to keep", body: "Your domain, your hosting, your content. No lock-in and nothing held hostage." },
    ],
    pricing: {
      headline: "From £300, one-off",
      note: "Not a monthly fee. A simple few-page site starts at £300 and the price moves depending on how many pages you want and what needs building into them. Hosting is separate and usually runs £10 to £30 a month, set up in your name so you own the site outright.",
      anchor: "web-design",
    },
    readMore: { label: "Seven signs your landing page is losing you leads", href: "/blog/signs-your-landing-page-is-losing-leads" },
  },
  {
    slug: "social-media-management",
    name: "Social Media Management",
    teaser:
      "A profile that looks alive, so the people your ads reach find a business that clearly exists.",
    tags: ["Content Planning", "Posting", "Community Management", "Reels"],
    intro:
      "Organic posting will not replace advertising, and anyone telling you otherwise is selling something. What it does do is back it up. A good proportion of people who see your ad will check your profile before enquiring, and what they find there decides whether they do.",
    metaDescription:
      "Social media management for UK businesses. Content planning, posting and community management that supports your advertising rather than replacing it.",
    keywords: ["social media management UK", "Instagram management small business", "content planning"],
    whoFor:
      "Businesses running ads whose profile doesn't yet back up the promise the ad makes.",
    includes: [
      { title: "A content plan", body: "Built around what your customers ask, not a calendar of national days nobody cares about." },
      { title: "Posting and scheduling", body: "Consistent enough that the profile reads as a working business." },
      { title: "Comments and messages", body: "Answered, in the same inbox as everything else, so nothing sits unread." },
      { title: "Reels and short video", body: "Filmed simply. Rough and real tends to outperform polished in this format." },
    ],
    pricing: {
      headline: "Priced on a call",
      note: "It depends on how many platforms you want covered and how often you want posting, so we quote it properly on a call rather than selling you a package built for someone else. Tell us what you need and you'll get a straight number.",
      anchor: "social-media-management",
    },
    readMore: { label: "Organic social vs paid ads: why you need both", href: "/blog/organic-social-vs-paid-ads" },
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}
