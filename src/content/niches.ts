/**
 * Automotive niche pages.
 *
 * These exist because the broad industry pages cannot do this job. "Automotive"
 * covers a valeter charging twenty pounds and a PPF studio charging three
 * thousand, and almost nothing true about advertising one is true about the
 * other. Somebody searching "marketing for window tinting" wants to read about
 * window tinting.
 *
 * Everything in here comes from work actually done: scanning these businesses'
 * websites and Google listings, reading their published price lists, and the
 * named client results on our own case studies page. Where a figure appears it
 * is either a client's own published price or a range we have seen across the
 * businesses we have looked at, and the pages say which. Nothing is invented,
 * and no business is named as an example of something done badly — the
 * patterns are described, the companies are not.
 */

export type Niche = {
  slug: string;
  /** Used in the page title and headings. */
  name: string;
  /** What these businesses call themselves, for the intro line. */
  trade: string;
  metaDescription: string;
  keywords: string[];
  /** The opening argument. Two or three paragraphs. */
  intro: string[];
  /** What the work sells for, from prices we have actually seen published. */
  priceReality: string;
  /** How the customer decides, which is what picks the channel. */
  buyingBehaviour: string;
  /** Which platform to lead with, and the honest reason. */
  channel: { lead: string; body: string };
  /** What we keep finding wrong when we scan these businesses. */
  commonGaps: { title: string; body: string }[];
  /** Specific tactics for this trade. */
  whatWorks: { title: string; body: string }[];
  /** Points at a real result on our case studies page, when there is one. */
  proof?: { client: string; slug: string; headline: string };
};

export const niches: Niche[] = [
  {
    slug: "car-detailing",
    name: "Car Detailing & Valeting",
    trade: "detailing and valeting businesses",
    metaDescription:
      "Marketing and Google Ads for car detailing and valeting businesses in the UK. What these jobs are worth, how customers choose, and what we keep finding broken.",
    keywords: [
      "marketing for car detailing",
      "car detailing marketing agency",
      "advertising for mobile valeting",
      "Google Ads for detailing business",
    ],
    intro: [
      "Detailing is a volume trade with a repeat customer at the end of it, and that changes what good advertising looks like. A tinting job happens once. A ceramic coating might happen once in three years. A monthly maintenance wash happens twelve times a year, and the customer who books it is worth many times what the first job was.",
      "Most detailing advertising is built as though every job is a one-off. It is not, and the businesses that understand that spend less to get more work.",
    ],
    priceReality:
      "Across the detailing and valeting businesses we have scanned, published prices run from around £20 for a basic mobile wash up to a few hundred for a full detail, with ceramic coating packages sitting higher again. The average job is small compared to tinting or paint protection, which means volume and repeat work matter far more than any single booking.",
    buyingBehaviour:
      "Fast and local. Somebody wants their car done this week, usually within a short drive, and price is visible early in the decision. They are not researching for a fortnight. That makes this one of the few automotive trades where search advertising and a well-kept Google listing do most of the work on their own.",
    channel: {
      lead: "Google and your Google Business Profile first",
      body: "People search for this by name and place — detailing, valeting, your town — and they book quickly. That is exactly what search advertising is for. Social works too, but as the thing that keeps you in front of past customers for the next clean rather than as the first touch.",
    },
    commonGaps: [
      {
        title: "No way to book without ringing",
        body: "Almost every detailing site we scan has a phone number and nothing else. For a fixed-price, fixed-slot job, that is the easiest booking in the automotive trade to put online, and the hardest one to justify making people phone for.",
      },
      {
        title: "Listed on Google as the wrong thing",
        body: "We regularly find valeting businesses filed under car wash, and detailers filed under categories that have nothing to do with the work. The primary category on a Google Business Profile decides which searches a business appears in at all. It takes two minutes to change and most people have never looked at it.",
      },
      {
        title: "Nothing in place to bring a customer back",
        body: "This is the expensive one. A detailer who cleaned a car in March has no system to put an offer in front of that person in June. No list, no reminder, no retargeting audience. Every month starts from zero.",
      },
    ],
    whatWorks: [
      {
        title: "Advertise the maintenance plan, not the one-off",
        body: "A monthly or quarterly plan changes the maths of the whole business. It also gives you something to advertise that nobody else in your town is advertising.",
      },
      {
        title: "Film the work, not the finished car",
        body: "Everyone posts the finished car. The thing people actually watch is the dirt coming off — the before, the machine, the half-and-half panel.",
      },
      {
        title: "Put your prices up",
        body: "On the website, not in a private message. Stating from-prices filters out the people who were never going to book and saves you answering the same question forty times a week.",
      },
      {
        title: "Keep the radius tight",
        body: "A mobile detailer advertising across a whole county spends half their day driving. Advertise the area you want to work in, not the area you are willing to reach.",
      },
    ],
    proof: {
      client: "Detailmatics",
      slug: "detailmatics",
      headline: "150+ customers through the door on £913 of ad spend.",
    },
  },

  {
    slug: "window-tinting",
    name: "Window Tinting",
    trade: "window tinting specialists",
    metaDescription:
      "Marketing and Google Ads for window tinting businesses in the UK. Real price points, why tinting customers decide fast, and the gaps we keep finding.",
    keywords: [
      "marketing for window tinting",
      "window tinting advertising UK",
      "Google Ads for car tinting",
      "tinting business marketing agency",
    ],
    intro: [
      "Tinting has a property most automotive work does not: the customer has usually just bought the car. The decision is made within days of collection, it is emotional rather than researched, and the person wants it done now.",
      "That urgency is the whole opportunity. It also means that if a competitor is quoting a two-week wait, being able to say booked in this week beats being ten pounds cheaper.",
    ],
    priceReality:
      "From the tinting businesses whose published price lists we have read, a full car typically sits between £170 and £220 depending on film, rear windows around £130 to £175, and front pairs around £80 to £100. Ceramic films sit at the top of those ranges. Prices are usually public, which makes the market unusually price-transparent for automotive work.",
    buyingBehaviour:
      "Quick. Days rather than weeks, often triggered by a new car. People compare two or three local shops on price and availability, and availability wins more often than anyone expects.",
    channel: {
      lead: "Google Ads, with availability in the advert",
      body: "This is one of the strongest search-advertising trades in automotive, because the intent is immediate and local. The advert that works is rarely the cheapest one — it is the one that answers can you do it this week.",
    },
    commonGaps: [
      {
        title: "No enquiry form anywhere on the site",
        body: "Phone and WhatsApp only is the norm. Plenty of people will not ring a business they have never used, especially in the evening, which is when most of this browsing happens. They leave instead.",
      },
      {
        title: "Google listing in a category that is not tinting",
        body: "We have scanned tinting specialists filed under car repair and maintenance, under car wash, and under manufacturer. Every one of those is a business missing from the searches it most wants to appear in.",
      },
      {
        title: "Five-star reviews that live only on Google",
        body: "A tinting shop with thirty perfect reviews and none of them on its own website is throwing away its best argument at the exact moment somebody is deciding.",
      },
    ],
    whatWorks: [
      {
        title: "Sell the slot, not the discount",
        body: "When the competition is booked out, availability is the offer. Nothing else in the advert works as hard.",
      },
      {
        title: "Put the from-price in the advert",
        body: "This market is price-transparent anyway. Stating it early stops you paying for clicks from people shopping at half your price.",
      },
      {
        title: "Name the film",
        body: "Ceramic, premium, standard. Buyers researching tint learn the difference quickly, and a shop that explains it reads as the one that knows what it is doing.",
      },
      {
        title: "Legality questions are free traffic",
        body: "What percentage is legal on the front windscreen is one of the most searched questions in this trade. Answering it properly brings in people who then need the work doing.",
      },
    ],
    proof: {
      client: "Executive Tints & Repairs",
      slug: "executive-tints",
      headline: "540 enquiries at £2.50 each, and over 300 cars booked in.",
    },
  },

  {
    slug: "vehicle-wrapping",
    name: "Vehicle Wrapping",
    trade: "vehicle wrapping specialists",
    metaDescription:
      "Marketing and Google Ads for vehicle wrapping businesses in the UK. How wrap customers decide, what the work sells for, and why price belongs in the advert.",
    keywords: [
      "marketing for vehicle wrapping",
      "car wrapping advertising UK",
      "Google Ads for car wraps",
      "wrapping business marketing",
    ],
    intro: [
      "Wrapping sits awkwardly between the quick jobs and the considered ones. The work is visual enough to sell on social, expensive enough that nobody books on impulse, and searched for often enough that Google genuinely works — which is unusual.",
      "The thing that catches wrapping businesses out is price. Colour change wraps vary enormously by vehicle and finish, so most shops put no price on the website at all. That is a mistake once you are paying for clicks.",
    ],
    priceReality:
      "Full colour change wraps vary too much by vehicle and film to quote a single figure honestly, and most wrapping businesses we have looked at publish no price at all. Part wraps, de-chroming and roof or detail work sit far lower and are where a lot of first jobs come from. If you are going to advertise, you need a from-price for at least one of those entry jobs before the campaign goes live.",
    buyingBehaviour:
      "Weeks, not days. People save pictures, ask in forums, look at your Instagram repeatedly, and come back. A single visit almost never becomes a booking, which makes the ability to reach somebody again the most valuable thing you can set up.",
    channel: {
      lead: "Google for the search, social for the deciding",
      body: "Unlike paint protection, people genuinely search for car wrapping and colour change wraps. So Google catches them. But the decision happens over the following fortnight on Instagram, which only works if a pixel was installed before the campaign started.",
    },
    commonGaps: [
      {
        title: "No price anywhere on the wrapping page",
        body: "Understandable, because the number varies. But an advert with no price is clicked by everyone, including the person with four hundred pounds who was never going to book. On a small budget that is where the money goes.",
      },
      {
        title: "No tracking pixel, so no second chance",
        body: "For a purchase people think about for weeks, not being able to reach somebody who already looked is the single biggest leak in the business. We find sites with no pixel at all surprisingly often, including ones that have spent money on advertising before.",
      },
      {
        title: "The gallery is the business, and it is buried",
        body: "Wrapping is sold on photographs. The work is often the strongest thing a wrapping company has and it is two clicks from the homepage behind a menu.",
      },
    ],
    whatWorks: [
      {
        title: "Lead with an entry job",
        body: "De-chroming, a roof, mirrors, a part wrap. Something with a real from-price that gets a car on the ramp and a customer who has now met you.",
      },
      {
        title: "Retargeting is not optional here",
        body: "Weeks of consideration means the first advert rarely closes anyone. The campaign that works is the one that keeps appearing while they decide.",
      },
      {
        title: "Show the same car before and after, in one clip",
        body: "Colour change is the most dramatic thing in the whole automotive trade. Edited into two seconds it stops people mid-scroll in a way almost nothing else does.",
      },
      {
        title: "Say how long the car is with you",
        body: "It is the second question every customer asks and almost no wrapping website answers it.",
      },
    ],
  },

  {
    slug: "paint-protection-film",
    name: "Paint Protection Film",
    trade: "PPF installers",
    metaDescription:
      "Marketing for paint protection film installers in the UK. Why PPF does not behave like other automotive work, and what to advertise instead.",
    keywords: [
      "marketing for PPF installers",
      "paint protection film advertising",
      "PPF marketing agency UK",
      "advertising for ceramic coating and PPF",
    ],
    intro: [
      "Paint protection is the highest-value work in automotive detailing and the hardest to advertise, for one reason: almost nobody searches for it the way they search for tinting.",
      "A customer with a new Porsche is not typing paint protection film into Google on a Tuesday afternoon and booking by Friday. They are being shown it, usually by someone they already trust, and then thinking about it for a month. Advertising that ignores that burns money quickly.",
    ],
    priceReality:
      "From published price lists we have read, front end coverage commonly starts around £1,200 and full car coverage around £3,000, with windscreen and headlight protection sitting in the low hundreds. The entry products matter more than they look — a £180 headlight job is often how a £3,000 customer first walks through the door.",
    buyingBehaviour:
      "The longest consideration in the trade. Weeks, sometimes months, usually attached to a new or newly acquired car. Trust does most of the work, which is why reviews, photographs of recognisable cars and a visible installer matter more here than a clever advert.",
    channel: {
      lead: "Social for the demand, search for the entry jobs",
      body: "Full-car PPF is sold on Instagram, by showing the work and by being followed for weeks before anyone enquires. Search advertising earns its place on the smaller, more urgent jobs — windscreen protection, headlight film — and on the people already searching for your town plus PPF.",
    },
    commonGaps: [
      {
        title: "Nothing installed to measure anything",
        body: "We have scanned PPF businesses with genuinely good websites, excellent Google listings, and no tracking of any kind. For a trade with a weeks-long decision, that means every person who looked and left is gone permanently.",
      },
      {
        title: "Selling only the top job",
        body: "Sites that lead with full-car coverage and bury the cheap entry products make the first purchase as large and frightening as possible.",
      },
      {
        title: "No finance mentioned, when finance exists",
        body: "Several PPF businesses offer payment plans and never say so in the advertising. On a three thousand pound job, how it can be paid for is not a detail.",
      },
    ],
    whatWorks: [
      {
        title: "Advertise the cheap job to get the expensive one",
        body: "Headlight film and windscreen protection are low-risk first purchases. The customer who is happy with one is the warmest full-car lead you will ever get.",
      },
      {
        title: "Name the cars",
        body: "Porsche, Range Rover, whatever is actually in your unit. People search by their own car, and a page about their model reads as a business that has done it before.",
      },
      {
        title: "Install the tracking before spending anything",
        body: "With a decision this slow, retargeting is the campaign. Without a pixel there is nothing to retarget and the budget is spent on first impressions alone.",
      },
      {
        title: "Show the installer",
        body: "This is craft work at a serious price. People are buying the person's hands, and a face in the content converts better than another photograph of a bonnet.",
      },
    ],
  },

  {
    slug: "vehicle-security",
    name: "Trackers & Vehicle Security",
    trade: "tracker and immobiliser installers",
    metaDescription:
      "Marketing and Google Ads for tracker, Ghost immobiliser and vehicle security installers. The most search-driven work in automotive, and why.",
    keywords: [
      "marketing for tracker installers",
      "Ghost immobiliser advertising",
      "Google Ads for vehicle security",
      "Thatcham tracker marketing",
    ],
    intro: [
      "If you only advertise one part of an automotive business on Google, make it this one.",
      "Vehicle security is the rare automotive job with genuine urgency attached to it, and the urgency comes from somewhere outside the customer's control: an insurer has told them they need a Thatcham-approved tracker before cover starts, or a car like theirs has just been taken locally. Both produce someone who searches today and books this week.",
    ],
    priceReality:
      "From published prices we have read, S5 trackers commonly sit around £600 fitted, deadlock variants nearer £800, and combined installations in the £850 to £900 range, usually including a year of subscription. Ghost immobilisers and dashcam installation sit alongside. These are well-defined products at well-defined prices, which is exactly what search advertising handles best.",
    buyingBehaviour:
      "Immediate, and often deadline-driven. An insurance requirement comes with a date attached. These customers are not browsing — they are solving a problem this week, and whoever answers first and can fit them soonest usually gets it.",
    channel: {
      lead: "Google Ads, clearly",
      body: "Named products, high intent, a deadline, and people typing the exact thing they need. Ghost immobiliser, Thatcham S5, insurance approved tracker. There is no automotive work better suited to search advertising, and most installers are not bidding on it.",
    },
    commonGaps: [
      {
        title: "Security buried under the detailing work",
        body: "Plenty of businesses offer both and present security as an afterthought. It is usually the faster-paying half and deserves its own pages and its own campaign.",
      },
      {
        title: "Not naming the approvals",
        body: "Thatcham, S5, S7, insurance approved. These are the words customers are told to look for by their insurer, and a page that does not use them does not match what is being searched.",
      },
      {
        title: "No online booking for a fixed-price fit",
        body: "A tracker install is a known price and a known slot. It is one of the few automotive jobs that can be booked entirely online, and almost nobody offers it.",
      },
    ],
    whatWorks: [
      {
        title: "Advertise the insurance requirement",
        body: "The advert that works speaks to the position the customer is in: their policy needs it, there is a date, and you can fit it before then.",
      },
      {
        title: "Separate campaigns by product",
        body: "Someone searching Ghost immobiliser and someone searching S5 tracker want different pages. One campaign covering both serves neither well.",
      },
      {
        title: "Answer the approval questions in writing",
        body: "Which category does my insurer need, what is the difference between S5 and S7, does it need a subscription. These searches bring in people who then need fitting.",
      },
      {
        title: "Say how soon you can fit it",
        body: "With a deadline involved, this is the detail that decides it.",
      },
    ],
    proof: {
      client: "Alliance Security Group",
      slug: "alliance-security-group",
      headline:
        "9 clients signed in the first three months, from search alone.",
    },
  },

  {
    slug: "garages-and-mot",
    name: "Garages & MOT Centres",
    trade: "independent garages and MOT centres",
    metaDescription:
      "Marketing and Google Ads for independent garages and MOT centres. Why your Google listing matters more than your website, and what to do about it.",
    keywords: [
      "marketing for garages",
      "MOT centre advertising",
      "Google Ads for car garage",
      "garage marketing agency UK",
    ],
    intro: [
      "A garage is a local monopoly or it is nothing. Almost nobody drives past three closer garages to reach yours, which means your entire market is the people within a few miles who need something doing this week.",
      "That makes garage marketing unusually simple to describe and unusually easy to get wrong. The Google Business Profile does most of the work. The website supports it. Everything else is secondary.",
    ],
    priceReality:
      "MOT pricing is capped by the DVSA, so the test itself is rarely where competition happens. The money is in what follows — servicing, repairs, tyres, diagnostics — and in whether the customer comes back next year rather than going wherever is cheapest. That changes what is worth advertising.",
    buyingBehaviour:
      "Urgent and extremely local. A warning light, a failed MOT, a noise that was not there yesterday. People search, look at the map results, read a couple of reviews and ring. The whole decision can take four minutes.",
    channel: {
      lead: "Google Business Profile first, Google Ads second",
      body: "For a garage the map results are the market. A listing with recent reviews, correct hours and real photographs will outperform a paid campaign pointing at a weak profile. Fix the listing, then advertise.",
    },
    commonGaps: [
      {
        title: "Opening hours that are not true",
        body: "The single most damaging thing on a garage listing. Somebody who drives over on a Saturday because Google said you were open does not come back, and often says so publicly.",
      },
      {
        title: "Reviews that stopped two years ago",
        body: "A garage with forty reviews, none recent, reads as a business that has gone quiet. People choosing where to take a car they depend on notice.",
      },
      {
        title: "No photographs of the actual place",
        body: "People want to see where they are leaving their car. A listing with a logo and nothing else gives them no reason to pick it over the one with twenty photographs of the workshop.",
      },
    ],
    whatWorks: [
      {
        title: "Ask for a review at handover, every time",
        body: "Not by email the next day. At the counter, when the customer is relieved and the car is fixed.",
      },
      {
        title: "Advertise the MOT, earn on the rest",
        body: "The test brings people in. The relationship is what pays. Advertising built around the first and not the second undersells the business.",
      },
      {
        title: "A tiny radius",
        body: "Three or four miles. Advertising to people who will never drive to you is the most common way garages waste a budget.",
      },
      {
        title: "Set a reminder for next year",
        body: "An MOT has a date on it twelve months out. A garage that contacts a customer two weeks before it expires books a significant share of them without paying for a click.",
      },
    ],
  },

  {
    slug: "used-car-dealers",
    name: "Used Car Dealers",
    trade: "independent used car dealers",
    metaDescription:
      "Marketing and Google Ads for independent used car dealers in the UK. Why stock, speed of reply and finance matter more than clever advertising.",
    keywords: [
      "marketing for used car dealers",
      "car dealership advertising UK",
      "Google Ads for car dealers",
      "independent dealer marketing",
    ],
    intro: [
      "A dealer's advertising problem is different from everyone else's in this list, because the product changes every week. You are not advertising a service you will still offer in March. You are advertising fourteen specific cars, some of which will be gone by Friday.",
      "That makes dealer marketing a logistics problem as much as a creative one, and it is why so much dealer advertising is wasted on cars that have already sold.",
    ],
    priceReality:
      "Margin per unit varies enormously and dealers know their own numbers better than any agency does. What matters for advertising is that a single sale usually covers a month of marketing many times over, which means the tolerance for a higher cost per enquiry is far greater here than anywhere else in automotive. The constraint is almost never budget. It is how fast enquiries get answered.",
    buyingBehaviour:
      "Researched then sudden. People look for weeks across the big portals, then act quickly when the right car appears. They enquire with several dealers the same evening, and whoever replies first is in front. Most of this happens after six in the evening.",
    channel: {
      lead: "Social for the stock, search for the dealership",
      body: "Individual cars perform on Facebook and Instagram, where people scroll rather than search. Search advertising works better for the dealership itself — your name, your town, finance, part exchange — rather than for specific vehicles that may sell before the campaign learns anything.",
    },
    commonGaps: [
      {
        title: "Nobody answering in the evening",
        body: "Car enquiries arrive at night. A dealer who replies at nine the next morning has lost to the one who replied at nine the night before, and no amount of advertising fixes that.",
      },
      {
        title: "Adverts still running for sold cars",
        body: "Money spent on a vehicle that left the forecourt last week, and a customer who arrives annoyed.",
      },
      {
        title: "Finance mentioned nowhere",
        body: "A large share of buyers are deciding on the monthly figure rather than the sticker price. A dealer not saying so in the advert is invisible to them.",
      },
    ],
    whatWorks: [
      {
        title: "Answer within minutes, including evenings",
        body: "This is the whole game for a dealer. Everything else is optimisation around it.",
      },
      {
        title: "Advertise the dealership as well as the cars",
        body: "Stock campaigns start again every time the stock turns. Campaigns for your name, part exchange and finance keep working.",
      },
      {
        title: "Film the walkaround on a phone",
        body: "Buyers want to see the wheels, the interior and the bits a photographer would hide. A two-minute honest walkaround beats a gallery of flattering stills.",
      },
      {
        title: "Lead with the monthly figure where you can",
        body: "Within the rules that apply to advertising finance, a monthly number reaches buyers that a total price never will.",
      },
    ],
  },
];

export function getNiche(slug: string) {
  return niches.find((n) => n.slug === slug);
}

export type Faq = { question: string; answer: string };

/**
 * The questions these pages get asked, answered on the page and marked up as
 * FAQPage so the answer can be lifted whole.
 *
 * Kept beside the niche content rather than in the component, because every
 * figure in here has to stay in step with the published pricing and with what
 * the page itself argues. Nothing is answered here that is not true elsewhere
 * on the site, and where the honest answer is "probably not worth it" or "we
 * would be guessing", that is what it says — an FAQ that only ever sells is
 * the kind nobody trusts and models have no reason to quote.
 */
export const nicheFaqs: Record<string, Faq[]> = {
  "car-detailing": [
    {
      question: "How much does it cost to advertise a car detailing business?",
      answer:
        "Google Ads management is £600 a month and local SEO is £350 a month, with no setup fee either way. Your advertising budget is separate and you pay it to Google directly on your own card, so we never hold your ad money. Which of the two is right depends on what your Google listing looks like now, and the free audit tells you that before you spend anything.",
    },
    {
      question: "Should a detailer use Google Ads or Facebook ads?",
      answer:
        "Google first, and your Google Business Profile before that. Someone searching car detailing near me has already decided they want the work done and is choosing who does it. Social is where you show finished cars and build a name, which matters, but it is the second move rather than the first.",
    },
    {
      question: "Is advertising worth it for mobile valeting?",
      answer:
        "Often not, and we would rather say so. Published valeting prices commonly start around £20, and at that ticket paid clicks are hard to justify. The Google Business Profile costs nothing and usually does more. If the audit says that is your situation, that is what the audit will say.",
    },
    {
      question: "Do I need a website before I can run ads?",
      answer:
        "Google Ads needs somewhere for the click to land, so yes for ads. We build sites from £300 one-off. If money is tight, a properly filled out Google Business Profile with real photos and current prices does a surprising amount of the job first.",
    },
  ],
  "window-tinting": [
    {
      question: "How much does Google Ads cost for a window tinting business?",
      answer:
        "Management is £600 a month with no setup fee. Your ad budget is separate and goes straight to Google on your own card. The account is opened in your name with us added as a manager, so if you ever leave you keep the account and everything it has learned.",
    },
    {
      question: "What should a window tinting advert actually say?",
      answer:
        "When you can fit them in. Most tinting enquiries are someone asking whether you can do it this week, so availability and a price band in the advert itself filter out the people who were never going to book and stop you paying for those clicks.",
    },
    {
      question: "Is advertising worth it at tinting prices?",
      answer:
        "The price lists we have read put a full car somewhere between £170 and £250, which is a different equation from valeting. At that ticket a handful of jobs covers the month. The harder question is usually whether the enquiries you already get are being answered quickly enough.",
    },
    {
      question: "Do you only work with tinters in London?",
      answer:
        "No. Our office is at Level 39, One Canada Square in Canary Wharf, but the work runs remotely and we take on tinting businesses anywhere in the UK.",
    },
  ],
  "vehicle-wrapping": [
    {
      question: "How much does marketing for a vehicle wrapping business cost?",
      answer:
        "Google Ads management is £600 a month and Meta and Instagram ads start at £499 a month. Both are management only, with no setup fee, and your advertising budget is paid to the platform directly by you. Most wrappers end up wanting both eventually, but there is no need to start with both.",
    },
    {
      question: "Google or Instagram for vehicle wrapping?",
      answer:
        "They do different jobs. Search catches someone who has already decided to get a wrap and is looking for an installer. Instagram is where they decide whether it is you, because a wrap is bought with the eyes. Starting with search and adding social once there is work to show tends to be the cheaper order.",
    },
    {
      question: "Why will you not quote me a cost per lead?",
      answer:
        "Because we would be making it up. Wrap pricing varies too much by vehicle, film and finish for a single figure to mean anything, and we have not seen your numbers. Anyone quoting you a cost per lead before looking at your business is guessing, and you should treat it that way.",
    },
    {
      question: "Should I put prices on my wrapping website?",
      answer:
        "Most of the wrapping sites we scan do not publish any starting figure, which leaves someone with no idea whether they are looking at a £1,000 job or a £4,000 one. A from price does not commit you to anything and it stops you quoting people who were never in the market.",
    },
  ],
  "paint-protection-film": [
    {
      question: "How much does it cost to advertise a PPF business?",
      answer:
        "Google Ads management is £600 a month, no setup fee, with your ad budget paid separately to Google by you. For a business whose published prices commonly start around £1,200 for front end coverage, one job more than covers a month of management.",
    },
    {
      question: "Is Google Ads too expensive for paint protection film?",
      answer:
        "It is the ticket that decides that, not the click price. PPF sits at the top end of what these pages cover, and a click costing a few pounds reads very differently against a £1,200 job than it does against a £25 valet. The real cost is usually enquiries that go unanswered, not clicks.",
    },
    {
      question: "How long until it pays for itself?",
      answer:
        "We are not going to put a date on it, because it depends on your close rate and your prices and we would be guessing. What we can tell you is what we would change first and why, and you can judge the rest from the numbers once they exist.",
    },
    {
      question: "Do you work with PPF installers outside London?",
      answer:
        "Yes, anywhere in the UK. We are based at Level 39, One Canada Square in Canary Wharf, and everything runs over calls, screen shares and reporting.",
    },
  ],
  "vehicle-security": [
    {
      question:
        "How much does it cost to advertise a tracker fitting business?",
      answer:
        "Google Ads management is £600 a month with no setup fee, and your ad budget goes to Google directly on your own card. Published tracker prices we have read commonly sit around £600 fitted, so the arithmetic is straightforward.",
    },
    {
      question: "Why Google rather than social for trackers and immobilisers?",
      answer:
        "Because of why people buy one. It is usually an insurer asking for it, or a car taken from a street nearby. Both of those send someone straight to a search with a specific requirement. Very few people decide to buy a tracker while scrolling.",
    },
    {
      question: "Should the advert mention what I am approved to fit?",
      answer:
        "Yes, plainly, on the advert and on the page it lands on. People are often sent by an insurer having been told exactly what they need, and if your page does not state what you fit they have no way to tell whether you are the right installer and will simply try the next one.",
    },
    {
      question: "Do you work with installers across the UK?",
      answer:
        "Yes. Our office is in Canary Wharf but the work is remote, and vehicle security is one of the sectors we have a named client result on.",
    },
  ],
  "garages-and-mot": [
    {
      question: "How much does marketing cost for an independent garage?",
      answer:
        "Local SEO is £350 a month and Google Ads management is £600 a month, neither with a setup fee. For most garages the listing work comes first, because that is where people searching for a garage near me actually choose from.",
    },
    {
      question: "Why fix the Google listing before running ads?",
      answer:
        "Because someone looking for a garage picks off the map, and a listing with no photos, old opening hours or unanswered reviews loses that comparison before any advert gets a chance. Ads into a weak listing are just a more expensive way to lose.",
    },
    {
      question: "Should I advertise my MOT price?",
      answer:
        "It is a poor thing to compete on. The test fee is capped by the DVSA, so everybody is within a few pounds of everybody else and the money is in what the test finds afterwards. Advertising on the test alone tends to buy you the customers least likely to come back.",
    },
    {
      question: "Will this bring in the wrong kind of work?",
      answer:
        "It can, and that is the thing to watch rather than the lead count. If the enquiries coming in are jobs you do not want, the adverts and the landing pages are the place that gets fixed, not the budget.",
    },
  ],
  "used-car-dealers": [
    {
      question: "How much does it cost to advertise a used car dealership?",
      answer:
        "Meta and Instagram ads start at £499 a month and Google Ads management is £600 a month, both management only with your ad budget paid directly to the platform. Which way round depends on whether you are trying to move specific stock or build the dealership name.",
    },
    {
      question: "Should I advertise individual cars or the dealership?",
      answer:
        "Both, in different places. Individual cars work on social because people stop for a car they like the look of. The dealership itself is what people search for by name once they have seen it somewhere, and that is where search earns its keep.",
    },
    {
      question: "Does this replace the big car listing sites?",
      answer:
        "No, and we would not suggest it does. Those sites put your stock in front of people already shopping. What this adds is a channel you own, where the audience is yours rather than rented and nobody is showing your buyer three competitors on the same page.",
    },
    {
      question: "Do you work with dealers outside London?",
      answer:
        "Yes, anywhere in the UK. The office is at Level 39, One Canada Square in Canary Wharf and the work runs remotely.",
    },
  ],
};

export function getNicheFaqs(slug: string): Faq[] {
  return nicheFaqs[slug] ?? [];
}
