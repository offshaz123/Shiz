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
    slug: "what-makes-ad-creative-actually-convert",
    title: "What Makes Ad Creative Actually Convert (Not Just Get Likes)",
    description:
      "Creative is the biggest lever you control on Meta ad performance. Here's what separates an ad that collects likes from one that generates real enquiries.",
    publishedAt: "2026-08-11",
    keywords: [
      "Facebook ad creative best practices",
      "Meta ad creative that converts",
      "Instagram ad design tips",
      "why are my Facebook ads not converting",
    ],
    sections: [
      {
        paragraphs: [
          "It's a frustrating and surprisingly common situation: an ad performs beautifully by every visible measure — plenty of likes, a few shares, some nice comments — and generates almost no enquiries. Meanwhile a plainer ad nobody engaged with quietly brings in a steady stream of leads.",
          "This isn't bad luck. Engagement and conversion are two different outcomes, and the creative that produces one often isn't the creative that produces the other. Understanding that difference matters more than it used to, because as Meta's targeting has become increasingly automated, creative has become the main lever an advertiser actually controls.",
        ],
      },
      {
        heading: "Likes are a signal, not a goal",
        paragraphs: [
          "A like costs the viewer nothing. Filling in a form, sending a message, or picking up the phone costs them time and a small amount of commitment. Those are different psychological acts, and an ad optimised to earn the first often doesn't earn the second.",
          "Entertaining, relatable or funny creative tends to collect engagement broadly — including from people who will never be customers. Creative that converts tends to be narrower: it speaks directly to someone with a specific problem, and it's perfectly happy to be ignored by everyone else. A lower engagement rate with a lower cost per enquiry is a better ad, even though it looks worse on the surface.",
        ],
      },
      {
        heading: "The first two seconds do most of the work",
        paragraphs: [
          "Almost all of the decision to keep watching or keep scrolling happens before your ad has said anything meaningful. That makes the opening frame the single highest-leverage part of the whole creative — and it's the part most often wasted on a logo animation or a slow establishing shot.",
          "Open on the thing that's actually interesting: the finished result, the problem being solved, a face talking directly to camera, or movement of some kind. Save the branding for later in the ad, where it reinforces something the viewer already cares about rather than acting as a toll gate before they get to the point.",
        ],
      },
      {
        heading: "Design for sound off, and for the feed it lives in",
        paragraphs: [
          "A large share of people watch with the sound off, which means any ad that depends on audio to make sense is losing a substantial chunk of its audience before it starts. Captions and clear text overlays aren't an accessibility afterthought — they're a performance requirement.",
          "It's also worth being honest about production values. Highly polished, obviously corporate creative frequently underperforms simpler content that looks like it belongs in the feed around it. This is one of the few areas where a smaller business has a genuine advantage: a real phone-shot video of your actual work, your actual premises, or you actually speaking often outperforms something that looks like a television commercial, because it reads as authentic rather than as an interruption.",
        ],
      },
      {
        heading: "Specific beats clever, every time",
        paragraphs: [
          "Clever headlines win awards. Specific headlines win enquiries. \"Elevate your everyday drive\" tells the viewer nothing; \"Ceramic coating from £395, booked in this week\" tells them exactly what's on offer, roughly what it costs, and when they can have it.",
          "A few habits that consistently separate specific creative from vague creative:",
        ],
        bullets: [
          "Name the actual service and the actual area, so the right person immediately recognises the ad is for them",
          "Say one thing per ad — an ad trying to communicate five benefits usually communicates none of them",
          "Make the next step unmistakable and low-friction, so there's no ambiguity about what happens if they tap",
          "Match the creative to the destination — an ad promising a quote should land on a page about getting a quote, not a generic homepage",
          "Write for the person with the problem, not for your industry peers",
        ],
      },
      {
        heading: "Creative fatigue is real — plan for it",
        paragraphs: [
          "No creative works forever. Show the same image or video to the same audience often enough and performance declines — cost per result creeps up, and the temptation is to blame the targeting or the budget when the actual problem is that people have simply seen it too many times.",
          "The practical answer is to treat creative as something you refresh on a schedule rather than something you finish. Keep several variations running so the platform has options to distribute between, watch for the point where cost per result starts drifting upward, and have the next batch ready before you need it. This is also why testing creative is usually more productive than endlessly testing audiences — it's the variable with the most room to move.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If your ads are getting attention but not enquiries, the campaign settings usually aren't the problem — the creative is doing the wrong job. Get in touch for a free strategy call and we'll look at what you're running now and where the gap between engagement and enquiries is opening up.",
        ],
      },
    ],
  },
  {
    slug: "meta-ads-vs-google-ads-which-is-right",
    title: "Meta Ads vs Google Ads: Which Is Right for Your Business?",
    description:
      "Google captures demand that already exists. Meta creates it. Here's how to tell which one your business needs first — and when running both actually makes sense.",
    publishedAt: "2026-08-10",
    keywords: [
      "Facebook ads vs Google ads",
      "Meta ads vs Google ads small business",
      "should I use Google or Facebook ads",
      "paid advertising channel comparison UK",
    ],
    sections: [
      {
        paragraphs: [
          "It's one of the first questions most business owners ask when they start thinking seriously about paid advertising, and the honest answer isn't a preference — it's a diagnosis. The two platforms do genuinely different jobs, and which one works better for you depends less on your budget than on how your customers actually go looking for what you sell.",
          "Here's the distinction that matters, and how to work out which side of it your business falls on.",
        ],
      },
      {
        heading: "The real difference: capturing demand vs creating it",
        paragraphs: [
          "Google Ads captures demand that already exists. Someone has a problem, they type it into a search bar, and you pay to appear in front of them at that exact moment. The intent is already there — you're competing to be the answer to a question they've already asked.",
          "Meta and Instagram ads work the other way round. Nobody opens Instagram intending to hire a builder or book a table. You're interrupting a scroll and creating interest that wasn't there thirty seconds earlier. That sounds like a disadvantage, and for some businesses it is — but it also means you're not limited to the number of people already searching, which for a lot of categories is a very small pool.",
          "Almost everything else — cost, creative, campaign structure, how you measure success — follows from that one difference.",
        ],
      },
      {
        heading: "When Google Ads is usually the better first move",
        paragraphs: [
          "Google tends to be the stronger starting point when the demand for what you sell is urgent, specific, and already being searched for:",
        ],
        bullets: [
          "Emergency or time-critical services — a burst pipe, a lockout, an urgent repair. Nobody scrolls Instagram looking for an emergency plumber; they search, and they call the first credible result",
          "Established categories people know how to search for, where the search volume genuinely exists in your area",
          "High-intent \"near me\" and location-based searching, which is a large share of local service demand",
          "Businesses where the customer already knows exactly what they want and is comparing providers rather than deciding whether to buy at all",
        ],
      },
      {
        heading: "When Meta & Instagram ads usually win",
        paragraphs: [
          "Meta tends to be stronger when what you sell is visual, discretionary, or simply not something people think to search for:",
        ],
        bullets: [
          "Visual products and experiences — food, vehicles, interiors, anything where seeing it is most of the sell",
          "Services people don't know they want until they see them, where there's little or no existing search volume to capture",
          "Retargeting people who visited your site or engaged with previous content but never enquired, which is typically far cheaper than reaching cold audiences on any platform",
          "Businesses that need volume — you can reach far more people for the same money than you can by bidding on a handful of competitive keywords",
          "Building an audience over time rather than paying afresh for every single click",
        ],
      },
      {
        heading: "What about cost?",
        paragraphs: [
          "This is where comparisons often get muddled, because the two platforms sell you different things. Google largely sells clicks from people actively searching, and in competitive categories that intent is expensive — you're bidding against everyone else who wants to be the answer to the same question. Meta largely sells reach, which is usually cheaper per person, but a far smaller proportion of those people are ready to act right now.",
          "That means a raw cost-per-click comparison between the two tells you very little. What matters is cost per booked customer, and that depends on your conversion rate, your follow-up speed, and how well the ad matches what the person was doing when they saw it. For context on the Meta side, our own live client campaigns are currently generating leads from around £4.49 — though those are specific accounts with specific targeting and creative, and results vary considerably by industry.",
        ],
      },
      {
        heading: "Why the answer is often both — in a specific order",
        paragraphs: [
          "For most established businesses, the mature answer is both. Google captures the people already looking; Meta creates awareness among people who weren't, then retargets everyone who showed interest but didn't convert. They compound rather than compete.",
          "But \"both\" is rarely the right place to start. Splitting a modest budget across two platforms usually means neither gets enough spend or data to perform properly — Meta in particular needs consistent, sustained budget to get out of its learning phase and start optimising. Picking one, running it properly for a few weeks, and adding the second once the first is working reliably will nearly always beat launching both at half strength.",
          "One thing worth saying plainly: if your customers genuinely are searching for what you sell in meaningful volume, Google may well be the better first pound spent — even though Meta & Instagram ads are what we do. Recommending the wrong channel because it's the one we sell would be a short-sighted way to run an agency.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're not sure which side your business falls on, that's exactly the kind of thing worth talking through before spending anything. Get in touch for a free strategy call and we'll give you an honest read on whether Meta & Instagram ads are the right first move for you — or whether something else should come first.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-restaurants-hospitality",
    title: "Meta & Instagram Ads for Restaurants & Hospitality: What Actually Fills Tables",
    description:
      "Restaurant ads aren't lead generation — the goal is a booked table. Here's how to structure Meta & Instagram campaigns around covers, radius and timing.",
    publishedAt: "2026-08-09",
    keywords: [
      "Instagram ads for restaurants UK",
      "Facebook ads for cafes",
      "restaurant social media advertising",
      "how to get more restaurant bookings",
    ],
    sections: [
      {
        paragraphs: [
          "Food is one of the most naturally suited categories on Instagram — it's visual, immediate, and people genuinely enjoy looking at it. That makes restaurants and cafés easy to advertise and surprisingly hard to advertise *profitably*, because attention is not the same thing as a booked table.",
          "Most restaurant campaigns that underperform aren't badly made. They're borrowed — a lead generation playbook built for a business selling a £3,000 service, applied to a business selling a £30 dinner. The economics are completely different, and so is the campaign that works.",
        ],
      },
      {
        heading: "The goal isn't a lead — it's a covered table",
        paragraphs: [
          "For most businesses we advertise for, success is a form submission: a name and number, followed up by a salesperson. Restaurants don't work that way. Nobody fills in a four-field enquiry form to book a table for Thursday — they tap through to a booking system, send a quick DM, or simply turn up.",
          "That difference should shape the whole campaign. Optimising for form fills in a restaurant campaign usually produces a list of half-interested people rather than filled tables. Sending traffic straight to a booking platform, or to a Messenger or WhatsApp conversation, matches how people actually behave when they're hungry and deciding where to eat.",
        ],
      },
      {
        heading: "Your radius is much smaller than you think",
        paragraphs: [
          "People will drive forty minutes to view a car and an hour to see a house. They will not drive forty minutes for a mid-week dinner unless you're a destination in your own right. For most independent restaurants and cafés, the realistic catchment is a few miles — and in dense city areas, it can be considerably tighter than that, because a customer three miles away has fifty alternatives between them and you.",
          "Getting this wrong is one of the most expensive mistakes in hospitality advertising, because a wide radius looks like it's working. Impressions and engagement go up. The reach numbers look healthy. But you're paying to show beautiful food photography to people who were never realistically going to visit, and none of it turns into covers.",
          "A tighter radius also tends to make retargeting far more effective, because you're re-reaching a smaller group of genuinely local people repeatedly, rather than spreading the same budget thinly across a whole city.",
        ],
      },
      {
        heading: "Timing is the lever most restaurants ignore",
        paragraphs: [
          "Hospitality has something almost no other industry has: demand that's tied to specific hours and specific days, and capacity that expires. An empty Tuesday table is revenue you can never recover — but a Saturday night ad for a restaurant that's already fully booked on Saturdays is money spent to create a queue you can't serve.",
          "This is why the sharpest restaurant campaigns are usually built around the gaps in the week rather than the whole week. If weekends fill themselves and midweek is thin, the entire budget belongs on midweek. Scheduling ads to run in the hours before people decide — late morning for lunch trade, late afternoon for dinner — puts the ad in front of someone at the moment the decision is actually being made, rather than at 9am when they're thinking about something else.",
        ],
      },
      {
        heading: "What actually works as creative",
        paragraphs: [
          "This is one category where the obvious answer is also the correct one: real footage of your own food, shot close and well-lit, outperforms almost everything else. Short video — something being plated, poured, sliced, or lifted — consistently does more work than a static image, because movement stops the scroll.",
          "A few things worth building into the creative rotation:",
        ],
        bullets: [
          "Close-up video of signature dishes being prepared or served, shot on a phone if that's what you have",
          "The room itself — atmosphere sells a booking as much as the food does, particularly for evening trade",
          "A specific, concrete offer where you're running one, rather than a vague \"come and visit us\"",
          "Text overlays that state the offer and the area clearly, since a large share of people watch with the sound off",
          "Seasonal and event-led creative refreshed regularly, because food ads fatigue faster than most — the same dish shown for three months stops working",
        ],
      },
      {
        heading: "Where restaurant ad spend quietly leaks away",
        paragraphs: [
          "The most common place hospitality budget disappears isn't the campaign — it's the twenty minutes after someone responds to it. An ad does its job, someone messages on Instagram asking whether you have a table for four on Friday, and the message sits unanswered until the evening because everyone was on the floor working service. By then they've booked somewhere else.",
          "This is a structural problem rather than a staffing failure. The people who could answer are, by definition, busiest exactly when enquiries arrive. Routing every channel — Instagram DMs, Facebook Messenger, WhatsApp and missed calls — into a single inbox, and covering the service-hours gap with automated replies or an AI receptionist that can answer common questions and take a booking, is what stops paid attention from evaporating during the dinner rush.",
          "It's also worth being realistic about measurement. Walk-in trade generated by an ad is genuinely difficult to attribute, which is one reason booking links and trackable offer codes are useful — not because they capture everything, but because they give you at least one honest signal to judge the campaign by.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "Restaurants and hospitality are one of the categories we work in, alongside automotive and finance, and the booking and enquiry side matters here more than almost anywhere else. If you want Meta & Instagram ads built around your quiet nights, your real catchment area, and a system that answers enquiries while your team is running service, get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "cost-per-lead-meta-ads-uk-by-industry",
    title: "What's a Good Cost Per Lead for Meta Ads in the UK?",
    description:
      "\"What's a good cost per lead?\" is the wrong first question. Here's why CPL varies so much by industry, and a better way to judge your own numbers.",
    publishedAt: "2026-08-08",
    keywords: [
      "cost per lead UK",
      "average cost per lead Facebook ads",
      "Meta ads cost per lead by industry",
      "what is a good CPL Meta ads",
    ],
    sections: [
      {
        paragraphs: [
          "\"What's a good cost per lead?\" is one of the most-asked questions about Meta ads, and it rarely has a single useful answer. A cost per lead that would be a brilliant result for one business would be a disaster for another, because the number on its own doesn't tell you anything — it only means something next to what that lead is actually worth to you.",
          "Here's a more useful way to think about cost per lead, what actually moves it, and why comparing your number to a generic \"industry average\" can send you in the wrong direction entirely.",
        ],
      },
      {
        heading: "Why cost per lead varies so much by industry",
        paragraphs: [
          "A few things drive most of the difference between industries. Higher-value purchases (a kitchen extension, a car, a property) can usually justify a higher cost per lead, because one converted customer is worth far more. Competitive auction dynamics matter too — categories with a lot of advertisers bidding for the same audience tend to see higher costs, regardless of how good the campaign is.",
          "How considered the purchase is plays a part as well. An emergency call-out has almost no consideration phase, so leads can come in cheap and fast; a service someone researches for weeks before enquiring naturally involves more of Meta's ad auction working to find and re-find the right person over that longer window.",
        ],
      },
      {
        heading: "What \"a lead\" even means changes the number completely",
        paragraphs: [
          "Cost per lead figures are only comparable if \"a lead\" means the same thing in both cases, and it rarely does. A raw form submission, a qualified enquiry that's actually a fit for the business, and a booked, showed-up customer are three very different numbers — often several multiples apart from each other.",
          "This is why a headline cost-per-lead figure without context can be misleading in either direction: a low number might just mean loosely qualified form-fills that go nowhere, and a higher number might reflect tightly qualified leads that convert at a much higher rate. Cost per booked customer is usually the number that actually matters to the business, even though cost per lead is the one people ask about first.",
        ],
      },
      {
        heading: "Real numbers, in context",
        paragraphs: [
          "Rather than quote generic industry benchmarks, it's more useful to look at real, current numbers. Our own live client campaigns over the last 30 days have generated leads from £4.49 for ceramic coating, up to around £10.28 for real estate — see the live figures on our results page. Those numbers reflect specific accounts, targeting and creative, not a universal rate for those industries, and they'll shift over time as campaigns are optimised — past performance isn't a guarantee of future results.",
          "The point of sharing them isn't \"this is what you should expect\" — it's to show that a single UK-wide average cost per lead isn't a meaningful benchmark, because even within one account, cost per lead varies significantly by exactly what's being advertised.",
        ],
      },
      {
        heading: "A better way to judge your own cost per lead",
        paragraphs: [
          "Instead of comparing your number to an industry average, work backwards from your own numbers. Take your average customer value and your margin, decide what you can comfortably afford to pay to acquire one customer, then work back through your typical lead-to-customer conversion rate to find your target cost per lead. That figure is specific to your business — it doesn't need to match anyone else's.",
        ],
      },
      {
        heading: "What actually moves your cost per lead",
        paragraphs: ["Whatever your starting point, a few levers tend to have the biggest effect on the number over time:"],
        bullets: [
          "Creative quality — a scroll-stopping video or image consistently outperforms generic stock imagery",
          "Targeting and radius — a tightly defined, relevant audience wastes less spend than a broad one",
          "Landing page or lead form friction — a slow page or a long form loses people who were otherwise ready to enquire",
          "Retargeting — re-engaging people who already showed interest is typically far cheaper than reaching cold audiences",
          "Time in market — cost per lead usually improves as a campaign gathers data and Meta's delivery system learns who converts",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you want a realistic cost-per-lead target for your specific business rather than a generic number, that's exactly what a strategy call is for — we'll work through your margins and customer value with you. Get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-trade-home-services",
    title: "Meta & Instagram Ads for Trade & Home Service Businesses: A Practical Guide",
    description:
      "How plumbers, electricians, and builders can use Meta & Instagram ads to generate qualified local leads — without wasting spend on the wrong customers.",
    publishedAt: "2026-08-07",
    keywords: [
      "Instagram ads for tradesmen",
      "Facebook ads for builders UK",
      "Meta ads for trade businesses",
      "local lead generation for tradesmen",
    ],
    sections: [
      {
        paragraphs: [
          "If you run a plumbing, electrical, or building business, your customers aren't scrolling Instagram browsing brands the way they might for fashion or food. They're searching with intent — a burst pipe, a rewire that's been put off too long, an extension that needs planning. Meta & Instagram ads can put you in front of exactly those people, but only if the campaign is built around how trade businesses actually get work, not a generic playbook borrowed from retail.",
          "This guide covers what actually works for trade and home service advertising on Meta's platforms, and where campaigns for this industry tend to go wrong.",
        ],
      },
      {
        heading: "Emergency work vs planned work needs different campaigns",
        paragraphs: [
          "Trade enquiries generally fall into two very different buckets, and treating them the same is one of the most common mistakes. An emergency call-out — a burst pipe, no heating, a tripped circuit that won't reset — is an immediate-need search with almost no consideration phase; whoever responds first and looks credible usually wins the job. A planned job — a bathroom refit, a rewire, a kitchen extension — involves comparing quotes, checking reviews, and thinking it over for days or weeks.",
          "A single ad trying to serve both audiences usually serves neither well. Emergency-focused ads should lead with speed and availability — same-day callout, always answering — and drive straight to a phone call or WhatsApp message. Planned-job ads can afford a slower funnel: project photos, a lead form asking a few qualifying questions, retargeting over a longer window.",
        ],
      },
      {
        heading: "Get the radius right before anything else",
        paragraphs: [
          "Most trade businesses only serve a realistic drive-time radius, and targeting outside it wastes ad spend on leads you'll turn down anyway. Rather than defaulting to a whole city or county, set the radius around your actual service area — and be honest about it. A builder happy to travel further for a large extension might only want emergency plumbing enquiries within a much tighter radius.",
          "It's also worth excluding areas you've deliberately stopped serving, and reviewing the radius periodically as the business changes — a growing team can usually justify covering more ground than a sole trader working solo.",
        ],
      },
      {
        heading: "What creative actually works for trades",
        paragraphs: [
          "Generic stock photography of someone in a hard hat tends to perform worse than real photos and video of your own work, even when the production quality is simple. A short phone-shot video of a completed job, a quick walkthrough of a finished bathroom, or a photo of the van outside a job in progress all build more trust than a polished but obviously staged stock image — people are hiring a specific business, not a category.",
        ],
        bullets: [
          "Before-and-after photos of completed jobs, where you have them",
          "Short video clips showing the work in progress, not just the finished result",
          "Your branded van, uniform, or team — trade businesses sell trust as much as skill",
          "Clear, simple text overlays stating the service and area, since many people scroll with the sound off",
        ],
      },
      {
        heading: "Phone calls, forms, or both?",
        paragraphs: [
          "Emergency-style ads tend to convert best when they go straight to a phone call or WhatsApp message — someone with a burst pipe isn't going to fill in a form and wait for a callback. Planned-job ads, on the other hand, often do better with a short lead form, since it lets you collect the details you need — rough budget, timeline, property type — before the first conversation, saving time on unqualified calls.",
          "Whichever route you use, the same rule applies as with any lead: reply fast. And because phone enquiries are so central to trade businesses, missed-call text-back is worth pairing with any campaign that sends people to your number — a missed call during a job is one of the easiest leads to lose.",
        ],
      },
      {
        heading: "Common mistakes to avoid",
        paragraphs: ["A few patterns show up again and again in underperforming trade campaigns:"],
        bullets: [
          "Targeting a whole city or region instead of a realistic service radius",
          "Using the same ad for emergency call-outs and planned larger jobs",
          "Relying on boosted posts instead of a properly structured campaign",
          "Sending every enquiry to a generic contact page instead of a fast-loading form or a direct call/WhatsApp option",
          "No system for missed calls or after-hours enquiries, so a chunk of demand is lost outside the 9-to-5",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you run a trade or home service business and want Meta & Instagram ads built around how your customers actually search — emergency versus planned, the right radius, and a follow-up system that doesn't drop calls — get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "missed-call-text-back-recovers-lost-leads",
    title: "Missed-Call Text-Back: How It Recovers Leads You're Already Paying For",
    description:
      "A missed call from a paid ad often means a lost customer. Here's how automatic missed-call text-back keeps that enquiry alive without you lifting a finger.",
    publishedAt: "2026-08-06",
    keywords: [
      "missed call text back",
      "automatic text back missed call",
      "missed call follow up",
      "recover lost leads phone",
    ],
    sections: [
      {
        paragraphs: [
          "You've paid to get someone to call you. They call, you're on the other line, in a meeting, or it's after hours — and it goes to voicemail. Most people don't leave one. They just move on to the next business on their list.",
          "That missed call isn't a lost cause — it's a lead you already paid for, sitting there for a few more minutes before it goes cold. Missed-call text-back is one of the simplest, highest-leverage fixes for exactly this problem.",
        ],
      },
      {
        heading: "What it actually does",
        paragraphs: [
          "It's straightforward: the moment a call to your business number goes unanswered, the caller automatically receives a text message — something like \"Sorry we missed your call, how can we help?\" — within seconds. No one has to remember to do it, and it happens whether you're mid-appointment, closed for the day, or just didn't hear the phone.",
          "The caller gets an immediate response instead of silence, and the conversation moves to text, where you (or an AI receptionist) can pick it up whenever you're free — without them having to try calling again or, more likely, ringing a competitor instead.",
        ],
      },
      {
        heading: "Why a missed call is worse than it sounds",
        paragraphs: [
          "A phone call is one of the highest-intent actions someone can take — they cared enough to actually ring rather than just browse. Losing that enquiry to a missed call is a particularly expensive kind of waste, especially if that call came from a paid ad campaign, where you've already spent money getting them to reach out in the first place.",
          "Unlike a missed Instagram DM or email, a missed call often leaves no record at all if there's no voicemail — you may not even know the enquiry existed. Text-back closes that gap by guaranteeing every missed call leaves a trace and gets a reply.",
        ],
      },
      {
        heading: "Where it fits alongside everything else",
        paragraphs: [
          "Missed-call text-back works best as one piece of a wider follow-up system, not a standalone fix. On its own, it stops the immediate silence — but the reply still needs to land somewhere you'll actually see it and follow up properly.",
        ],
        bullets: [
          "Route the resulting text conversation into the same unified inbox as your other channels, so it doesn't get missed a second time",
          "Pair it with an AI receptionist for messages that come in outside business hours, so the reply isn't just an acknowledgement but can actually answer questions and book someone in",
          "Use it alongside — not instead of — fast human follow-up during business hours, since a real reply still converts better than an automated one once someone's engaged",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're running Meta & Instagram ads and driving phone enquiries, missed-call text-back is one of the simplest additions that pays for itself — it's not a big strategic shift, just a gap closed. It's included as part of our unified inbox and automation setup — get in touch for a free strategy call to see it alongside the rest of the system.",
        ],
      },
    ],
  },
  {
    slug: "how-fast-should-you-reply-to-a-lead",
    title: "How Fast Should You Reply to a Lead? (And What It Costs You If You Don't)",
    description:
      "Why speed to lead matters more than most businesses realise, what counts as \"fast\" in practice, and how to actually close the gap without hiring a full-time receptionist.",
    publishedAt: "2026-08-05",
    keywords: [
      "speed to lead",
      "lead response time",
      "how fast to respond to leads",
      "lead follow up time",
    ],
    sections: [
      {
        paragraphs: [
          "A great ad campaign can generate a strong flow of enquiries and still produce disappointing sales — and the reason is rarely the ads themselves. It's what happens in the minutes and hours after someone enquires.",
          "Most people looking for a service don't enquire with just one business. They message two or three, then book in with whoever replies first and sounds like they've got it together. Response speed isn't a nice-to-have on top of good marketing — it's part of the campaign.",
        ],
      },
      {
        heading: "Why the first reply usually wins",
        paragraphs: [
          "Think about the last time you enquired about something online — a quote, a booking, a callback. If one business replied within minutes and another took until the next day, which one did you end up going with? Most people default to whoever engages first, because by the time the slow reply arrives, the decision has often already been made elsewhere.",
          "This isn't about being pushy. It's simply that a fresh enquiry is a moment of genuine interest, and that interest fades fast. Someone messaging on a Friday evening has usually moved on to something else by Monday morning.",
        ],
      },
      {
        heading: "What actually counts as \"fast\"",
        paragraphs: [
          "There's no single magic number, but a useful way to think about it: reply while the enquiry is still front-of-mind for the person who sent it. In practice that means minutes during business hours, not the end of the day — and ideally some kind of acknowledgement outside business hours too, even if the full reply comes later.",
          "A simple test: if you enquired with your own business right now, would you be impressed with how long it took to hear back?",
        ],
      },
      {
        heading: "Why replies end up slow in the first place",
        paragraphs: ["It's rarely a lack of care — it's usually a structural problem:"],
        bullets: [
          "Enquiries arrive across several channels (Instagram DMs, Facebook Messenger, missed calls, a contact form) with no single place to see them all",
          "Nobody's specifically responsible for watching for new enquiries, so they sit until someone happens to check",
          "There's no cover outside business hours, so anything that comes in overnight or at the weekend waits until the next working day",
          "Manually typing a reply to every enquiry from scratch takes longer than it needs to",
        ],
      },
      {
        heading: "Closing the gap",
        paragraphs: ["A few changes make the biggest difference, roughly in order of effort:"],
        bullets: [
          "Get every channel into one place you actually check — a unified inbox beats switching between four apps",
          "Turn on instant notifications for new enquiries rather than checking periodically",
          "Prepare a few reply templates for common questions, so a solid first response takes seconds, not minutes",
          "Add missed-call text-back, so a call you can't answer still gets an immediate reply",
          "Cover the gaps outside business hours with an AI receptionist that can answer common questions and book the enquiry in, so nothing waits until Monday",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're generating solid enquiries through Meta & Instagram ads but suspect some are slipping through the cracks before you get to them, that's exactly the gap our unified inbox, automated follow-up and AI receptionist are built to close. Get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "boosting-a-post-vs-real-ad-campaign",
    title: "Boosting a Post vs Running a Real Ad Campaign: What's the Difference?",
    description:
      "Why the \"Boost Post\" button and a proper Meta Ads Manager campaign aren't the same tool — and which one actually generates leads for your business.",
    publishedAt: "2026-08-04",
    keywords: [
      "boost post vs ads manager",
      "should I boost my Facebook post",
      "Meta ads campaign vs boosted post",
      "Instagram boost post worth it",
    ],
    sections: [
      {
        paragraphs: [
          "That blue \"Boost Post\" button under your latest Instagram or Facebook post is the single biggest reason small businesses think they've \"tried Meta ads\" and it \"didn't work.\" It's not that boosting is useless — it's that it's a different tool solving a different problem, and using it to generate leads is a bit like using a bicycle to move house.",
          "Here's what actually separates the two, and how to tell which one your business needs.",
        ],
      },
      {
        heading: "What boosting a post actually does",
        paragraphs: [
          "Boosting takes a post you've already published and pays to show it to more people. It's built for speed and simplicity — pick a budget, pick a rough audience, hit go — which is exactly why it's the first thing most business owners try.",
          "The trade-off is that it's simplified on purpose. Boosting only optimises for a narrow set of outcomes, mainly engagement (likes, comments, shares) or, at best, a basic version of traffic or messages. It doesn't give you access to lead form ads, conversion tracking, detailed audience layering, or the ability to test multiple creatives and pause the losers. You're renting reach for a post, not running a campaign built around a business outcome.",
        ],
      },
      {
        heading: "What a real campaign gives you that boosting doesn't",
        paragraphs: ["Building a campaign properly in Ads Manager (rather than tapping Boost) unlocks the parts that actually drive leads and sales:"],
        bullets: [
          "Objective-based optimisation — telling Meta to specifically find people likely to submit a lead form or message you, not just people likely to tap like",
          "Multiple ad sets tested against each other, so underperforming audiences or creative get cut and budget shifts to what's working",
          "Detailed targeting and exclusions — reaching the right radius, age range, and interests, and excluding people who've already enquired",
          "The Meta Pixel or Conversions API feeding real outcome data back into the campaign, which is what lets Meta's algorithm actually improve results over time",
          "Retargeting set up deliberately, rather than left to chance",
        ],
      },
      {
        heading: "When boosting is genuinely fine",
        paragraphs: [
          "Boosting isn't a mistake in every context. If the goal is simply visibility — more people seeing an announcement, a review, a behind-the-scenes post, or something building general brand awareness — a small boost can be a perfectly reasonable, low-effort way to extend reach. The problem is using it for the wrong job: expecting a tool built for engagement to reliably produce booked customers.",
        ],
      },
      {
        heading: "Signs it's time to move off the Boost button",
        paragraphs: ["A few reliable signs the Boost button has stopped being enough for what you actually need:"],
        bullets: [
          "You're boosting posts regularly but can't point to any leads or bookings that came from it",
          "You've never seen a cost-per-lead or cost-per-result number, only reach and engagement stats",
          "You don't have a Meta Pixel installed on your website, so Meta has no idea which clicks actually turned into enquiries",
          "You're relying on the same post performing well organically first before boosting it, rather than building creative specifically to convert",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If boosting posts has felt like spending money without a clear return, that's usually not a sign Meta ads don't work for your business — it's a sign the campaign was never actually built as one. Get in touch for a free strategy call and we'll show you what a properly structured campaign looks like for your numbers.",
        ],
      },
    ],
  },
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
