export type Industry = {
  slug: string;
  name: string;
  teaser: string;
  examples: string[];
  intro: string;
  metaDescription: string;
  keywords: string[];
  whatWorks: { title: string; body: string }[];
  /** Shown as a warning panel where a sector has advertising restrictions. */
  note?: string;
  readMore?: { label: string; href: string };
};

export const industries: Industry[] = [
  {
    slug: "automotive",
    name: "Automotive",
    teaser: "Detailing, tinting, wrapping, trackers, garages and dealers. Our strongest sector, with published numbers behind it.",
    examples: ["Car detailing", "Ceramic coating", "Window tinting", "Vehicle wrapping", "Trackers", "Garages & MOT", "Used car dealers"],
    intro:
      "Automotive is where we have the most published results. Car work photographs well, the jobs are high value, and customers decide quickly — which makes it one of the best fits for paid social there is.",
    metaDescription:
      "Meta and Instagram ads for UK automotive businesses — detailing, ceramic coating, tinting, wrapping, trackers, garages and dealers. Real published results.",
    keywords: ["Facebook ads for car detailing", "Instagram ads automotive UK", "marketing for garages"],
    whatWorks: [
      { title: "The work is the advert", body: "A phone-filmed walkaround of a finished car beats anything polished. You already produce this content every day." },
      { title: "Price it in the ad", body: "Stating from-prices filters out the people who were never going to book and saves you answering the same question forty times." },
      { title: "Tight radius", body: "People travel further for a car than a haircut, but not indefinitely. An hour is usually the sensible ceiling." },
      { title: "Speed wins the job", body: "Car buyers and owners enquire with several places the same evening. Whoever answers first tends to get it." },
    ],
    note: "Advertising finance moves you into Meta's credit special ad category, which must be declared. We'd usually advertise the work and discuss finance after the enquiry.",
    readMore: { label: "Used car dealers vs franchise dealers", href: "/blog/used-car-dealer-meta-ads-strategy" },
  },
  {
    slug: "health-beauty",
    name: "Health, Beauty & Wellness",
    teaser: "Salons, clinics, aesthetics and treatment rooms — the sector with the strictest advertising rules and the biggest upside.",
    examples: ["Nail salons", "Hair salons", "Barbers", "Beauty clinics", "Aesthetics", "Physiotherapy", "Lash & brow"],
    intro:
      "Few sectors suit Instagram better and few are governed more strictly. The most persuasive material a clinic owns — the transformation photo, the line that names an insecurity — is exactly what the platform prohibits.",
    metaDescription:
      "Meta and Instagram ads for UK salons, clinics and beauty businesses. What you can advertise, what gets rejected, and what works instead.",
    keywords: ["Instagram ads for salons", "Facebook ads beauty clinic UK", "marketing for nail salons"],
    whatWorks: [
      { title: "Show the room, not the result", body: "People are deciding whether they'd feel comfortable walking in. That's the thing to answer." },
      { title: "The practitioner on camera", body: "In treatment businesses the person is the product. Nobody books a logo." },
      { title: "Publish your prices", body: "In a sector where prices are usually hidden, showing yours is a genuine differentiator." },
      { title: "Answer evening enquiries", body: "Appointment businesses get enquiries after hours, when the team was with clients all day." },
    ],
    note: "Before-and-after imagery is prohibited for body and health transformations, and copy must never imply you know something about the reader's appearance or health.",
    readMore: { label: "Meta & Instagram ads for health, beauty & wellness", href: "/blog/meta-instagram-ads-health-beauty-wellness" },
  },
  {
    slug: "hospitality",
    name: "Restaurants & Hospitality",
    teaser: "Independents, cafés, takeaways and venues. Filling quiet nights rather than shouting into the void.",
    examples: ["Restaurants", "Cafés", "Takeaways", "Bars", "Function venues", "Caterers"],
    intro:
      "Hospitality advertising usually fails for the same reason: it advertises the restaurant rather than a reason to come this week. The gap you're filling is a specific quiet night, not general awareness.",
    metaDescription:
      "Meta and Instagram ads for UK restaurants, cafés and hospitality businesses. Filling midweek tables and turning enquiries into bookings.",
    keywords: ["Instagram ads for restaurants UK", "Facebook ads for cafes", "restaurant marketing UK"],
    whatWorks: [
      { title: "Advertise the quiet night", body: "Midweek covers, a set menu, a new chef. Something to act on now rather than a general reminder you exist." },
      { title: "Food filmed simply", body: "Phone footage of a dish being made outperforms a professional shoot more often than anyone expects." },
      { title: "Very tight radius", body: "People will not cross a city for a midweek dinner. A few miles is usually the whole market." },
      { title: "Bookings, not likes", body: "A campaign optimised for engagement fills your comments. One optimised for enquiries fills tables." },
    ],
    readMore: { label: "Meta & Instagram ads for restaurants & hospitality", href: "/blog/meta-instagram-ads-for-restaurants-hospitality" },
  },
  {
    slug: "home-trades",
    name: "Home & Trade Services",
    teaser: "Plumbers, electricians, builders, roofers and cleaners. High job values, and most competitors run no ads at all.",
    examples: ["Plumbers", "Electricians", "Builders", "Roofers", "Cleaning companies", "Landscapers", "Installers"],
    intro:
      "Trades split into two completely different jobs: emergency work people search for, and planned work they have been putting off. Paid social is far better at the second, and most of the trade in your area is not advertising at all.",
    metaDescription:
      "Meta and Instagram ads for UK trades — plumbers, electricians, builders, roofers and cleaning companies. Planned work, priced properly.",
    keywords: ["Instagram ads for tradesmen", "Facebook ads for builders UK", "marketing for plumbers"],
    whatWorks: [
      { title: "Advertise planned work", body: "Bathrooms, rewires, driveways, regular cleaning. The jobs people think about for months before acting." },
      { title: "Finished work, filmed on site", body: "Before and after of a job is fine here — the prohibition covers bodies, not bathrooms." },
      { title: "Say what you don't do", body: "Ruling yourself out of small jobs saves you a day a week on the phone." },
      { title: "Answer while you're on the tools", body: "This is the sector where enquiries most often go unanswered, because the owner is up a ladder." },
    ],
    readMore: { label: "Meta & Instagram ads for home & trade services", href: "/blog/meta-instagram-ads-for-trade-home-services" },
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    teaser: "Accountants, solicitors and consultants. Long decisions, high client value, and almost no competition on social.",
    examples: ["Accountants", "Bookkeepers", "Solicitors", "Consultants", "Financial advisers", "Recruiters"],
    intro:
      "Professional services have the highest client values and the longest decisions, which means the follow-up matters more here than almost anywhere. Very few firms advertise on social at all, so the auction is cheap.",
    metaDescription:
      "Meta and Instagram ads for UK accountants, solicitors and consultants. Long sales cycles handled properly, with follow-up that runs itself.",
    keywords: ["Facebook ads for professional services", "lead gen ads for consultants", "marketing for accountants"],
    whatWorks: [
      { title: "Sell the conversation", body: "Nobody appoints an accountant from an advert. They book a call, so advertise the call." },
      { title: "The person, not the firm", body: "Professional services are bought on trust in an individual." },
      { title: "Follow-up over months", body: "Someone enquiring in March may switch in January. A lead chased once is wasted." },
      { title: "Say what you cost", body: "Price transparency is rare in this sector and disproportionately effective." },
    ],
    note: "Recruitment and anything promoting credit fall under Meta's special ad categories and must be declared, which restricts targeting.",
    readMore: { label: "Meta & Instagram ads for professional services", href: "/blog/meta-instagram-ads-for-professional-services" },
  },
  {
    slug: "property",
    name: "Property & Real Estate",
    teaser: "Estate agents, lettings and sourcing. A restricted category that most agencies get wrong.",
    examples: ["Estate agents", "Letting agents", "Property sourcing", "Developers", "Investment property"],
    intro:
      "Property sits in Meta's housing category. Declaring it removes age, gender and interest targeting, which is why so many property campaigns underperform — they were built as though normal rules applied.",
    metaDescription:
      "Meta and Instagram ads for UK estate agents and property businesses. Built correctly inside the housing special ad category rules.",
    keywords: ["Facebook ads for estate agents", "Instagram lead ads property UK", "property marketing agency"],
    whatWorks: [
      { title: "The creative does the qualifying", body: "Town, property type and price in the first line. The wrong people scroll past without registering it." },
      { title: "Vendors are worth more than buyers", body: "Buyer enquiries are cheap and plentiful. Instructions are scarce, and that's where the money is." },
      { title: "Advertise the valuation", body: "For agencies the offer isn't a property, it's a reason to get in touch before they're ready to list." },
      { title: "Follow up for months", body: "Someone requesting a valuation may sell in nine months. Keep them warm." },
    ],
    note: "Housing is a special ad category and must be declared. Returns figures need a clear basis, and nothing may suggest capital is safe.",
    readMore: { label: "Meta & Instagram ads for estate agents and property", href: "/blog/meta-instagram-ads-for-estate-agents-property" },
  },
  {
    slug: "fitness",
    name: "Gyms & Fitness",
    teaser: "Gyms, studios and personal trainers. Where retention decides what you can afford to spend.",
    examples: ["Gyms", "Studios", "Personal trainers", "Class franchises", "Sports clubs"],
    intro:
      "Fitness looks like the easiest thing to advertise and is one of the trickier categories to run, because the most persuasive material is the material the platform prohibits.",
    metaDescription:
      "Meta and Instagram ads for UK gyms and personal trainers. What you can advertise, why free trials backfire, and why retention sets the budget.",
    keywords: ["Facebook ads for gyms UK", "Instagram ads personal trainer", "gym marketing UK"],
    whatWorks: [
      { title: "Film the space when it's quiet", body: "The barrier isn't doubt that training works. It's fear of being the least fit person there." },
      { title: "A small paid trial beats a free one", body: "Free fills the place with people who came for free. A small charge means someone decided." },
      { title: "September, not just January", body: "Everyone bids in January, which makes it the most expensive month of the year." },
      { title: "Fix retention first", body: "A £40 member is worth £120 at three months and £480 at a year. That decides everything." },
    ],
    note: "Before-and-after body imagery is prohibited, and copy must not imply anything about the reader's body or fitness.",
    readMore: { label: "Meta & Instagram ads for gyms and personal trainers", href: "/blog/meta-instagram-ads-for-gyms-personal-trainers" },
  },
  {
    slug: "retail-ecommerce",
    name: "Retail & E-commerce",
    teaser: "Shops and online stores, where the product does the advertising if you let it.",
    examples: ["Online stores", "Independent retail", "Boutiques", "Product brands", "Local shops"],
    intro:
      "Retail is the one sector where the advert can be the product itself. The work is less about persuasion and more about getting the right product in front of the right person often enough to be remembered.",
    metaDescription:
      "Meta and Instagram ads for UK retail and e-commerce businesses. Product-led campaigns, retargeting and tracking that survives ad blockers.",
    keywords: ["Instagram shopping ads UK", "Facebook ads for online store", "ecommerce ads agency UK"],
    whatWorks: [
      { title: "Lead with the product", body: "Clean, well-lit, in use. The product is more persuasive than anything written about it." },
      { title: "Retargeting earns its keep here", body: "Most people don't buy on the first visit. This is the cheapest traffic you'll ever buy." },
      { title: "Tracking matters more", body: "Purchase values feed the system. Without the Conversions API you're optimising on partial data." },
      { title: "Plan for Q4 costs", body: "UK ad costs rise sharply through November. Build audiences in October while they're cheaper." },
    ],
    readMore: { label: "What £300 a month on Meta ads actually buys you", href: "/blog/what-300-a-month-on-meta-ads-buys-you" },
  },
];

export function getIndustry(slug: string) {
  return industries.find((i) => i.slug === slug);
}
