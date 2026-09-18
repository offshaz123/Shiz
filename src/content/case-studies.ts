/**
 * Approach pages. These publish our method and the numbers we hold ourselves
 * to, rather than invented headline figures. Real client results live in
 * `published` below and only go in once the client has approved them.
 */
export type Approach = {
  slug: string;
  label: string;
  name: string;
  headline: string;
  teaser: string;
  metaDescription: string;
  keywords: string[];
  method: { title: string; body: string }[];
  measures: string[];
  faqs: { q: string; a: string }[];
  relatedServices: { label: string; href: string }[];
};

export const publishedResult = {
  client: "Detailmatics",
  sector: "Automotive — servicing & detailing",
  period: "12 months",
  stats: [
    { value: "235", label: "Leads generated" },
    { value: "£3.89", label: "Cost per lead" },
    { value: "150+", label: "Customers booked" },
    { value: "£913", label: "Total ad spend" },
  ],
  summary:
    "Twelve months of Meta and Instagram campaigns for a car servicing and detailing business, with every enquiry answered through a single inbox. That works out at roughly £6 of advertising per customer through the door.",
};

export const approaches: Approach[] = [
  {
    slug: "meta-ads",
    label: "Paid social",
    name: "Meta & Instagram Ads",
    headline: "Meta Ads Results, Done the Honest Way",
    teaser: "How we run Facebook and Instagram campaigns, and the numbers we judge ourselves by rather than the ones that look good in a report.",
    metaDescription:
      "How Shaz Marketing Group approaches Meta and Instagram ads for UK businesses, the method behind it, and the metrics we measure ourselves against.",
    keywords: ["Meta ads case study UK", "Instagram ads results", "Facebook ads agency method"],
    method: [
      { title: "Audit first", body: "We find the tracking gaps, the broken enquiry routes and the category restrictions before changing anything or spending a pound." },
      { title: "Enquiries, not engagement", body: "Campaigns are built around booked customers rather than reach, impressions or likes." },
      { title: "Tracking that holds up", body: "Pixel and Conversions API together, so the system optimises on real conversions rather than partial browser data." },
      { title: "Tested, then scaled", body: "Two creatives against each other, refreshed as they fatigue, and budget moved to whatever is actually producing." },
    ],
    measures: ["Cost per lead", "Leads reached", "Appointments booked", "Cost per customer", "Lead quality"],
    faqs: [
      { q: "Why isn't this page full of huge numbers?", a: "Because we only publish results a client has approved and we can stand behind. There's one published campaign below with the real figures. We'd rather show you our method than a wall of numbers you can't check." },
      { q: "Can I see examples for my sector?", a: "On a call we can talk through relevant examples where it's appropriate to do so. What we won't do is present another industry's numbers as though they'll transfer to yours." },
      { q: "How long before I see results?", a: "The first fortnight is volatile while the campaign learns, and the numbers won't mean much. A genuine cost per lead usually emerges around week three, and by day 30 we should know it." },
      { q: "What if my category has advertising restrictions?", a: "Then we declare it properly and build inside the rules. Credit, employment, housing and social issues all sit in Meta's special ad categories, and health and beauty is governed strictly even though it isn't one." },
    ],
    relatedServices: [
      { label: "Meta & Instagram Ads", href: "/services/meta-instagram-ads" },
      { label: "CRM & Automation", href: "/services/crm-automation" },
      { label: "Website Design & Build", href: "/services/web-design" },
    ],
  },
  {
    slug: "google-ads",
    label: "Paid search",
    name: "Google Ads",
    headline: "Google Ads Built Around Intent",
    teaser: "How we approach paid search for UK businesses, and why we measure cost per customer rather than click volume.",
    metaDescription:
      "How Shaz Marketing Group approaches Google Ads for UK businesses. Our method, the metrics that matter, and honest answers about what to expect.",
    keywords: ["Google Ads case study UK", "PPC agency method", "Google Ads management results"],
    method: [
      { title: "Search intent first", body: "Which searches indicate someone ready to buy, and which are research that will never convert." },
      { title: "Negative keywords, continuously", body: "The ongoing work that stops budget draining into searches that were never relevant." },
      { title: "Conversion tracking that works", body: "Calls and form submissions tracked properly, so bidding optimises on outcomes instead of clicks." },
      { title: "Landing page match", body: "The page has to answer what the search asked. Most wasted search budget is lost after the click." },
    ],
    measures: ["Cost per lead", "Conversion rate", "Wasted spend reduced", "Search term quality", "Cost per customer"],
    faqs: [
      { q: "Should I run Google or Meta?", a: "Depends whether people search for what you sell. Emergency trades and garages are search-first. Cleaning, beauty and fitness are usually paid social first, because nobody searches for a service they haven't decided they want." },
      { q: "How much should I budget?", a: "Enough that the campaign gathers data. Below roughly £20 a day most campaigns struggle to learn anything useful, and you end up paying for a test that never finishes." },
      { q: "Do you take a percentage of my ad spend?", a: "No. We charge a fixed monthly fee and the ad spend goes directly to Google from your own account. We never take a cut, because that would mean earning more by telling you to spend more." },
    ],
    relatedServices: [
      { label: "Google Ads", href: "/services/google-ads" },
      { label: "SEO & Local Search", href: "/services/seo" },
      { label: "Website Design & Build", href: "/services/web-design" },
    ],
  },
  {
    slug: "seo",
    label: "Search & organic",
    name: "SEO & Local Search",
    headline: "Getting Found Without Paying Per Click",
    teaser: "How we build local visibility for UK businesses, and why the free Google listing usually matters more than the website.",
    metaDescription:
      "How Shaz Marketing Group approaches SEO and local search for UK businesses. Google Business Profile, citations, content and what we measure.",
    keywords: ["local SEO case study UK", "Google Business Profile results", "SEO agency method"],
    method: [
      { title: "The listing before the website", body: "For a local business the Google Business Profile is seen more than the site, and it's usually the most neglected thing they own." },
      { title: "Consistent details everywhere", body: "Name, address and phone made identical across every directory, including old listings nobody remembers creating." },
      { title: "Reviews, steadily", body: "Recency counts as much as total. A couple a month forever beats thirty in a fortnight then silence." },
      { title: "Content that answers real questions", body: "Written around what people actually search, not stuffed with keywords." },
    ],
    measures: ["Map pack position", "Calls from the listing", "Direction requests", "Review count and recency", "Enquiries from organic"],
    faqs: [
      { q: "How long does SEO take?", a: "Weeks to months, and the timeline isn't within our control. If you need customers this week that's an advertising job, and we'd say so rather than take your money for something that can't move fast enough." },
      { q: "Can you guarantee a number one ranking?", a: "No, and nobody honest can. Google doesn't sell positions and anyone promising one is either guessing or misleading you." },
      { q: "Is it worth it for a small local business?", a: "The Google listing almost always is, because it costs nothing but time and keeps working after you stop. Broader SEO depends on whether people search for what you sell in your area." },
    ],
    relatedServices: [
      { label: "SEO & Local Search", href: "/services/seo" },
      { label: "Website Design & Build", href: "/services/web-design" },
      { label: "Social Media Management", href: "/services/social-media-management" },
    ],
  },
  {
    slug: "websites",
    label: "Web design",
    name: "Websites That Convert",
    headline: "Websites Built Around the Enquiry",
    teaser: "How we build sites for UK businesses, and why we judge them on form completions rather than how they look.",
    metaDescription:
      "How Shaz Marketing Group builds websites for UK businesses. Mobile-first, fast, tracked from day one, and built around getting enquiries.",
    keywords: ["website design case study UK", "landing page conversion", "web design method"],
    method: [
      { title: "One job per page", body: "Somebody arriving from an advert has one decision to make. Everything else on the page is a way out." },
      { title: "Fast on a phone", body: "Which is where nearly all advertising traffic lands, and where most sites are slowest." },
      { title: "Tracking from day one", body: "Pixel, Conversions API, Analytics and Search Console installed and verified, with a proper thank you page so conversions are measurable." },
      { title: "Yours, not ours", body: "Your domain, your hosting, your content. Nothing held hostage if you leave." },
    ],
    measures: ["Form completion rate", "Mobile load speed", "Bounce from ad traffic", "Cost per enquiry", "Enquiries reached"],
    faqs: [
      { q: "What does a website cost?", a: "From £300 for a build. It's included at no cost on our monthly plans, because a site that doesn't convert makes the advertising harder and that's our problem too." },
      { q: "Do I own the site and the domain?", a: "Yes, both. We set them up in your name on your own accounts. If we ever stopped working together nothing moves and nothing switches off." },
      { q: "Can you work with my existing site?", a: "Usually. If it's fundamentally sound we'd rather fix the tracking and the enquiry route than rebuild something that works." },
    ],
    relatedServices: [
      { label: "Website Design & Build", href: "/services/web-design" },
      { label: "Meta & Instagram Ads", href: "/services/meta-instagram-ads" },
      { label: "CRM & Automation", href: "/services/crm-automation" },
    ],
  },
];

export function getApproach(slug: string) {
  return approaches.find((a) => a.slug === slug);
}
