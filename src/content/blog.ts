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
    slug: "nap-consistency-local-seo",
    title: "NAP Consistency: The Boring Local SEO Job That Actually Matters",
    description:
      "Your business details are scattered across dozens of sites, and where they disagree Google trusts you less. Fixing it is dull, cheap and genuinely effective.",
    publishedAt: "2026-09-12",
    keywords: [
      "NAP citations UK local SEO",
      "business listings consistency",
      "local SEO citations small business",
      "inconsistent business details Google",
    ],
    sections: [
      {
        paragraphs: [
          "NAP stands for name, address and phone number. It's the least interesting thing in local search and one of the few jobs where an afternoon of dull work produces a genuine improvement.",
          "The problem it solves is simple. Your business details appear on dozens of sites — your own, Google, directories you signed up to years ago, listings you never created at all. Where those details disagree, Google has less confidence it's looking at one real business, and confidence is what local rankings are built on.",
        ],
      },
      {
        heading: "Why the details drift",
        paragraphs: [
          "Almost nobody creates inconsistency deliberately. It accumulates.",
          "You moved premises and updated your website but not the twelve directories. You changed phone provider. Someone wrote \"Ltd\" on one listing and left it off another. A directory scraped your details from an old source and published a version you've never seen.",
          "None of these feel like a problem individually, and collectively they're why a business that should rank locally quietly doesn't.",
        ],
      },
      {
        heading: "Pick one version and stick to it",
        paragraphs: [
          "Before changing anything, decide the exact format you'll use everywhere. Write it down — this is the reference you'll check every listing against:",
        ],
        bullets: [
          "The trading name exactly as customers know it, and be consistent about whether Ltd is included",
          "The address in one fixed format, including whether it's Street or St, Road or Rd, and how the unit number is written",
          "One phone number. Not the mobile on some listings and the landline on others",
          "The website with or without www, matching whichever your site actually resolves to",
          "The same opening hours, updated in one place when they change",
        ],
      },
      {
        heading: "Where to fix it, in order",
        paragraphs: [
          "Start with Google Business Profile, since it matters most, then your own website — the contact page and the footer, which often disagree with each other on the same site.",
          "After that, work through the big directories, the trade bodies you belong to, your social profiles, and anywhere your business is listed as part of a membership or accreditation. Searching your phone number in quotation marks turns up listings you'd forgotten, and often some you never made.",
          "Old listings from a previous address cause the most damage and are the easiest to miss, because nobody thinks to look for something they don't remember creating. Most directories have a claim or report process for exactly this.",
        ],
      },
      {
        heading: "The trap that catches agencies",
        paragraphs: [
          "Call tracking numbers are worth a specific warning. Putting a different tracking number on your website, your ads and your Google listing tells you which channel produced the call — useful — while quietly destroying the consistency you've just spent an afternoon building.",
          "It's solvable. Most call tracking systems support dynamic insertion, which shows the tracking number to visitors while leaving the real number in the page for anything reading it automatically. Google's own listing has a field for a secondary number, so the primary can stay as your real one.",
          "The point isn't to avoid call tracking — knowing where calls come from is genuinely valuable. It's to set it up so it doesn't undo your local search work, which is what happens when nobody thinks about the two together.",
        ],
      },
      {
        heading: "What to expect from it",
        paragraphs: [
          "Be realistic. Consistent details won't put you top of the local results on their own — categories, reviews and proximity all matter more.",
          "What it does is remove a handicap. It's foundational rather than transformative: the sort of thing that quietly holds a business back without ever announcing itself, and which no amount of work elsewhere fully compensates for.",
          "It's also one of the few marketing jobs that stays done. Reviews need asking for continually and ads need paying for every month. Fix your business details once, remember to update them when something changes, and that's the job finished — which makes an afternoon of tedium a reasonable trade.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-estate-agents-property",
    title: "Meta & Instagram Ads for Estate Agents and Property Businesses",
    description:
      "Property sits in Meta's housing category, which removes the targeting most agencies reach for first. Here's what actually works inside those rules.",
    publishedAt: "2026-09-11",
    keywords: [
      "Facebook ads for estate agents",
      "Instagram lead ads property UK",
      "property marketing Facebook ads",
      "estate agent social media advertising",
    ],
    sections: [
      {
        paragraphs: [
          "Property is one of the most visual things anyone advertises, which makes social media an obvious fit. It's also one of the few categories where the platform deliberately takes your best targeting tools away.",
          "Most campaigns in this sector fail for that reason rather than anything to do with the properties. The plan was built as though normal targeting rules applied, and they don't.",
        ],
      },
      {
        heading: "Housing is a special ad category",
        paragraphs: [
          "Adverts for property for sale or rent fall into Meta's housing category and have to be declared when you build the campaign. This isn't optional and it isn't a grey area.",
          "Declaring removes a great deal: no age or gender targeting, detailed interest and behaviour targeting heavily restricted, and a wider minimum location radius than a local campaign would normally use.",
          "The rule exists because targeted property advertising has been used to exclude people from neighbourhoods — that's unlawful discrimination under the Equality Act, and the restriction is there to prevent it rather than to inconvenience advertisers.",
          "Running housing ads undeclared is one of the more reliable routes to a restricted ad account. Anyone offering to target first-time buyers by age or investors by interest is either unaware of the category or planning to ignore it, and both end the same way.",
        ],
      },
      {
        heading: "The creative has to do the qualifying",
        paragraphs: [
          "If the targeting can't narrow the audience, the advert must. That sounds like a handicap and mostly isn't — it just moves the work somewhere more useful.",
          "An ad that opens with the town, the property type and the price is invisible to everyone it doesn't apply to. \"Three-bed semi in Consett, £145,000\" needs no interest targeting to find the right person, because the wrong people scroll past without registering it.",
          "This is why specificity matters more in property than almost anywhere. Vague brand advertising — \"your local property experts\" — has no filtering power at all, and inside a restricted category that's fatal.",
        ],
      },
      {
        heading: "Vendors are worth more than buyers",
        paragraphs: [
          "For estate agencies, buyer enquiries are plentiful and cheap. Instructions are scarce and valuable, and most agency advertising spends its budget on the wrong one because listings are easier to post.",
          "Campaigns aimed at people thinking of selling behave differently. The offer isn't a property, it's a valuation, and the honest version works better than the pushy one — what a house like yours recently sold for, how long things are taking locally, what to do before photographs.",
          "Bear in mind the personal attributes rule still applies. Copy that implies knowledge about someone's circumstances — that they're downsizing, divorcing, or struggling — will get pulled. Describe the service, not the situation you imagine they're in.",
        ],
      },
      {
        heading: "If you're advertising investment property",
        paragraphs: [
          "Sourcing businesses and investment-property sellers face everything above plus a second layer, and it's the one that causes real trouble.",
          "Returns figures need a clear basis and appropriate risk warnings. Anything suggesting capital is safe, or that a yield is assured, is a problem under advertising rules and under Meta's prohibition on implying unrealistic economic outcomes — property values fall and tenants leave, and an advert that implies otherwise is a genuine liability rather than a stylistic choice.",
          "It's also worth being clear about what's being sold. A straightforward sale of a physical property is different from anything structured as a managed or fractional arrangement, and the second can bring regulatory obligations that sit well outside a marketing conversation. If there's any doubt, that needs proper advice before a campaign runs, not after.",
        ],
      },
      {
        heading: "The decision takes months, so the follow-up matters more",
        paragraphs: [
          "Nobody buys a house, or an investment property, the week they first enquire. Someone requesting a valuation may sell in nine months. Someone downloading a guide may buy next year.",
          "That makes the follow-up the whole business. A lead that gets one call and then nothing is worth very little; the same lead kept warm for six months is worth a great deal. Guides, market updates and new listings all give you a reason to stay in contact without chasing.",
          "And it doesn't contradict replying quickly. Speed wins the first conversation — property enquiries go to several agents at once, and the first to respond usually gets the viewing. Patience wins the second half. Businesses in this sector need both, and most manage neither.",
        ],
      },
    ],
  },
  {
    slug: "why-your-cost-per-lead-went-up",
    title: "Why Your Cost Per Lead Went Up (and When to Worry)",
    description:
      "Rising lead costs are usually one of five things, and most of them aren't a problem. Here's how to tell a bad fortnight from a campaign that's genuinely failing.",
    publishedAt: "2026-09-10",
    keywords: [
      "Facebook ads cost per lead increasing",
      "why are my Facebook ads more expensive",
      "rising cost per lead Meta",
      "Meta ads performance dropped",
    ],
    sections: [
      {
        paragraphs: [
          "The campaign was producing leads at £8. This week they're £14. Nothing was changed, and the obvious conclusion is that something has broken.",
          "Usually it hasn't. Lead costs move around constantly, and the difference between a normal fluctuation and a genuine problem is mostly a question of how long you look before reacting.",
        ],
      },
      {
        heading: "Check the timeframe before anything else",
        paragraphs: [
          "A single bad week means very little. Small budgets produce small numbers, and small numbers swing wildly — if you get eight leads a week, two quiet days can double your apparent cost per lead without anything having changed.",
          "Compare a month against the previous month rather than this week against last. If the monthly figure is broadly flat, there's nothing to fix and the temptation to intervene is the actual risk. Changing an ad set sends it back into the learning phase, so a knee-jerk reaction to a bad week frequently causes the very problem it was meant to solve.",
          "Only when a rise holds across several weeks is it worth investigating properly.",
        ],
      },
      {
        heading: "The five usual causes",
        paragraphs: [
          "Once it's a real trend rather than noise, it's almost always one of these:",
        ],
        bullets: [
          "Audience fatigue — check frequency. If people have seen the ad many times, you've exhausted the pool. This hits local businesses hardest, because a tight radius means a small audience",
          "Creative fatigue — the ad itself has stopped being interesting. Click-through rate falling while frequency stays flat points here",
          "Seasonal competition — costs rise when more advertisers bid. The run-up to Christmas and January are both expensive, and you're paying for everyone else's budget as much as your own",
          "You changed something — a new budget, new targeting or new creative resets learning, and costs usually rise for several days afterwards before settling",
          "Tracking has broken — if conversions stopped being recorded properly, the leads may still be arriving while the report says otherwise. Worth ruling out first, because it's the one that isn't real",
        ],
      },
      {
        heading: "The fix depends on which one it is",
        paragraphs: [
          "Fatigue of either kind needs new creative — genuinely different, not the same photo with different words. This is the most common cause and the most commonly misdiagnosed one, because rising costs feel like a targeting problem.",
          "Seasonal competition needs patience or a wider audience. There's no clever way to bid against a market that's temporarily more expensive, and campaigns that get switched off in December often cost more to restart in February than staying on would have.",
          "If you made a change, wait. Give it a fortnight before judging, and resist making a second change on top of the first — that's how campaigns end up permanently unsettled.",
          "And if it's tracking, fix the tracking. Nothing else you do will be based on real numbers until you have.",
        ],
      },
      {
        heading: "When rising costs don't matter",
        paragraphs: [
          "Here's the part that catches people out: cost per lead going up is sometimes the sign of an improvement.",
          "Tighten your form to filter out accidental submissions, add a qualifying question, or put your price in the ad, and your cost per lead will rise. You're buying fewer, better enquiries on purpose. Every report will show the change as negative and your business will be doing better.",
          "So before reacting, check what happened after the leads arrived. If cost per lead rose from £8 to £14 but the proportion who answered the phone doubled, that's not a problem — that's the campaign getting more useful.",
          "This is why cost per lead should never be looked at alone. The number that decides anything is what a customer costs you, and that can fall while cost per lead rises.",
        ],
      },
      {
        heading: "When it is genuinely worth worrying",
        paragraphs: [
          "Sustained increases across two months, with no change at your end and no improvement in lead quality, are worth taking seriously — particularly if click-through rate is falling at the same time.",
          "The other real warning sign is cost per customer rising rather than cost per lead. That means something in the chain after the ad has changed, and no amount of work in the ad account will address it.",
          "Everything short of that is usually a fortnight that looked worse than it was. The most expensive habit in paid advertising isn't overspending — it's reacting to noise.",
        ],
      },
    ],
  },
  {
    slug: "google-business-profile-vs-paid-ads",
    title: "Google Business Profile vs Paid Ads: Where Should a Local Business Start?",
    description:
      "One is free and captures people already looking. The other costs money and reaches people who aren't. Which you need first depends on your trade.",
    publishedAt: "2026-09-09",
    keywords: [
      "Google Business Profile vs Facebook ads",
      "local business marketing priorities",
      "should I do SEO or paid ads first",
      "free vs paid marketing local business",
    ],
    sections: [
      {
        paragraphs: [
          "With limited time and money, most local business owners face the same question: put the effort into being found on Google, or pay to appear in front of people on Facebook and Instagram?",
          "They do genuinely different jobs, and which one you need first depends on something specific about your trade — whether people go looking for what you sell, or whether they need reminding it exists.",
        ],
      },
      {
        heading: "Existing demand versus created demand",
        paragraphs: [
          "Search captures demand that already exists. Someone's boiler has failed, so they search for a plumber. Your Google listing puts you in front of them at the exact moment they've decided to buy. Intent doesn't get higher than that.",
          "Paid social works the other way. Nobody opens Instagram intending to book a cleaner. But show the right person the right offer and a proportion of them realise they've been meaning to sort it for months. You're creating the demand rather than catching it.",
          "So the first question isn't which channel is better. It's whether people in your trade actively search for what you do.",
        ],
      },
      {
        heading: "Where each one wins",
        paragraphs: [
          "It splits fairly cleanly by how urgent and how considered the purchase is:",
        ],
        bullets: [
          "Urgent, problem-driven work — emergency plumbing, locksmiths, car recovery, breakdowns — is search-first, almost entirely. Nobody browses social media for a locksmith at midnight",
          "Discretionary, nice-to-have services — beauty treatments, personal training, regular cleaning, home improvements — are where paid social earns its keep, because people rarely search for things they haven't decided to buy yet",
          "Considered purchases people research — a used car, a kitchen, a wedding venue — usually need both: social to get on the list, search to be found once they're comparing",
          "Anything genuinely new or unusual has to be paid social first, because people can't search for a thing they don't know exists",
        ],
      },
      {
        heading: "The practical differences",
        paragraphs: [
          "Cost is the obvious one. A Google Business Profile is free, and for most local businesses it's the single highest-return use of an afternoon available.",
          "Speed goes the other way. Ads can be running by lunchtime and producing enquiries the same week. Building visibility in local search takes weeks to months, and the timeline isn't within your control.",
          "The bigger difference is the ceiling. Search is capped by how many people are looking — if only forty people a month search for your service in your town, that's the whole market and no amount of effort creates a forty-first. Paid social has no such limit, which is why businesses that outgrow their local search demand end up advertising whether they planned to or not.",
        ],
      },
      {
        heading: "The order that usually makes sense",
        paragraphs: [
          "Do the free thing first. Claim and complete the Google listing, get the categories right, start asking customers for reviews. It costs nothing but time, and it keeps working after you stop.",
          "Then advertise, once you know what you can afford to spend to get a customer. Starting with paid ads while your listing is half-finished means paying for attention you'd have got free, and a chunk of people who see your ad will search your name before enquiring — landing on a neglected listing with two old reviews.",
          "The exception is when you need customers this week rather than this quarter. Then it's ads, because search won't move fast enough, and you sort the listing out in parallel.",
        ],
      },
      {
        heading: "They work better together than apart",
        paragraphs: [
          "The two channels aren't really rivals. Someone who sees your advert two or three times and then searches your name converts better than either channel would manage alone, because the ad created the interest and the listing supplied the reassurance.",
          "That's also why advertising tends to improve your search performance in practice — more people searching your business by name, more visits, more reviews arriving.",
          "So the honest answer to which one first is: the free one, immediately, because there's no reason not to. Then paid, as soon as you can answer the question of what a customer is worth to you. The businesses that struggle are usually the ones that picked one and treated the other as optional.",
        ],
      },
    ],
  },
  {
    slug: "follow-up-sequence-that-doesnt-feel-like-nagging",
    title: "Writing a Follow-Up Sequence That Doesn't Feel Like Nagging",
    description:
      "Most enquiries are lost after one unanswered call. Here's how many times to follow up, how far apart, and what to say so it doesn't read as pestering.",
    publishedAt: "2026-09-08",
    keywords: [
      "lead follow up sequence",
      "how many times to follow up with a lead",
      "sales follow up template UK",
      "following up on enquiries",
    ],
    sections: [
      {
        paragraphs: [
          "Someone enquires, you ring, they don't answer. You make a mental note to try again, the day fills up, and that's the last anyone thinks about it.",
          "This is where most advertising budgets actually go. Not on bad targeting or weak creative — on enquiries that were followed up once and then quietly abandoned.",
          "The reason people stop is rarely laziness. It's that a second and third attempt feels like pestering. It doesn't have to.",
        ],
      },
      {
        heading: "Why one attempt is never enough",
        paragraphs: [
          "Think about how you behave with an unknown number. You're driving, you're with a customer, you assume it's a scam. Not answering means almost nothing about whether you're interested.",
          "Someone who filled in a form ten minutes ago wants to hear from you. They just weren't holding the phone when you rang. Treating that first missed call as a rejection is the single most expensive assumption in small business marketing.",
          "The businesses that do well here aren't more persuasive. They're just still there on attempt four, when everyone else has stopped.",
        ],
      },
      {
        heading: "A sequence that works",
        paragraphs: [
          "Spread over about ten days, mixing channels rather than repeating the same one:",
        ],
        bullets: [
          "Within 5 minutes — call. Speed matters more than anything else in this list",
          "Immediately after, if no answer — a short WhatsApp or text, so they know who rang and can reply in their own time",
          "Same day, a few hours later — call again, at a different time of day",
          "Day 2 — call at a genuinely different hour. Someone who never answers at 2pm may always answer at 9am",
          "Day 4 — a message with something useful in it rather than another chase",
          "Day 8 — a final short message that makes it easy to say no",
        ],
      },
      {
        heading: "The rule that stops it feeling like nagging",
        paragraphs: [
          "Every message should contain something other than a request for their attention. \"Just checking in\" and \"following up on my last message\" are pure asking — the third one of those is when a person starts feeling hounded.",
          "Give something instead. The price they'd have asked about. Your earliest availability. A photo of similar work. An answer to the question everyone in your trade gets asked.",
          "Compare \"just checking you got my message\" with \"we've got a slot on Thursday morning if that's any use — £180 for the job as you described it.\" Both are follow-ups. Only one is worth receiving.",
        ],
      },
      {
        heading: "The last message matters most",
        paragraphs: [
          "Counter-intuitively, the message that explicitly ends the conversation gets more replies than any of the ones before it.",
          "Something like: \"I'll leave it there so I'm not filling up your phone. If the timing's wrong just say and I'll close it off — and if you'd rather pick it up in a few weeks, that's no problem either.\"",
          "It works because it releases the pressure. People who've been avoiding replying out of awkwardness will often respond to this one, and a meaningful share turn into customers. The rest tell you no, which is genuinely useful — you stop spending time on them.",
        ],
      },
      {
        heading: "Automate the reminders, not the words",
        paragraphs: [
          "The sequence fails when it depends on someone remembering. Day four is exactly the day a busy week swallows, and nobody notices it happened.",
          "So the timing should be automatic — a CRM, a task list, a calendar reminder, whatever survives a bad week. That's what a follow-up system actually is.",
          "But keep the messages human. A sequence of obviously templated messages performs worse than three genuinely written ones, because people can tell, and a template says you're processing them rather than talking to them. Automate when you're prompted; write the message yourself.",
          "One legal note: someone who enquired has invited you to reply, so following up is fine. Adding them to a marketing list afterwards is a separate permission under PECR, and worth asking for rather than assuming.",
        ],
      },
      {
        heading: "What this is worth",
        paragraphs: [
          "Take a hypothetical business getting 40 leads a month and reaching 24 of them. If a proper sequence lifts that to 32, they've gained eight conversations without spending another penny on advertising.",
          "At any realistic conversion rate that's more customers than most targeting changes would produce, from work that costs nothing but discipline.",
          "It's also the cheapest improvement available to almost every business we speak to — and the one most likely to be dismissed as too obvious to bother with.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-cleaning-companies",
    title: "Meta & Instagram Ads for Cleaning Companies",
    description:
      "Cleaning is a recurring-revenue business, which changes what a customer is worth and what you can afford to pay for one. Here's how that shapes the advertising.",
    publishedAt: "2026-09-07",
    keywords: [
      "Facebook ads for cleaning business UK",
      "domestic cleaning marketing",
      "Instagram ads cleaning company",
      "how to get cleaning clients UK",
    ],
    sections: [
      {
        paragraphs: [
          "Most advertising advice treats every business the same: get the lead, close the sale, count the profit. Cleaning doesn't work like that, and the difference is the whole reason it's such a good fit for paid advertising.",
          "A cleaning customer isn't a sale. They're a standing arrangement that either lasts two visits or two years, and almost everything about how you should advertise follows from that.",
        ],
      },
      {
        heading: "The number that changes the decision",
        paragraphs: [
          "Take a hypothetical regular customer paying £70 a fortnight. Over a year that's around £1,800, and there's no reason it stops at twelve months — regular cleaning arrangements often run for years.",
          "Now consider what you could sensibly pay to acquire one. If a customer is worth £1,800 in the first year, spending £80 or £100 to get them isn't a marketing cost worth agonising over — it's buying an income stream at a heavy discount.",
          "This is why cleaning companies who work out their real numbers usually end up advertising more, not less. The businesses that struggle are the ones judging campaigns on cost per lead, panicking at £15 a lead, and never calculating what the customer behind it is actually worth.",
        ],
      },
      {
        heading: "The barrier is trust, not price",
        paragraphs: [
          "You're asking someone to let a stranger into their home, often when they're not there, sometimes with a key. That's a bigger ask than most trades make, and it's the real obstacle in the way of an enquiry.",
          "Which means advertising that leads on price is answering a question nobody was stuck on. The useful things to show are the ones that address being trusted:",
        ],
        bullets: [
          "The cleaners themselves, on camera. A face does more for trust than any amount of copy about reliability",
          "Insurance and vetting stated plainly — public liability cover and whatever checks you run on staff",
          "Same cleaner each visit, if you offer it. It's one of the strongest things a domestic cleaning business can say, because the alternative is a rotating cast of strangers",
          "What happens on a first visit — how long it takes, whether you need to be in, how keys are handled",
          "Real homes you've cleaned, with permission. Not stock photography of a show kitchen nobody lives in",
        ],
      },
      {
        heading: "Advertise the regular slot, not the one-off",
        paragraphs: [
          "One-off deep cleans and end-of-tenancy jobs are easier to sell and worth far less. They convert well, which makes them tempting to lead with, and then the customer disappears.",
          "The advertising should point at the recurring arrangement, because that's where the value is. A first-clean discount is a good way in — it lowers the barrier without pretending the ongoing price is lower than it is.",
          "If you do take one-off work, treat it as a route to regular work rather than the product. The conversation at the end of a deep clean is the best chance you'll ever get to convert someone to fortnightly, and it costs nothing.",
        ],
      },
      {
        heading: "Keep the radius tight",
        paragraphs: [
          "Travel time is unpaid, and in this trade it's the quiet killer of margin. A customer forty minutes away costs you most of another job.",
          "So target tightly — the specific towns and postcodes you can actually route efficiently, not a broad radius that looks better on a map. A wide area produces enquiries you'll either turn down or regret accepting.",
          "Clustering matters too. Ten customers in one town are worth considerably more than ten scattered across a county, because your cleaners spend the day working rather than driving. It's worth advertising area by area for that reason alone.",
        ],
      },
      {
        heading: "Speed decides who gets the customer",
        paragraphs: [
          "People enquire about cleaning at the point they've had enough, and they usually message more than one company. Whoever comes back first with an actual answer — yes we cover your postcode, here's the price, here's when we could start — tends to get the booking.",
          "It rarely comes down to who was cheapest. It comes down to who replied while the person was still thinking about it.",
          "This is worth more attention than the ads themselves. If enquiries arrive in the evening and get answered two days later, no amount of budget fixes that — you're paying to generate customers for whoever answers their phone faster than you do.",
        ],
      },
    ],
  },
  {
    slug: "facebook-ad-account-disabled-what-to-do",
    title: "What to Do If Your Facebook Ad Account Gets Disabled",
    description:
      "An account restriction is alarming and usually recoverable. Here's what actually causes it, how the appeal works, and the reaction that makes it permanent.",
    publishedAt: "2026-09-06",
    keywords: [
      "Facebook ad account disabled UK",
      "Meta ad account restricted appeal",
      "ad account disabled what to do",
      "how to get Facebook ads account back",
    ],
    sections: [
      {
        paragraphs: [
          "You log in and everything has stopped. A banner says your ad account has been disabled, there's a policy name you don't recognise, and no explanation of what you actually did.",
          "It's a horrible moment, particularly if advertising is where your enquiries come from. It's also usually recoverable — provided you don't do the thing most people's instincts tell them to do.",
        ],
      },
      {
        heading: "Don't start a new account",
        paragraphs: [
          "The immediate temptation is to set up a fresh ad account, or a new business profile, and carry on. Don't.",
          "Meta links accounts by payment method, device, browser, IP address and profile connections. A replacement account usually gets caught quickly, and at that point you've turned a single restriction into a pattern of evasion — which is treated far more seriously than whatever triggered the original problem.",
          "This is the single decision that separates a fortnight of inconvenience from losing access permanently. Appeal the account you have.",
        ],
      },
      {
        heading: "What usually causes it",
        paragraphs: [
          "The stated reason is often generic, but the underlying cause is normally one of a handful of things:",
        ],
        bullets: [
          "Policy breaches in the ads themselves — most often the personal attributes rule, or claims about results that read as unrealistic",
          "Running credit, employment or housing ads without declaring the special ad category",
          "Payment problems, including a failed charge or a card that doesn't match the account details",
          "Unusual account activity — logging in from a new country, a sudden large spend increase, or several people accessing it from different places",
          "Being new. Brand new accounts that start spending immediately get more scrutiny than established ones, and sometimes get caught by automated checks with nothing actually wrong",
        ],
      },
      {
        heading: "How to appeal",
        paragraphs: [
          "There's a request review option in the notification and in Account Quality, which is worth finding — it shows what's been flagged across your account, adverts and page rather than just the headline.",
          "Appeal once and wait. Submitting repeatedly doesn't escalate anything and can look like automated behaviour. Most reviews come back within a few days.",
          "Keep the appeal short and factual. Say what your business does, what you advertise, and that you believe the restriction is a mistake — or, if you can see what went wrong, say what it was and what you've changed. Admitting a genuine error and describing the fix tends to work better than insisting nothing happened.",
          "What doesn't help is arguing, writing at length about the impact on your business, or repeating the appeal in different words. The review is largely mechanical.",
        ],
      },
      {
        heading: "If it isn't reinstated",
        paragraphs: [
          "Sometimes it stays disabled and no further explanation arrives. That's genuinely frustrating and there's no route around it, but a few things are still worth knowing.",
          "The restriction may apply to the ad account rather than everything you own — your page and your business portfolio can survive it. Check what's actually restricted before assuming the worst.",
          "And if the account is gone for good, the honest position is that the business needs a route to customers that doesn't depend on a platform that can switch you off without notice. Which is the real lesson here.",
        ],
      },
      {
        heading: "Reducing the odds it happens",
        paragraphs: [
          "Set the account up properly. Run advertising through a business portfolio rather than off a personal profile, use a consistent payment method in the business's name, and give people their own access rather than sharing one login.",
          "Warm a new account up. Starting at a modest daily budget and increasing gradually attracts less scrutiny than launching straight into significant spend on day one.",
          "Learn the two rules that cause most avoidable trouble — don't write copy that implies you know something personal about the reader, and declare special ad categories when they apply. Between them they account for a large share of preventable restrictions.",
          "And build something you own alongside it. A website that ranks, a Google listing, a list of past customers you can contact directly. Advertising is rented attention, and this is what renting means.",
        ],
      },
    ],
  },
  {
    slug: "google-business-profile-does-more-than-your-website",
    title: "Your Google Business Profile Is Doing More Work Than Your Website",
    description:
      "For most local businesses, the free Google listing gets seen far more than the website does — and it's usually the least maintained thing they own.",
    publishedAt: "2026-09-05",
    keywords: [
      "Google Business Profile optimisation UK",
      "local map pack ranking",
      "Google Maps ranking small business",
      "local SEO for small business UK",
    ],
    sections: [
      {
        paragraphs: [
          "Search for a plumber, a barber or a garage near you and look at what actually fills the screen. Before any website appears, there's a map with three businesses on it — names, star ratings, opening hours, a call button.",
          "That's the local pack, and for a business serving a specific area it's usually where the customers come from. The listings behind it are Google Business Profiles: free, quick to set up, and for most small businesses the least maintained thing they own.",
        ],
      },
      {
        heading: "Why it beats your website for local searches",
        paragraphs: [
          "Someone searching for a local service isn't researching. They want a phone number, a location, an indication other people were happy, and confidence you're open now.",
          "The listing answers all four without anyone clicking anything. Your website answers them too, but only after someone has chosen to visit it — and for a large share of local searches, nobody gets that far.",
          "This is why a business with a modest website and a well-kept listing routinely out-performs one with an expensive site and a neglected listing. It isn't fair, but it's how the results are laid out.",
        ],
      },
      {
        heading: "What actually moves it",
        paragraphs: [
          "Google weighs relevance, distance and prominence. Distance you can't change — you are where you are. The other two you can work on:",
        ],
        bullets: [
          "Complete every field, particularly the primary category, which does more than almost anything else. \"Emergency plumber\" and \"plumber\" are different categories and surface for different searches",
          "List services and areas explicitly rather than assuming Google infers them from your website",
          "Add photos regularly — recent ones. A listing whose newest photo is three years old reads as a business that may not exist any more",
          "Use Google Posts. Few small businesses bother, which is precisely why it's worth doing",
          "Answer the questions people ask in the Q&A section, and add the obvious ones yourself. Do you take card? Is there parking? Do you cover my postcode?",
        ],
      },
      {
        heading: "Reviews: recency matters as much as the total",
        paragraphs: [
          "Review count is the number everyone watches. Recency and pace matter at least as much — twenty reviews spread across the past year signals a working business far more strongly than sixty that stopped arriving in 2023.",
          "So the useful habit isn't a one-off push to reach a round number. It's asking steadily. A couple a month, forever, beats thirty in a fortnight and then silence.",
          "Ask at the point the customer is happiest, which is usually immediately after the job rather than in an email the following week. And reply to all of them, including the bad ones — a measured reply to a poor review does more for the next reader than the review itself does against you.",
          "One thing to be plain about: writing or buying fake reviews is illegal in the UK under the Digital Markets, Competition and Consumers Act 2024, and the CMA can act directly on it. Beyond the legal exposure, it's obvious to anyone reading carefully. Don't.",
        ],
      },
      {
        heading: "Get your details identical everywhere",
        paragraphs: [
          "Your business name, address and phone number appear across dozens of directories, some of which you never created. Where those disagree, Google has less confidence it's dealing with one real business.",
          "It's dull work and it's genuinely worth an afternoon. Pick the exact format you'll use — including whether it's \"Street\" or \"St\", and which phone number is the real one — then make your website, your Google listing and every directory you can find match it character for character.",
          "Old listings from a previous address cause the most trouble, because they're the ones nobody remembers to update.",
        ],
      },
      {
        heading: "Where it fits alongside advertising",
        paragraphs: [
          "The two do different jobs and neither replaces the other. Search captures people already looking for what you sell. Paid social reaches people who aren't looking yet but would be interested — which is most of your potential customers most of the time.",
          "A business relying only on search is limited to existing demand. One relying only on ads is paying for attention it could be getting free.",
          "If you're starting from nothing, the listing comes first simply because it costs nothing but time. Then advertise, and the improved listing makes the advertising work better too — because a good share of people who see your ad will search your name before they enquire, and what they find decides whether they do.",
        ],
      },
    ],
  },
  {
    slug: "what-does-it-cost-to-get-a-customer",
    title: "What Does It Cost to Get a Customer? Working Out Your Real Number",
    description:
      "Cost per lead tells you almost nothing on its own. The number that decides whether advertising works is what a paying customer costs you to acquire.",
    publishedAt: "2026-09-04",
    keywords: [
      "customer acquisition cost small business UK",
      "how much to spend to get a customer",
      "cost per customer marketing",
      "is my advertising profitable",
    ],
    sections: [
      {
        paragraphs: [
          "Ask a business owner what a lead costs them and plenty can answer. Ask what a customer costs and the room usually goes quiet.",
          "It's the more important number by some distance. Cost per lead measures how cheaply you can get someone's phone number. Cost per customer measures whether the advertising is actually making you money, and those two things come apart more often than people expect.",
        ],
      },
      {
        heading: "The chain, and where it breaks",
        paragraphs: [
          "Getting a customer through advertising involves four steps, and each one loses people:",
        ],
        bullets: [
          "Money spent on ads produces leads",
          "Leads that you manage to actually reach become conversations",
          "Conversations become quotes, appointments or viewings",
          "Some of those become paying customers",
        ],
      },
      {
        heading: "Do the sum with your own figures",
        paragraphs: [
          "Take a hypothetical business spending £400 a month on ads and getting 40 leads. That's £10 a lead, which sounds respectable.",
          "Of those 40, they reach 24 — the rest never answer. Of the 24, 10 book something in. Of the 10, 4 become customers.",
          "So £400 produced four customers. That's £100 per customer, not £10. The advertising didn't get ten times worse; the number simply measures something different, and it's the one that decides whether to keep going.",
          "Run that with your own numbers before reading any further. Most people find the answer is considerably higher than they assumed, and that's useful rather than depressing — it's the first honest figure they've had.",
        ],
      },
      {
        heading: "£100 a customer is meaningless without the other half",
        paragraphs: [
          "Whether £100 is excellent or ruinous depends entirely on what a customer is worth to you, and that's where most of the judgement lives.",
          "For a one-off £80 job, £100 a customer means losing money on every sale. For a kitchen fitter averaging £9,000, it's an extraordinary return that they should be spending far more to get.",
          "Recurring work changes it again. A cleaner charging £70 a fortnight has a customer worth roughly £1,800 over a year if they stay. Spending £100 to acquire that is not a marketing expense in any meaningful sense — it's buying an income stream at a discount.",
          "This is why comparing your cost per lead to an industry average is close to worthless. Two businesses with identical ad costs can have completely different outcomes, because what they're buying is worth different amounts.",
        ],
      },
      {
        heading: "The ratio to aim at",
        paragraphs: [
          "A rough working rule: what a customer is worth to you over the whole relationship, divided by what they cost to acquire. Around three to one is generally healthy for a small business — enough margin to cover delivering the work and running everything else.",
          "Below one to one you're paying for the privilege of doing the job. Somewhere near one to one and it's marginal, which is fine while you're learning but not somewhere to settle.",
          "Comfortably above three and the sensible response is usually to spend more, not to congratulate yourself. If every £100 reliably returns £600, the constraint on your business isn't marketing — it's how much work you can take on.",
        ],
      },
      {
        heading: "Where to fix it when the number is bad",
        paragraphs: [
          "A high cost per customer is rarely an advertising problem, because the biggest losses usually happen after the lead arrives.",
          "In the example above, 16 of 40 leads were never reached at all. That's 40% of the ad budget spent on people nobody spoke to. Improving that costs nothing and lifts every other number in the chain — no change to targeting or creative comes close.",
          "So work backwards through the four steps. Are you reaching people? Are conversations turning into appointments? Are appointments turning into customers? Fix whichever leaks hardest, and only then look at the ads.",
        ],
      },
      {
        heading: "You need to write it down",
        paragraphs: [
          "None of this works from memory, and none of it is in Ads Manager — Meta knows a form was submitted and nothing about what happened afterwards.",
          "Four columns will do: leads received, leads reached, appointments booked, customers won. A spreadsheet is enough, and a month of it tells you more about your marketing than a year of platform reports.",
          "Once you have it, decisions get much easier. You'll know what you can afford to pay for a customer, whether to increase spend, and — most usefully — whether the problem is the advertising or what happens after it.",
        ],
      },
    ],
  },
  {
    slug: "click-to-whatsapp-ads-vs-lead-forms",
    title: "Click-to-WhatsApp Ads vs Lead Forms: Which Gets Better Enquiries?",
    description:
      "One gives you volume, the other gives you conversations. The right choice depends less on the ads than on who's around to answer them.",
    publishedAt: "2026-09-03",
    keywords: [
      "click to WhatsApp ads UK",
      "WhatsApp ads vs lead forms",
      "Meta lead ads alternatives",
      "WhatsApp advertising small business",
    ],
    sections: [
      {
        paragraphs: [
          "When you set up a campaign to generate enquiries, Meta offers a choice of where those enquiries land. Two options dominate for small businesses: an instant lead form that opens inside the app, or a click-to-WhatsApp ad that drops the person straight into a chat with you.",
          "They produce genuinely different results, and the better one depends far more on how your business operates than on anything about the ads themselves.",
        ],
      },
      {
        heading: "What each one actually does",
        paragraphs: [
          "A lead form opens a small form inside Facebook or Instagram. Name, email and phone are usually pre-filled from the person's account, so submitting takes two taps. You receive a lead record.",
          "A click-to-WhatsApp ad opens a WhatsApp conversation with a message already typed. There's no form. What you receive is a person talking to you, from the number they actually use, because WhatsApp is tied to a working phone number.",
          "That last detail matters more than it sounds. The most common complaint about lead forms is unreachable phone numbers — not fake ones, just the number someone entered when they signed up years ago and hasn't checked since. WhatsApp doesn't have that problem by construction.",
        ],
      },
      {
        heading: "Volume versus intent",
        paragraphs: [
          "Lead forms almost always produce more leads for the same money. They're designed to remove friction, and they succeed — sometimes to the point where people complete them without consciously deciding to contact anyone.",
          "WhatsApp asks for more. Opening a chat means starting a conversation with a stranger, which a certain kind of person won't do. You'll get fewer enquiries.",
          "The ones you get, though, have chosen to talk to you. In our experience that trade — fewer, warmer — is the right one for most service businesses, because the cost of chasing twenty unreachable leads is your time, and your time is the scarcest thing you have.",
        ],
      },
      {
        heading: "The catch nobody mentions",
        paragraphs: [
          "WhatsApp only works if someone answers it. A form sits in your inbox until you get to it. A WhatsApp message is a conversation someone has started and is waiting in.",
          "Leave it four hours and you haven't just delayed a callback — you've been visibly ignored, in an app where people can see the message was delivered. That reads worse than a slow email reply, and people say so.",
          "So the honest test is: is somebody able to reply within the hour during working hours? If the answer's no, WhatsApp will actively work against you, and a lead form with a disciplined callback routine is the better setup.",
        ],
      },
      {
        heading: "What each suits",
        paragraphs: [
          "Broadly, it splits along how the business already communicates:",
        ],
        bullets: [
          "WhatsApp suits trades, cleaners, garages, salons and anyone whose customers already message rather than call — and businesses where the owner has their phone on them all day",
          "Lead forms suit businesses with someone whose job is to work through a call list, and anything with a longer sales process where you want structured details before speaking",
          "WhatsApp is stronger where the enquiry needs a back-and-forth — availability, a quote, a photo of the job",
          "Lead forms are stronger where you need the same four fields from everyone and want them in a spreadsheet",
          "If you're rarely at a desk but always have your phone, that alone points at WhatsApp",
        ],
      },
      {
        heading: "Two practical points",
        paragraphs: [
          "Tracking is harder with WhatsApp. A form creates a tidy record automatically; a conversation doesn't, unless WhatsApp is connected to a CRM that logs it. Without that you'll struggle to say how many enquiries became customers, which is the number that matters most. It's solvable, but it needs setting up rather than assuming.",
          "And be careful about what happens after. Someone messaging you from an ad has plainly consented to that conversation. That is not consent to be added to a marketing list and messaged weeks later — under PECR that's a separate permission, and WhatsApp itself is unforgiving about unsolicited messaging. Reply to the enquiry freely; ask before you market to them.",
        ],
      },
      {
        heading: "The answer for most people",
        paragraphs: [
          "If you can answer messages quickly, run click-to-WhatsApp. The enquiries are warmer, the numbers are real, and the conversation starts immediately rather than after a game of phone tag.",
          "If you can't, run lead forms with the higher-intent setting and a proper callback routine, and fix the response problem before switching.",
          "And if you're already running one, the other is worth testing rather than debating. Two weeks of each, same budget, same offer, then compare how many became customers — not how many leads arrived. That comparison answers it for your business in a way no general advice can.",
        ],
      },
    ],
  },
  {
    slug: "how-to-write-meta-ad-copy-that-gets-replies",
    title: "How to Write Meta Ad Copy That Actually Gets Replies",
    description:
      "Good ad copy isn't clever writing. It's saying something specific enough that the right person stops and the wrong person doesn't bother.",
    publishedAt: "2026-09-02",
    keywords: [
      "Facebook ad copy tips UK",
      "how to write Facebook ads",
      "Meta ad copy examples",
      "writing ads that convert",
    ],
    sections: [
      {
        paragraphs: [
          "Most small business ad copy reads like the back of a business card. Established since 2004, fully insured, competitive rates, family run. All true, all completely interchangeable with every competitor, and none of it gives anyone a reason to stop scrolling.",
          "Good ad copy isn't clever writing. It's being specific enough that the right person recognises themselves and the wrong person keeps going.",
        ],
      },
      {
        heading: "The first line is nearly the whole job",
        paragraphs: [
          "Meta cuts your text off after roughly 125 characters and hides the rest behind \"See more.\" Most people never tap it. So the first line isn't an introduction to your ad — for the majority of people who see it, the first line is the entire ad.",
          "Which means it can't be a warm-up. \"At [business name], we pride ourselves on...\" has spent the whole budget saying nothing.",
          "Open with the thing that would make someone stop. A price, a specific problem, a plain statement of what you're offering. The rest of the copy is for the minority who are already interested.",
        ],
      },
      {
        heading: "Write to one person, not an audience",
        paragraphs: [
          "Copy addressed to everyone lands on nobody. \"We help businesses grow\" is technically true of thousands of companies and describes none of them.",
          "The fix is uncomfortable but simple: narrow it until it feels too narrow. \"Domestic cleaning in Luton, weekly or fortnightly, same cleaner each time\" excludes almost everybody — and that's why the people it does describe pay attention.",
          "You're not trying to appeal to the maximum number of people. You're trying to be unmistakable to a small number of them.",
        ],
      },
      {
        heading: "Specifics beat adjectives",
        paragraphs: [
          "Adjectives are what people write when they don't have details. Reliable, professional, high quality — nobody advertises being unreliable, so these words carry no information at all.",
          "Details do the work adjectives can't:",
        ],
        bullets: [
          "Prices — \"from £21 an hour\" says more about your positioning than \"affordable\" ever will",
          "Timeframes — \"we'll call you back within the hour\" is a promise; \"fast response\" is a hope",
          "Numbers — how many years, how many jobs, how long a typical job takes",
          "The awkward bits — what you don't do, who you're not for. Nothing builds trust faster than a business ruling itself out of something",
          "Location, named properly — the town, not \"your local area\", which reads as a template because it is one",
        ],
      },
      {
        heading: "Say what happens next",
        paragraphs: [
          "A surprising number of ads never tell anyone what to do. They describe the business, then stop, and hope.",
          "Be plain about the next step and what it involves. \"Tap below, fill in four boxes, and we'll ring you today\" tells someone exactly what they're signing up for. \"Get in touch to discuss your requirements\" makes it sound like effort.",
          "Reducing the perceived commitment matters more than persuading. Most people who don't enquire aren't unconvinced — they just don't want to be trapped in a sales conversation. Say how long it takes and that there's no obligation, and you'll remove more hesitation than any amount of persuasion adds.",
        ],
      },
      {
        heading: "The rule this industry gets wrong",
        paragraphs: [
          "Ad copy must not imply you know something personal about the reader. That means questions aimed at their situation — their health, weight, finances or age — will get the ad rejected, however sympathetically they're phrased.",
          "\"Struggling with debt?\" and \"Unhappy with your skin?\" both break it. Describing the service instead — \"debt advice appointments in Leeds\" — says the same thing to the same audience and runs without trouble.",
          "It's worth internalising, because the rejected version is usually the one that feels most natural to write.",
        ],
      },
      {
        heading: "A test that takes ten seconds",
        paragraphs: [
          "Read your ad and ask whether a competitor could put their name at the bottom of it without changing a word. If they could, it isn't an advert for your business — it's an advert for your industry, and you're paying to run it.",
          "Then read the first line on its own. If it doesn't work by itself, rewrite it, because for most of the people who see your ad that line is all there is.",
          "And write two versions, always. Not five — two, properly different from each other, so the answer is clear rather than a set of near-identical results you can't tell apart.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-gyms-personal-trainers",
    title: "Meta & Instagram Ads for Gyms and Personal Trainers",
    description:
      "Fitness is made for Instagram and governed by some of its strictest ad rules. Here's what you can run, what gets rejected, and why retention beats sign-ups.",
    publishedAt: "2026-09-01",
    keywords: [
      "Facebook ads for gyms UK",
      "Instagram ads personal trainer",
      "gym marketing ideas UK",
      "personal trainer advertising",
    ],
    sections: [
      {
        paragraphs: [
          "Fitness looks like the easiest thing in the world to advertise. It's visual, people follow it voluntarily, and the results are the product.",
          "In practice it's one of the trickier categories to run ads in, because the most persuasive material — the transformation photo, the line that names someone's insecurity — is exactly what the platform prohibits. Plenty of gyms find this out through a run of rejected adverts rather than by reading the rules first.",
        ],
      },
      {
        heading: "The two rules that catch everyone",
        paragraphs: [
          "Before-and-after images are prohibited for body transformations. Not discouraged — prohibited. This surprises people every time, because it's usually the single strongest asset a trainer owns.",
          "The second is personal attributes. Your ad must not imply you know something about the person seeing it, and body copy in this industry breaks that constantly. \"Struggling to lose weight?\" implies you know they are. \"Weight loss coaching in Leeds\" says the same thing about your service without making a claim about the reader.",
          "It's a small change in phrasing with a large effect on whether your ads run. Describe what you do, not who you think is reading.",
        ],
      },
      {
        heading: "What to advertise instead",
        paragraphs: [
          "The thing stopping most people joining a gym isn't doubt about whether training works. It's not knowing what walking in will be like — whether they'll be the least fit person there, whether anyone will show them how the machines work, whether they'll look stupid.",
          "Advertising that answers that outperforms transformation content, and it's entirely compliant:",
        ],
        bullets: [
          "The space, filmed when it's quiet — people are deciding whether they'd feel comfortable there before they decide anything else",
          "You, talking to camera. In personal training the trainer is the product, and nobody signs up to a logo",
          "What a first session actually involves, start to finish. It removes the main reason people put off booking",
          "Real members training normally, with permission — ordinary people mid-session beat stock footage of models every time",
          "Straight pricing. Fitness is a category where prices are often hidden, so publishing yours is a genuine differentiator and it filters out the enquiries you'd have wasted a call on",
        ],
      },
      {
        heading: "January isn't the only season",
        paragraphs: [
          "Everyone in this industry advertises in January, which makes January the most expensive month of the year to buy attention. You're bidding against every gym in the country for the same audience.",
          "September is the quieter opportunity — the back-to-routine month, when people return from holidays and the year restarts in a way it doesn't in April. Competition is lower and so are costs.",
          "Both matter less than running all year. A gym that only advertises in January builds an audience once and then goes quiet for eleven months, which means starting from nothing every time. Steady spend beats a seasonal spike.",
        ],
      },
      {
        heading: "The offer problem",
        paragraphs: [
          "Free trials and heavy discounts fill a gym with people who came for the discount. They use it for a fortnight, don't convert to full price, and you've paid to acquire someone who was never going to stay.",
          "A trial that costs something small tends to work better than a free one. It's a lower barrier than a full membership but high enough that the person turning up has actually decided something.",
          "For personal trainers, the strongest offer is usually a consultation rather than a session — it's a conversation, not a workout, so it doesn't require the person to already feel fit enough to show up.",
        ],
      },
      {
        heading: "Retention is the number that decides everything",
        paragraphs: [
          "This is a membership business, so what a new member is worth depends almost entirely on how long they stay. Someone paying £40 a month is worth £120 if they leave after three months and £480 if they stay a year.",
          "That changes what you can afford to spend acquiring them, which is why two gyms with identical ad costs can have completely different outcomes. The one that keeps people can outbid the one that doesn't, indefinitely.",
          "It also means the highest-return work often isn't in the ad account at all. If members leave at month three, more advertising just fills a bucket with a hole in it — and the first thirty days after someone joins do more for the numbers than any change to targeting.",
        ],
      },
    ],
  },
  {
    slug: "meta-special-ad-categories-explained",
    title: "Meta's Special Ad Categories: What You Have to Declare",
    description:
      "Credit, employment and housing ads must be declared before you run them. Here's what counts, what it costs you in targeting, and why declaring is the only option.",
    publishedAt: "2026-08-31",
    keywords: [
      "Facebook ads special ad category",
      "restricted ad categories Meta UK",
      "special ad category housing employment credit",
      "do I need to declare special ad category",
    ],
    sections: [
      {
        paragraphs: [
          "When you build a campaign, Meta asks whether your ads fall into a special ad category. It's easy to click past, and plenty of businesses do — either because they don't recognise the terms or because declaring visibly costs them targeting.",
          "It's worth understanding properly, because getting it wrong is one of the faster ways to lose an ad account rather than just an advert.",
        ],
      },
      {
        heading: "What counts",
        paragraphs: [
          "Four areas, and they're broader than most people assume:",
        ],
        bullets: [
          "Credit — loans, finance, credit cards, buy now pay later, and car or equipment finance. If your ad mentions monthly payments or finance availability, you're in this category",
          "Employment — job adverts, recruitment, apprenticeships, and anything promoting work opportunities",
          "Housing — property for sale or rent, estate and letting agency services, mortgages and related insurance",
          "Social issues, elections and politics — campaigning content, and this one catches charities and community groups more often than they expect",
        ],
      },
      {
        heading: "Why the rule exists",
        paragraphs: [
          "These aren't arbitrary. They're the areas where targeted advertising has historically been used to exclude people — showing housing only to certain groups, or job adverts only to a particular age range.",
          "That's unlawful discrimination in the UK under the Equality Act, and it's the reason the platform now restricts targeting in these categories by default rather than trusting each advertiser to behave.",
          "Understanding that helps, because it explains why the restrictions are what they are and why there's no legitimate way around them.",
        ],
      },
      {
        heading: "What declaring actually costs you",
        paragraphs: [
          "The restrictions are real and worth planning for. Once declared, you lose the ability to target by age or gender, detailed interest and behaviour targeting is heavily limited, and location targeting has to cover a wider area than a normal local campaign would.",
          "Lookalike audiences work differently too — you can still build them, but not in the usual form.",
          "For a local estate agent or a garage advertising finance, that's a genuine constraint. You're paying to reach a broader audience than you'd choose, and your costs will usually reflect that.",
        ],
      },
      {
        heading: "Working within it rather than around it",
        paragraphs: [
          "The productive response is to change what you advertise rather than trying to dodge the declaration.",
          "A car dealer can advertise the car — the specification, the price, the mileage — without mentioning finance at all, and discuss payment options once someone has enquired. That's a normal ad with normal targeting, and it usually performs better anyway because the car is the interesting part.",
          "An estate agent can advertise the valuation service to homeowners rather than listing properties. A recruiter can build brand presence rather than running job adverts through paid social.",
          "None of that is a loophole. If the ad genuinely doesn't promote credit, housing or employment, it isn't in the category. What matters is that the advert reflects what you're actually promoting — an ad about finance with the word finance removed is still a finance ad, and it will be treated as one.",
        ],
      },
      {
        heading: "What happens if you don't declare",
        paragraphs: [
          "Usually the advert gets rejected. Sometimes it runs for a while and then gets pulled retrospectively, which is worse because you've built up a pattern by then.",
          "Repeated undeclared ads in these categories put the ad account itself at risk, and account restrictions are considerably harder to resolve than a rejected advert. You lose the campaign history, the audiences and the learning along with the access.",
          "Given the choice between broader targeting and no account at all, the decision makes itself.",
        ],
      },
      {
        heading: "One that isn't on the list",
        paragraphs: [
          "Health and beauty businesses often assume they're a special ad category. They aren't — a clinic doesn't declare anything.",
          "But the rules on personal attributes and unrealistic outcomes apply with more force in that sector, and before-and-after imagery is prohibited outright. Different rules, same requirement to know them before spending money.",
          "If you're unsure which side of a line your business sits on, it's a ten minute conversation before you build the campaign rather than an appeal afterwards.",
        ],
      },
    ],
  },
  {
    slug: "reading-your-meta-ads-report",
    title: "Reading Your Meta Ads Report: The Only Five Numbers That Matter",
    description:
      "Ads Manager shows hundreds of columns and most of them are noise. Here are the five worth looking at, and the one that isn't in there at all.",
    publishedAt: "2026-08-30",
    keywords: [
      "Facebook ads metrics explained",
      "Meta ads reporting for beginners",
      "how to read Facebook ads results",
      "which Facebook ad metrics matter",
    ],
    sections: [
      {
        paragraphs: [
          "Ads Manager will show you hundreds of columns if you let it. Reach, impressions, engagement, video plays at three seconds, cost per thousand — an enormous amount of measurement, most of which has no bearing on whether your advertising is working.",
          "It's also why agency reports are often so long. A twelve-page document full of graphs looks like value for money. It's usually easier to produce than a straight answer about whether the money came back.",
          "Five numbers will tell you almost everything you need.",
        ],
      },
      {
        heading: "1. Results",
        paragraphs: [
          "How many of the thing you actually wanted. Leads, messages, bookings — whatever the campaign was set up to produce.",
          "Check the column header says what you think it says. A campaign optimised for link clicks will happily report a healthy number of results that are just clicks, and it's an easy mistake to celebrate for a fortnight before noticing.",
        ],
      },
      {
        heading: "2. Cost per result",
        paragraphs: [
          "Amount spent divided by results. The number most people look at first, and the one most likely to mislead them.",
          "It's genuinely useful for comparing two ads in the same campaign — same audience, same offer, same week. It's close to meaningless compared against another business, another industry, or an average you read somewhere.",
          "It also moves in the wrong direction when you do the right thing. Tighten your form to filter out accidental submissions and your cost per result rises, while your actual business improves. Judge it against your own history, not anyone else's, and never on its own.",
        ],
      },
      {
        heading: "3. Amount spent",
        paragraphs: [
          "Obvious, but worth checking rather than assuming. It tells you whether the budget you set is actually being delivered.",
          "If you set £10 a day and it's spending £4, something is limiting delivery — usually an audience too small, a bid cap that's too tight, or a campaign still stuck in learning. That underspend is the real problem, and it won't show up anywhere else.",
        ],
      },
      {
        heading: "4. Click-through rate",
        paragraphs: [
          "The percentage of people who saw the ad and clicked it. This is your read on the creative specifically.",
          "A low click-through rate means the ad isn't interesting to the people seeing it — either the wrong people, or the wrong ad. A healthy click-through rate combined with few results points somewhere else entirely: the landing page or the form, not the ad.",
          "That distinction is the single most useful thing in the whole report, because it tells you which half of the problem to work on. Without it you end up rewriting perfectly good ads to fix a page that's letting people down.",
        ],
      },
      {
        heading: "5. Frequency",
        paragraphs: [
          "The average number of times each person has seen your ad. Quietly one of the most important numbers, and one most people never look at.",
          "Climbing frequency with falling results means the audience has seen enough. This happens fastest to local businesses, because a tight radius means a small pool of people to show ads to — the same faces, over and over.",
          "When it climbs, the fix is new creative or a wider audience, not more budget. Spending more against a fatigued audience just shows the same ad to the same people more often, and irritation is not a marketing strategy.",
        ],
      },
      {
        heading: "What to ignore",
        paragraphs: [
          "Reach, impressions, engagement, likes, shares and video views are all things you can point at when the results aren't there. None of them pays wages.",
          "Cost per thousand impressions has a use for diagnosing sudden cost changes, but it isn't a performance measure and shouldn't lead a report.",
          "If a monthly update leads with reach and engagement rather than enquiries and what they cost, it's worth asking why those were the numbers chosen.",
        ],
      },
      {
        heading: "The number that isn't in Ads Manager",
        paragraphs: [
          "The one that actually decides everything is how many of those leads became paying customers, and Meta cannot tell you. It knows someone submitted a form. It has no idea whether they answered the phone, turned up, or spent anything.",
          "Which means the most important reporting job isn't in the ad account at all. Keep a simple record: leads received, leads reached, appointments booked, customers won. A spreadsheet is enough to start.",
          "Once you have that, everything else becomes straightforward. Forty leads at £4 that produce two customers is worse than twelve at £15 that produce four — and every metric in Ads Manager will tell you the opposite until you're tracking what happened afterwards.",
        ],
      },
    ],
  },
  {
    slug: "used-car-dealer-meta-ads-strategy",
    title: "Used Car Dealers vs Franchise Dealers: Different Meta Ads Strategy",
    description:
      "Independent dealers advertise stock, franchises advertise a brand. Getting that the wrong way round is why most dealership social ads quietly do nothing.",
    publishedAt: "2026-08-29",
    keywords: [
      "used car dealer marketing",
      "Facebook ads for car dealerships UK",
      "independent car dealer advertising",
      "Instagram ads used cars",
    ],
    sections: [
      {
        paragraphs: [
          "Walk past a franchise showroom and the advertising is doing one job: reminding you the brand exists and is nearby. It's paid for centrally, it runs constantly, and nobody expects a single advert to sell a car on its own.",
          "Independent dealers copy that style all the time, and it's the wrong model entirely. The budget isn't there for it, and it isn't how people find an independent forecourt in the first place.",
        ],
      },
      {
        heading: "Franchises sell a brand, independents sell stock",
        paragraphs: [
          "A franchise dealer benefits from years of manufacturer advertising. Someone already wants that badge before they start looking, so the dealer's job is mostly to be the nearest option when the decision is made.",
          "An independent has none of that. Nobody wakes up wanting to buy from your forecourt specifically — they want a particular car at a particular price, within a sensible drive.",
          "So the advertising has to lead with the car, not the business. A specific vehicle, the year, the mileage, the price. That's what people are actually shopping for, and it's what makes someone stop scrolling.",
        ],
      },
      {
        heading: "Advertise cars, not the dealership",
        paragraphs: [
          "The most common mistake is an ad that says something like \"quality used cars, finance available, family run since 1998.\" It's all true and it gives nobody a reason to tap.",
          "Compare that with a specific car, priced, filmed on the forecourt, with the mileage and MOT stated plainly. One is a business card. The other is something a person in the market can act on.",
          "This also solves the creative problem that stops most dealers advertising consistently. You don't need to invent content — your stock changes every week and each arrival is a new ad. A ninety second walkaround filmed on a phone will usually outperform anything more polished, because it looks like what it is.",
        ],
      },
      {
        heading: "What tends to work on a forecourt budget",
        paragraphs: [
          "A few things behave differently in this trade than in most:",
        ],
        bullets: [
          "Lead with your most interesting car, not your cheapest — an unusual or well-specced vehicle earns attention that a beige hatchback never will, and the enquiries it brings look at everything else too",
          "Say the price. Ads without a price get more clicks and far fewer buyers, and you'll spend the difference answering the same question forty times",
          "Keep the radius realistic — people will travel further for a car than for a haircut, but not indefinitely. Somewhere around an hour is usually the sensible ceiling",
          "Film the walkaround yourself, including the bits people worry about, because a dealer willing to show a stone chip reads as more trustworthy than one showing only glamour shots",
          "Retarget anyone who viewed a specific vehicle on your site — that's the warmest audience an independent dealer will ever have",
        ],
      },
      {
        heading: "Finance advertising has rules you can't ignore",
        paragraphs: [
          "This is where dealerships get into trouble. Anything promoting credit falls under Meta's special ad category rules and has to be declared as such when the campaign is built. Declaring it restricts your targeting, which is exactly the point of the rule.",
          "Running finance ads without declaring them is the kind of breach that escalates from a rejected advert to a restricted ad account, and getting an account back is a considerably worse week than losing some targeting precision.",
          "Beyond Meta's rules, consumer credit advertising is regulated in its own right in the UK, and representative examples and APR disclosures have to be correct. If you're advertising finance, that copy needs signing off by someone who knows those rules rather than being written to sound appealing. The simpler route, and often the more effective one, is to advertise the car and discuss finance once someone's enquired.",
        ],
      },
      {
        heading: "The enquiry is where deals are lost",
        paragraphs: [
          "Car buyers enquire on several vehicles at several dealers on the same evening. It's a considered purchase made in a distinctly unconsidered way — a few messages fired off from the sofa.",
          "Whoever replies first, with the actual answer rather than \"is this still available?\", tends to get the viewing. And the viewing is where the car sells itself.",
          "That's why speed matters more here than almost anywhere else. An independent competing against a franchise with a full sales floor can't win on stock levels or opening hours, but can absolutely win on replying to a nine o'clock message before the following afternoon.",
        ],
      },
    ],
  },
  {
    slug: "what-300-a-month-on-meta-ads-buys-you",
    title: "What £300 a Month on Meta Ads Actually Buys You",
    description:
      "A small budget isn't automatically a wasted one, but it does change what's realistic. Here's what £10 a day genuinely gets you and where it falls short.",
    publishedAt: "2026-08-28",
    keywords: [
      "small Facebook ads budget UK",
      "£10 a day Facebook ads",
      "minimum budget Meta ads",
      "low budget Instagram advertising",
    ],
    sections: [
      {
        paragraphs: [
          "£300 a month is roughly £10 a day, and it's where a lot of small businesses start. It's a sensible amount to risk on something unproven — big enough to be a real test, small enough that a bad month doesn't hurt.",
          "What it isn't is a version of a larger budget that simply takes longer. A small budget behaves differently, and knowing how changes what you should expect and what you should do with it.",
        ],
      },
      {
        heading: "What it realistically produces",
        paragraphs: [
          "The honest answer is that it depends almost entirely on what you sell and where. Cost per lead varies enormously between a £40 haircut and a £4,000 loft conversion, and any agency quoting you a specific number before looking at your business is guessing.",
          "But the arithmetic is easy enough to do yourself. If leads come in around £5, £300 buys roughly sixty a month. At £15 a lead, it's twenty. At £40 — plausible for high-value trades and professional services — it's about seven.",
          "Seven leads a month sounds thin until you attach a value. If two of those become customers worth £2,000 each, £300 was an extremely good month's work. That's the sum that matters, not the lead count in isolation.",
        ],
      },
      {
        heading: "The constraint nobody mentions",
        paragraphs: [
          "Meta's system needs a certain volume of conversions to optimise properly — its own guidance points at roughly fifty per week before an ad set settles out of the learning phase.",
          "At £10 a day you're very unlikely to reach that. The practical consequence is that your campaign stays noisier for longer. Results swing about more week to week, and it takes longer before the numbers mean anything.",
          "That's not a reason to avoid starting. It is a reason to be patient, and a strong reason not to make changes every few days because a bad Tuesday looked alarming.",
        ],
      },
      {
        heading: "How to make a small budget work harder",
        paragraphs: [
          "Small budgets punish anything that spreads them thin. A few things matter far more at this level than they would at ten times the spend:",
        ],
        bullets: [
          "One campaign, not three — three at £3.33 a day each gather almost no signal, and none of them will ever settle",
          "One offer, one audience — resist testing five things at once, because you'll never get a clear answer on any of them",
          "Keep the radius tight, since a wide area spreads a small budget across people who were never going to travel to you",
          "Two ad creatives maximum, so each gets enough delivery to tell you something",
          "Leave placements on automatic — restricting them shrinks the auction and pushes your costs up, which a small budget can least afford",
        ],
      },
      {
        heading: "Where the money actually leaks",
        paragraphs: [
          "At £300 a month, the biggest risk isn't the ads underperforming. It's losing the enquiries you paid for.",
          "If £300 buys twenty leads and half never get a reply within the day, you effectively spent £150 on nothing. No change to targeting or creative recovers that — it's lost after the ad has done its job.",
          "This is why we'd always rather a business sorted out how enquiries get answered before increasing spend. Doubling the budget doubles the leads and doubles what leaks. Fixing the follow-up costs nothing and improves every pound you've already spent.",
        ],
      },
      {
        heading: "When to spend more, and when not to",
        paragraphs: [
          "Increase the budget when you know what a lead costs and what proportion become customers. At that point more spend is arithmetic rather than hope.",
          "Don't increase it because a month was disappointing. If £300 produced nothing usable, £600 will most likely produce nothing usable twice as fast. Something else is wrong — the offer, the audience, the page they land on, or the follow-up.",
          "And be realistic about the floor. Below about £5 a day, campaigns struggle to gather enough data to be worth analysing at all. If £150 a month is genuinely the ceiling, the honest advice is usually to wait, save up, and run a proper three-month test rather than dribble it away across six months of noise.",
        ],
      },
    ],
  },
  {
    slug: "why-meta-ads-get-low-quality-leads",
    title: "Why Your Meta Ads Are Getting Low-Quality Leads (and How to Fix It)",
    description:
      "Wrong numbers, people who don't remember enquiring, nobody answering the phone. Poor lead quality is usually a settings problem, and it's fixable.",
    publishedAt: "2026-08-27",
    keywords: [
      "poor quality Facebook leads",
      "fake leads Facebook ads",
      "improve Meta lead quality",
      "instant form lead quality UK",
    ],
    sections: [
      {
        paragraphs: [
          "The campaign looks like it's working. Leads are arriving, the cost per lead is low, the graph in Ads Manager points the right way. Then you start ringing them.",
          "Numbers that don't connect. People who don't recall filling anything in. Someone who thought they were entering a competition. It's a specific kind of frustrating, because on paper you're winning.",
          "This is one of the most common complaints about Meta lead ads, and it's rarely a sign the platform doesn't work. It's usually a handful of settings doing exactly what they were configured to do.",
        ],
      },
      {
        heading: "Instant Forms are designed to be easy — that's the problem",
        paragraphs: [
          "Instant Forms exist to remove friction. They open inside the app, they pre-fill name, email and phone from the person's account, and submitting takes two taps.",
          "That's brilliant for volume and terrible for intent. Someone can complete your form almost accidentally, while half-watching something else, without ever consciously deciding to contact your business. The details are real — they came from a real account — but the interest often isn't.",
          "Pre-filling also means the phone number is whatever they entered when they signed up years ago. It's not a fake number, it's an abandoned one. They never check it.",
        ],
      },
      {
        heading: "The settings that make the biggest difference",
        paragraphs: [
          "Most lead quality problems are solved in the form itself rather than in the targeting:",
        ],
        bullets: [
          "Choose the higher intent form type — it adds a review step before submission, so people confirm rather than tapping straight through. Fewer leads, noticeably better ones",
          "Add one qualifying question with real options, so completing the form requires an actual decision rather than reflex",
          "Turn off automatic field completion where you can, since typing a number means you get one the person actually uses",
          "Optimise for leads rather than link clicks, or you're paying the system to find people who like tapping adverts",
          "Keep the form to four fields — every extra question loses completions without improving quality, and you can qualify properly on the call",
        ],
      },
      {
        heading: "Say the price in the ad",
        paragraphs: [
          "The most effective quality filter isn't a setting at all. It's putting something in the ad copy that makes unsuitable people scroll past.",
          "A starting price does this better than anything. \"From £400 a month\" costs you a good number of enquiries and almost none of them were going to buy. What's left is people who saw the number and enquired anyway, which is a far more useful conversation.",
          "The same applies to eligibility. If you only serve a certain area, only take certain jobs, or have a minimum, say so plainly. Every ad you write is either filtering or it isn't, and vague copy filters nothing.",
        ],
      },
      {
        heading: "Some of it isn't the leads",
        paragraphs: [
          "It's worth checking one uncomfortable possibility before blaming the campaign: how long is it taking to ring these people?",
          "Instant Form leads go cold faster than almost any other kind, precisely because they took so little effort. Someone who tapped through in five seconds has minimal investment in remembering it. Call them three days later and of course they sound confused — they've genuinely forgotten, and that reads exactly like a bad lead.",
          "The same enquiry called within the hour behaves completely differently. Before concluding the leads are junk, check how quickly they're being contacted, and how many attempts are being made. One unanswered call at two in the afternoon is not a fair test of anything.",
        ],
      },
      {
        heading: "The trade-off nobody mentions",
        paragraphs: [
          "Every one of these changes will make your cost per lead look worse. That's not a side effect, it's the mechanism — you're deliberately buying fewer, more considered enquiries.",
          "Which means cost per lead stops being a useful measure the moment you start optimising for quality. If forty leads at £4 produce two customers and twelve leads at £15 produce four, the expensive campaign is comfortably the better one, and any report based on cost per lead will tell you the opposite.",
          "So track what happened after the call — how many were reachable, how many booked. Without that, you're optimising toward the cheapest possible way of generating people who never answer the phone.",
        ],
      },
    ],
  },
  {
    slug: "do-you-need-a-big-following-to-run-meta-ads",
    title: "Do You Need a Big Following to Run Meta Ads?",
    description:
      "A common reason businesses delay advertising is having barely any followers. It's the wrong thing to wait for, and here's why the two are largely unrelated.",
    publishedAt: "2026-08-26",
    keywords: [
      "do I need followers to run Facebook ads",
      "Facebook ads without followers",
      "how many followers to run Instagram ads",
      "Instagram ads new business UK",
    ],
    sections: [
      {
        paragraphs: [
          "It comes up in almost every first conversation. Someone wants to advertise but feels they should wait — build the page up a bit first, get to a thousand followers, make the profile look established. Advertising to nobody feels premature.",
          "It's an understandable instinct and it's the wrong sequence. Paid reach and organic reach are two largely separate systems, and waiting for one before starting the other usually costs a business months it didn't need to spend.",
        ],
      },
      {
        heading: "Paid reach doesn't come from your followers",
        paragraphs: [
          "When you post organically, Meta shows it to some portion of the people who already follow you. Your follower count is the ceiling on that, which is why growing it feels so important.",
          "Paid reach works differently. You're buying access to Meta's entire user base, filtered by location, age and behaviour. The system shows your ad to people chosen by targeting, not by whether they've heard of you. An account with eleven followers and an account with eleven thousand are bidding into the same auction for the same strangers.",
          "This is why a brand new business can run a campaign on day one and generate enquiries in the first week. The audience was never yours to build — you're renting access to it.",
        ],
      },
      {
        heading: "Where the follower count does matter",
        paragraphs: [
          "It isn't entirely irrelevant, just misunderstood. Followers don't affect delivery or cost. What they affect is what happens after someone taps your name.",
          "A proportion of people who see your ad will check the profile before enquiring, particularly for anything involving trust, money or their body. What they're looking for isn't a follower number — it's evidence that the business is real and currently operating.",
          "A profile with nine posts and forty followers reads as a small business. A profile with two posts from last year and no bio reads as abandoned, and that's the one that costs you enquiries. The fix takes an afternoon, not six months.",
        ],
      },
      {
        heading: "What's actually worth having before you spend",
        paragraphs: [
          "There's a short list of things that genuinely affect results, and none of them is a follower count:",
        ],
        bullets: [
          "A profile that looks live — a clear bio saying what you do and where, a handful of recent posts, contact details that work",
          "Somewhere for the enquiry to land — a landing page or an instant form, not just a link to your homepage",
          "A way to be contacted that suits the customer, which for most local businesses means WhatsApp or a phone number, not only email",
          "Someone able to reply quickly, because response speed changes outcomes far more than anything on your profile",
          "The Pixel installed, so the campaign can learn from day one rather than starting blind",
        ],
      },
      {
        heading: "The cost of waiting",
        paragraphs: [
          "Building a following organically from a standing start is slow, unpredictable work, and for most local service businesses it isn't where the customers come from anyway. A plumber does not need an audience. They need to appear in front of people whose boiler has stopped working.",
          "There's also a compounding cost to delay. The Pixel only records visitors from the day it's installed, campaigns need weeks to settle before their numbers mean anything, and the audiences you'll eventually want to retarget can only be built by having traffic in the first place. Six months of waiting isn't neutral — it's six months of data you never collected.",
          "Meanwhile the ads themselves tend to grow the following as a side effect. People who see your ads and aren't ready to buy often follow instead, which means the audience you were waiting to build arrives as a by-product of advertising rather than a prerequisite for it.",
        ],
      },
      {
        heading: "The honest version",
        paragraphs: [
          "If your profile is genuinely empty, spend an afternoon on it before you spend money. Write the bio, post a few pieces of real work, make sure someone tapping your name finds a business that clearly exists. That's worth doing and it's a day's work.",
          "But don't confuse that with needing an audience. The number under your name has almost no bearing on whether your ads reach the right people or what they cost.",
          "The businesses that struggle with paid advertising are rarely the ones with small followings. They're the ones sending traffic somewhere weak, or letting enquiries sit unanswered until the person has booked elsewhere.",
        ],
      },
    ],
  },
  {
    slug: "what-the-meta-pixel-actually-does",
    title: "What the Meta Pixel Actually Does, and Why It Matters More Than It Used To",
    description:
      "The Pixel isn't just analytics. It's what tells Meta which of your ads produced real customers, and without it the system is optimising half blind.",
    publishedAt: "2026-08-25",
    keywords: [
      "Meta Pixel explained",
      "Facebook pixel small business",
      "what does the Meta Pixel do",
      "Conversions API small business UK",
    ],
    sections: [
      {
        paragraphs: [
          "The Meta Pixel gets explained as a tracking tool, which makes it sound like analytics — a way of counting visitors that you could reasonably put off until you've got time.",
          "That undersells what it does. The Pixel isn't primarily there so you can look at numbers. It's there so Meta can learn which people are worth showing your ads to. Without it you're not just missing reporting, you're running campaigns that can't improve.",
        ],
      },
      {
        heading: "The feedback loop is the point",
        paragraphs: [
          "When you run a campaign, Meta makes a series of guesses about who might respond. What turns guessing into targeting is finding out what happened next.",
          "The Pixel is what closes that loop. It reports back that this particular person, from this particular ad, went on to fill in your form. Meta then goes looking for more people who resemble the ones who converted, rather than the ones who merely clicked.",
          "That distinction matters enormously. Without conversion data, the system optimises toward clicks — and the people most likely to click an advert are not reliably the people most likely to become customers. You end up paying for attention rather than enquiries.",
        ],
      },
      {
        heading: "What it actually records",
        paragraphs: [
          "By default the Pixel records page views. The useful part is the events you define on top of that — the specific actions that matter to your business:",
        ],
        bullets: [
          "Lead — someone submitted your enquiry form. For most service businesses this is the only event that really matters",
          "Contact — a phone tap or a click through to WhatsApp, which often captures people who'd never fill in a form",
          "ViewContent — someone looked at a specific service or pricing page, a useful signal of genuine interest",
          "CompleteRegistration or Schedule — a booking made, where you take appointments online",
          "Purchase — for anything sold directly on the site, with the value attached so return can be calculated properly",
        ],
      },
      {
        heading: "Why browser tracking alone stopped being enough",
        paragraphs: [
          "The Pixel runs in the visitor's browser, and browsers have become considerably less accommodating. Privacy settings, tracking prevention and ad blockers all interfere with it, and a meaningful share of conversions simply never get reported.",
          "The consequence isn't only inaccurate reporting. Every missing conversion is a piece of learning the system never receives, so campaigns optimise on a partial picture and costs drift upward.",
          "This is what the Conversions API addresses. Instead of relying solely on the visitor's browser, your server sends the same events directly to Meta. Both methods run together, each event carries a shared identifier so the same conversion isn't counted twice, and between them they recover a good deal of what the Pixel alone loses.",
          "Setting both up is more work than pasting in a snippet, and it's genuinely worth it once you're spending real money.",
        ],
      },
      {
        heading: "It only counts from the day you install it",
        paragraphs: [
          "This is the part people regret. The Pixel has no memory of anything before it existed. It cannot be pointed at last year's traffic, and there's no way to reconstruct the audience you'd have built.",
          "So the sensible move is to install it now, even if advertising is months away. It costs nothing to run, it quietly accumulates the audience you'll later want to retarget, and by the time you launch you're starting with history rather than from zero.",
          "The reverse is a genuinely expensive mistake — running ads for months with no Pixel, then installing one and effectively starting the learning process again from nothing.",
        ],
      },
      {
        heading: "The obligations that come with it",
        paragraphs: [
          "Tracking visitors brings responsibilities under UK GDPR and PECR. Non-essential tracking needs consent, which means a cookie banner that genuinely works — one that doesn't fire the Pixel until someone agrees, rather than one that announces tracking has already started.",
          "Your privacy policy should say plainly what you collect and why. None of this is onerous, but it is the sort of thing that gets skipped and then becomes a problem later.",
          "Take particular care with sensitive categories. Never send event data that reveals health conditions, financial circumstances or anything similar — a treatment name in a URL passed back as a conversion event is exactly the kind of detail that shouldn't be leaving your site.",
        ],
      },
    ],
  },
  {
    slug: "retargeting-for-small-businesses",
    title: "How to Set Up Retargeting When You're a Small Business",
    description:
      "Most people who visit your website leave without contacting you. Retargeting is how you get a second attempt, and it's usually the cheapest advertising you'll run.",
    publishedAt: "2026-08-24",
    keywords: [
      "Facebook retargeting small business",
      "warm audience ads UK",
      "how to set up retargeting ads",
      "Meta remarketing for small business",
    ],
    sections: [
      {
        paragraphs: [
          "The overwhelming majority of people who land on your website leave without doing anything. They read a bit, maybe check your prices, and then something interrupts them — a phone call, a train stop, a child. They meant to come back. They didn't.",
          "Retargeting is simply showing an ad to those people afterwards. It's one of the few pieces of advertising where the audience already knows who you are, and for most small businesses it's the cheapest source of enquiries available.",
        ],
      },
      {
        heading: "Why it costs so much less",
        paragraphs: [
          "A cold audience ad has to do three jobs at once: get attention, explain who you are, and persuade someone to act. A retargeting ad only has to do the third, because the first two already happened.",
          "That difference shows up in the numbers. Retargeting audiences are small, so they won't carry your whole campaign — but the cost per enquiry is usually a fraction of what cold traffic costs, because you're talking to people who already showed interest.",
          "It's the closest thing in advertising to picking up money you've already spent to earn. You paid to get those visitors once. Retargeting is what stops that spend evaporating when they don't convert on the first visit.",
        ],
      },
      {
        heading: "You need the Pixel installed first",
        paragraphs: [
          "Retargeting depends on Meta knowing who visited your site, and that requires the Meta Pixel — a small piece of tracking code on every page. Without it there's no audience to retarget, and no way to build one retrospectively.",
          "This is the part worth doing today even if you're not advertising yet. The Pixel only records people who visit after it's installed. Every week it isn't there is a week of visitors you can never reach again.",
          "It's also worth setting up the Conversions API alongside it if you can. Browser-based tracking gets blocked by privacy settings and ad blockers fairly often, and sending the same events server-side fills in a meaningful share of what the Pixel alone misses.",
        ],
      },
      {
        heading: "The audiences actually worth building",
        paragraphs: [
          "Resist the urge to retarget everyone who ever touched your business. Intent varies enormously between someone who watched three seconds of a video and someone who started filling in your contact form. Separate them:",
        ],
        bullets: [
          "Visited your pricing or services page — the highest intent group on your site, and the one to spend most of your retargeting budget on",
          "Started your enquiry form but didn't submit it — small, but usually the best-converting audience you'll ever build",
          "Visited any page in the last 30 days — a broader catch-all for when the sharper audiences are too small to deliver",
          "Engaged with your Instagram or Facebook page — useful when your website traffic is still low, since it doesn't depend on the Pixel",
          "Watched most of a video — worth separating by how much they watched; someone who finished it is a different prospect from someone who scrolled past at two seconds",
        ],
      },
      {
        heading: "What the ad should actually say",
        paragraphs: [
          "The most common mistake is showing retargeted people the same ad they've already seen. They didn't act on it the first time, so repeating it mostly just annoys them.",
          "Assume they know who you are and answer whatever stopped them instead. If price was the hesitation, be direct about pricing. If it's trust, show a real result or the people behind the business. If it's simply that they got distracted, a plain reminder with an easy next step often does the job on its own.",
          "Keep the frequency sensible. These audiences are small, so a normal budget can end up showing the same person your ad several times a day, which turns a useful reminder into an irritation. Capping how often it appears, and refreshing the creative every few weeks, keeps it working.",
        ],
      },
      {
        heading: "When it's worth turning on",
        paragraphs: [
          "Retargeting needs traffic to retarget. If your site gets a handful of visitors a week, the audience will be too small for Meta to deliver against, and you're better off putting everything into reaching new people first.",
          "The sensible sequence is: install the Pixel now, run cold campaigns to build traffic, and switch retargeting on once there's a real audience to work with. By then you'll have weeks of visitors already collected, waiting.",
          "One caveat worth knowing: if your business falls under a special ad category — credit, employment or housing — website custom audiences aren't available to you in the usual way. Worth checking before you build a plan around it.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-health-beauty-wellness",
    title: "Meta & Instagram Ads for Health, Beauty & Wellness",
    description:
      "Salons and clinics are a natural fit for Instagram ads, but they face the strictest rules on the platform. Here's what you can advertise, and what works instead.",
    publishedAt: "2026-08-23",
    keywords: [
      "Instagram ads for salons",
      "Facebook ads for beauty clinics UK",
      "Instagram advertising for aesthetics clinics",
      "social media ads for wellness businesses",
    ],
    sections: [
      {
        paragraphs: [
          "Few sectors are better suited to Instagram than this one. The work is visual, the results are the product, and people genuinely enjoy following salons and clinics they like the look of. On paper it's the easiest advertising job there is.",
          "In practice it's one of the hardest, because health, beauty and wellness sit under the strictest advertising rules on the platform. The most persuasive assets these businesses own — the transformation photo, the message that speaks directly to someone's insecurity — are the exact things Meta prohibits.",
          "That's worth understanding properly rather than discovering through a string of rejected ads.",
        ],
      },
      {
        heading: "Why the rules are tighter here",
        paragraphs: [
          "Meta's position is that people shouldn't feel identified by an advert. An ad implying you know something about someone's body, health or appearance crosses that line, and it's enforced more strictly in this category than anywhere else.",
          "This catches ordinary, well-meaning copy constantly. \"Struggling with acne?\" and \"Unhappy with your smile?\" both imply knowledge about the reader. \"Book an acne consultation\" and \"Cosmetic dentistry in Manchester\" describe the same service to the same audience without making any claim about who's reading.",
          "The distinction feels pedantic until you realise it's the difference between an account running smoothly and an account under review.",
        ],
      },
      {
        heading: "The two things you can't do",
        paragraphs: [
          "Before-and-after imagery is prohibited for body and health transformations. This is the one that hurts most, because it's usually the single most convincing asset a clinic has.",
          "Promising outcomes is the second. Ads must not suggest results that can't reasonably be expected, and specific claims about how much someone will change make it worse rather than more credible.",
          "There's no clever workaround for either, and anyone offering you one is putting your ad account at risk to win your business. The productive question isn't how to get transformation photos approved — it's what to run instead, because the alternatives are genuinely effective.",
        ],
      },
      {
        heading: "What works instead",
        paragraphs: [
          "The thing actually stopping most people booking isn't doubt about whether the treatment works. It's not knowing what they're walking into — whether it hurts, how long it takes, what it costs, and whether they'll feel judged when they arrive.",
          "Advertising that answers those questions tends to outperform transformation photos anyway, and it happens to be entirely compliant:",
        ],
        bullets: [
          "The room — clean, calm, well lit. People are deciding whether they'd feel comfortable there, and they decide fast",
          "The practitioner talking to camera, explaining what a first appointment involves. Faces build trust in a way interiors can't",
          "Process footage — the tools, the preparation, the steps. It reads as competence without claiming anything",
          "Plain pricing. In a sector where prices are often hidden, publishing yours is a genuine differentiator and it filters out enquiries you'd have wasted time on",
          "Practical detail — parking, opening hours, how long to allow, whether there's downtime afterwards",
        ],
      },
      {
        heading: "The booking gap matters more than the ads",
        paragraphs: [
          "Appointment-led businesses share a specific problem: enquiries arrive at the worst possible time. Someone sees your ad at nine in the evening, sends a message asking about availability, and nobody sees it until the following afternoon because the team was with clients all day.",
          "By then a good proportion have booked elsewhere. Not because the other place was better — because it replied.",
          "This is why we'd usually push a clinic to sort out how enquiries get answered before increasing ad spend. If messages sit overnight, more advertising just produces more people who go somewhere else. Getting every channel into one place, so evening enquiries are seen and answered, tends to change the numbers more than any change to the ads.",
        ],
      },
      {
        heading: "Where to put the budget",
        paragraphs: [
          "Advertise a specific treatment rather than the business in general. \"Book a facial\" gives someone a decision to make; \"award-winning salon in Leeds\" doesn't. Pick the treatment with a good margin and reasonable repeat potential, and build the campaign around that one thing.",
          "Keep the radius tight. People travel a long way for a wedding venue and almost no distance for a regular appointment, so a wide radius mostly buys you enquiries that will never convert into a standing booking.",
          "And be realistic about the first month. New campaigns need time to settle before the numbers mean anything, and this is a sector where the strongest results usually come from the second visit onwards rather than the first.",
        ],
      },
    ],
  },
  {
    slug: "how-long-before-meta-ads-work-learning-phase",
    title: "How Long Before Meta Ads Start Working? The Learning Phase Explained",
    description:
      "Meta ads rarely perform properly in week one, and there's a mechanical reason for it. Here's what the learning phase is and what a realistic timeline looks like.",
    publishedAt: "2026-08-22",
    keywords: [
      "Facebook ads learning phase",
      "how long for Facebook ads to work",
      "Meta ads results timeline",
      "why are my Facebook ads not working yet",
    ],
    sections: [
      {
        paragraphs: [
          "The first few days of a new campaign are almost always disappointing. Costs look high, the leads are thin, and the obvious conclusion is that the ads don't work and the money is being wasted.",
          "Sometimes that's true. Far more often the campaign is doing exactly what it's supposed to be doing at that stage, and switching it off is the single most expensive mistake a business can make with paid advertising.",
        ],
      },
      {
        heading: "What the learning phase actually is",
        paragraphs: [
          "When you launch an ad set, Meta doesn't yet know which people respond to it. It has your targeting, your budget and your creative, but no evidence about who actually converts.",
          "So it experiments. It shows your ad across different segments of your audience, at different times, in different placements, and watches what happens. This is the learning phase, and Meta labels it as such in Ads Manager — it isn't something agencies invented to buy themselves time.",
          "During this period performance is genuinely unstable, and deliberately so. The system is spending some of your budget on finding out what doesn't work, because that's the only way to establish what does.",
        ],
      },
      {
        heading: "Why it takes as long as it does",
        paragraphs: [
          "Meta's own guidance is that an ad set generally leaves the learning phase after roughly 50 optimisation events within a seven-day window. If you're optimising for leads, that means about 50 leads a week before delivery settles.",
          "That threshold is where small budgets run into arithmetic. Take a hypothetical business paying around £5 per lead. Fifty leads a week is roughly £250 a week in ad spend — about £35 a day — before the system has enough signal to stabilise properly.",
          "Most small businesses start well below that, and that's a perfectly reasonable decision. But it's worth understanding the consequence: at £10 a day, you're not going to hit 50 events in a week, so the ad set may sit in learning for longer, or never fully exit it. Results still come, they're just noisier and take longer to settle.",
          "This is also the honest argument against splitting a small budget across several campaigns. Three campaigns at £5 a day each gather a third of the signal apiece. One campaign at £15 concentrates it, and concentrated signal is what the system needs.",
        ],
      },
      {
        heading: "The mistake that quietly restarts the clock",
        paragraphs: [
          "Significant edits to an ad set — changing the budget substantially, swapping the targeting, altering the optimisation event, replacing the creative — send it back into the learning phase. The progress it made is gone and it starts gathering evidence again.",
          "This creates a trap that catches a lot of people. Performance looks poor, so you make a change. That resets learning, so performance looks poor again, so you make another change. The campaign never gets far enough to stabilise, and the conclusion drawn at the end of the month is that Meta ads don't work for this business.",
          "The practical rule is to decide your changes in advance and make them deliberately, rather than reacting to a bad afternoon. Small budget adjustments are usually tolerated; wholesale changes are not.",
        ],
      },
      {
        heading: "A realistic timeline",
        paragraphs: [
          "What follows is a general shape rather than a promise — every business, budget and market behaves differently:",
        ],
        bullets: [
          "Days 1 to 4 — expect volatility and a cost per lead that looks alarming. Nothing meaningful can be concluded here. Leave it alone",
          "Days 5 to 14 — delivery usually begins to settle and a genuine cost per lead starts to emerge. This is the earliest point worth forming an opinion",
          "Weeks 3 to 4 — enough data to judge the creative properly and see which version is carrying the campaign. First sensible point to make real changes",
          "Months 2 to 3 — the campaign should be reasonably predictable, and the useful work shifts from the ads to what happens after the enquiry arrives",
        ],
      },
      {
        heading: "What to judge, and when",
        paragraphs: [
          "In the first fortnight, judge the mechanics rather than the outcome. Are the ads being delivered? Is anyone clicking? Are leads arriving with real contact details? Those tell you the campaign is functioning, which is all you can reasonably ask early on.",
          "From the third week, cost per lead becomes a fair measure. By the second month, the question worth asking is a different one entirely — not what a lead costs, but how many of them turn into paying customers. That number is usually determined by how quickly enquiries get answered rather than by anything in the ad account.",
          "The one thing worth committing to before you start is a minimum run. Give a campaign at least a month before deciding, and budget for that month up front. Advertising switched off in week two costs you the whole spend and teaches you nothing, which is genuinely the worst of both outcomes.",
        ],
      },
    ],
  },
  {
    slug: "why-meta-ads-get-rejected",
    title: "Why Meta Ads Get Rejected — and How to Get Them Approved",
    description:
      "Most ad rejections come down to a handful of predictable causes. Here's what actually triggers them, and how to write copy that gets approved first time.",
    publishedAt: "2026-08-21",
    keywords: [
      "Facebook ad rejected",
      "why was my Facebook ad rejected",
      "Meta ad policy UK",
      "Facebook ads approval process",
    ],
    sections: [
      {
        paragraphs: [
          "You write the ad, you pick the photo, you set the budget, and a few hours later there's an email saying your ad wasn't approved. No explanation you can make sense of, just a policy name and a link.",
          "It feels arbitrary, and the first assumption is usually that you've done something seriously wrong. Almost always you haven't. Rejections cluster around a small number of predictable causes, and once you know what they are, writing an ad that clears review first time stops being guesswork.",
        ],
      },
      {
        heading: "The review is automated, and it isn't personal",
        paragraphs: [
          "Ads are reviewed at a scale no human team could handle, so the first pass is done by automated systems reading your text, your image and the page you're sending people to. Those systems are pattern-matching, not reasoning about your intent.",
          "This has two practical consequences. The first is that a perfectly honest ad can be rejected because a phrase resembles one used by advertisers who weren't honest. The second is that appealing genuinely works, because a human review often overturns it.",
          "So treat a rejection as information rather than a verdict. What matters is reading the specific policy cited, because the fix is usually a single sentence.",
        ],
      },
      {
        heading: "Personal attributes: the rule that catches almost everyone",
        paragraphs: [
          "This is the single most common reason a legitimate small business ad gets pulled, and it surprises people every time because the copy sounds completely reasonable when you read it aloud.",
          "The rule is that your ad must not imply you know something personal about the person seeing it — their health, their finances, their age, their religion, their relationship status. Meta's concern is that people shouldn't feel identified or singled out by an advert.",
          "The tell is the second-person question. \"Struggling with back pain?\" implies you know the reader has back pain. \"Book a back pain assessment in Birmingham\" says the same thing about your service without making a claim about the reader. Same offer, same audience, completely different outcome at review.",
          "It applies far more widely than health. \"In debt?\", \"Overweight?\", \"Recently divorced?\" and \"Are you over 50?\" all trip the same rule. The fix is nearly always to describe what you do rather than who you think is reading.",
        ],
      },
      {
        heading: "Unrealistic outcomes and before-and-after images",
        paragraphs: [
          "The second big cluster is promises. Ads must not suggest outcomes that can't reasonably be expected, particularly around health, weight loss and money. Specific numbers make this worse, not better — a guaranteed figure attached to a result is one of the more reliable ways to get rejected.",
          "Before-and-after imagery is the visual version of the same rule, and it's prohibited outright for body and health transformations. This catches a lot of genuinely good businesses off guard, because before-and-afters are the most persuasive asset a clinic, gym or aesthetics practice owns.",
          "The workable alternative is to show the process and the place rather than the transformation. The room, the equipment, the practitioner explaining what happens in a first appointment. It converts better than people expect, because the thing stopping most people booking isn't doubt about the result — it's not knowing what they're walking into.",
        ],
      },
      {
        heading: "Special ad categories, and why declaring them matters",
        paragraphs: [
          "Some sectors sit in a separate regime entirely. If your ad relates to credit, employment, housing, social issues or politics, you're required to declare it as a special ad category when you build the campaign.",
          "Declaring it restricts your targeting — you lose detailed interest targeting, tight postcode radiuses and lookalike audiences in the usual form. That's the point of the rule, which exists to prevent discriminatory targeting in areas where it does real harm.",
          "The temptation is to skip the declaration to keep better targeting. Don't. Running an undeclared credit or housing ad is the kind of breach that escalates from a rejected ad to a restricted account, and getting an account reinstated is a far worse week than losing some targeting precision.",
          "Health and beauty work differently again — it isn't a special ad category, but the personal attribute and outcome rules apply with more force. If you run a clinic, assume your copy gets read more strictly than a plumber's, because it does.",
        ],
      },
      {
        heading: "What to do when an ad is rejected",
        paragraphs: [
          "Work through it in order rather than deleting the ad and starting again, which loses whatever learning the campaign has accumulated:",
        ],
        bullets: [
          "Read the actual policy named in the email — not the generic help page, the specific one linked, which usually contains examples close to what you wrote",
          "Look at your copy for anything addressed to the reader personally, and rewrite it to describe your service instead",
          "Check the landing page too — ads are reviewed alongside the page they point to, and a compliant ad sending traffic to a non-compliant page still fails",
          "Request a review if you believe it's wrong, and do it once rather than resubmitting repeatedly, which looks like evasion",
          "Edit the existing ad rather than creating a duplicate, so you keep the campaign's history",
        ],
      },
      {
        heading: "Getting approved first time",
        paragraphs: [
          "Most of this reduces to one habit: write about what you do, not about the person reading it. Describe the service, name the location, state the price if you have one, and let the targeting do the job of finding the right person.",
          "It's a small change in phrasing and it costs you nothing in persuasiveness. Ads written that way clear review more often, and in our experience they tend to read as more confident too — a business describing its work plainly sounds more sure of itself than one opening with a question about your problems.",
          "If you're in one of the stricter sectors, it's worth having someone check your copy against the policies before you spend anything. A rejection costs you a day. A restricted account can cost you the advertising channel altogether.",
        ],
      },
    ],
  },
  {
    slug: "crm-pipelines-explained-for-business-owners",
    title: "CRM Pipelines Explained for Business Owners Who Aren't Techy",
    description:
      "A pipeline is just the stages an enquiry passes through on its way to becoming a customer. Here's what that means in practice, and why most attempts fail.",
    publishedAt: "2026-08-20",
    keywords: [
      "simple CRM for small business UK",
      "what is a sales pipeline",
      "CRM explained for small business",
      "track enquiries small business",
    ],
    sections: [
      {
        paragraphs: [
          "\"CRM\" and \"pipeline\" are two of those words that make perfectly capable business owners assume the topic isn't for them. They sound like software problems — something with a dashboard, a monthly fee and a training video nobody watches.",
          "Underneath the jargon it's much simpler than that. A pipeline is just the list of stages an enquiry goes through between someone first contacting you and them becoming a paying customer. That's genuinely all it is.",
        ],
      },
      {
        heading: "What a pipeline actually is",
        paragraphs: [
          "Write down what happens to an enquiry in your business. For most, it looks something like: someone gets in touch, you speak to them, you send a price, they think about it, they book. Five steps.",
          "Those steps are your pipeline. A CRM is just a place where every enquiry sits visibly in whichever step it's currently at, instead of living in your head, a notebook, and four different apps.",
          "The value isn't in the software. It's that at any moment you can see how many people are waiting on a quote, how many said they'd think about it, and which ones haven't been contacted yet.",
        ],
      },
      {
        heading: "Why the notebook stops working",
        paragraphs: [
          "Tracking enquiries mentally works perfectly well at five a week. You remember who's who, you know who owes you a call, nothing slips.",
          "It stops working somewhere around fifteen or twenty, and the failure is gradual rather than dramatic. You don't forget the enquiry that came in an hour ago, and you don't forget the customer booked in tomorrow. What you forget is everyone in the middle — the person you quoted eight days ago who said they'd get back to you, and then didn't.",
          "That middle group is the most valuable and most neglected part of any small business. They've spoken to you, they know your price, they haven't said no. They're just waiting for a nudge nobody remembers to give them.",
        ],
      },
      {
        heading: "The stage that quietly loses you money",
        paragraphs: [
          "If you only ever fix one thing, make it this: know exactly who is sitting in the \"quoted, waiting to hear back\" stage, and have a habit of following up with them.",
          "Most businesses lose more revenue here than anywhere else in their marketing. Not to competitors, and not because the price was wrong — simply because the conversation stopped and nobody restarted it. A single follow-up message a week later recovers a meaningful share of those.",
          "This is also why a pipeline and paid advertising belong together. If you're spending money to generate enquiries and then losing a chunk of them in the middle stage, more ad budget just pushes more people into the same leak.",
        ],
      },
      {
        heading: "Keeping it simple enough to actually use",
        paragraphs: [
          "Most CRM attempts fail for one reason: someone builds something far too complicated, it becomes a chore to update, and within a month it's abandoned and quietly out of date — which is worse than no system at all, because now you don't trust what it says.",
          "A few things keep it usable:",
        ],
        bullets: [
          "Four to six stages, maximum — if you can't say them out loud from memory, it's too complex",
          "Name them after what actually happens, not sales jargon — \"Quoted\" and \"Waiting to hear back\" beat \"Qualified opportunity\"",
          "Everyone who touches an enquiry uses it, or it drifts out of date within a fortnight",
          "Every enquiry has one clear owner, so nobody assumes someone else is handling it",
          "It updates itself where possible — enquiries arriving from your ads, inbox or website should land in it automatically rather than needing typing in",
        ],
      },
      {
        heading: "What it won't do",
        paragraphs: [
          "A pipeline doesn't sell anything. It won't make a bad offer attractive or turn a slow reply into a fast one — it just makes visible what's already happening, which is often uncomfortable the first time you look at it properly.",
          "It also isn't free of effort. Something has to keep it current, whether that's a person or automation. A CRM nobody updates is just a more expensive notebook.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "You don't need software to begin. Write down your five stages on paper, then list every open enquiry under the right one. Most people find several they'd completely forgotten, and following those up is usually worth more than the next month of ad spend.",
          "When you want it running properly — enquiries flowing in automatically from your ads and inbox, follow-up happening without anyone remembering — that's what we build for clients from the Growth plan up. Get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "checklist-before-first-meta-ad-campaign",
    title: "A Simple Checklist Before You Launch Your First Meta Ad Campaign",
    description:
      "Most first campaigns fail on something set up before launch, not on the ads themselves. Fifteen things worth checking while it's still cheap to fix them.",
    publishedAt: "2026-08-19",
    keywords: [
      "how to start Facebook ads checklist",
      "Meta ads setup checklist",
      "launching first Instagram ad campaign",
      "what to do before running Facebook ads",
    ],
    sections: [
      {
        paragraphs: [
          "The frustrating thing about a first campaign going badly is that the cause is usually decided before it ever goes live. The targeting was fine, the creative was fine — but the Pixel wasn't firing, or the objective was set to traffic, or the page the clicks landed on took six seconds to load on a phone.",
          "None of that is difficult to fix. It's just far cheaper to fix beforehand than to discover three weeks and several hundred pounds later. Here's what's worth checking first, roughly in the order you'll meet it.",
        ],
      },
      {
        heading: "Before you spend anything: the account setup",
        paragraphs: [
          "Dull, and the source of most launch-day problems:",
        ],
        bullets: [
          "The ad account is in your name, not your agency's — this matters more than it sounds, because campaign history and accumulated Pixel data stay with whoever owns the account when you part ways",
          "Currency is set correctly — Meta will not let you change it afterwards, and fixing it means creating a whole new ad account from scratch",
          "A working payment method that won't decline — a card being refused is one of the most common reasons a first campaign fails to publish, and the error message rarely says so clearly",
          "The correct Facebook Page and Instagram account are connected — if you run more than one business, check this carefully, because ads defaulting to the wrong brand is easy to miss until someone points it out",
          "The Meta Pixel is installed and actually firing, verified in Test Events rather than assumed — without it Meta has no idea which clicks turned into enquiries, and cannot optimise toward the ones that do",
        ],
      },
      {
        heading: "The campaign settings that matter most",
        paragraphs: [
          "A handful of choices here account for most of the difference between a campaign that works and one that quietly wastes money:",
        ],
        bullets: [
          "The objective is leads or conversions, not traffic or engagement — this is the single most consequential setting, because it tells Meta what kind of person to go and find",
          "The budget is enough to gather data — a campaign fed too little sits in its learning phase, optimising badly, and the poor results get blamed on the platform rather than the budget",
          "Placements are left open unless you have a specific reason to restrict them, since narrowing them shrinks the pool Meta can buy from and usually raises costs",
          "Location targeting matches your realistic service area — a radius wider than you'd actually travel spends money on enquiries you'll turn down",
          "If your business touches credit, employment or housing, the Special Ad Category is declared — running restricted ads without declaring risks your ads and eventually your account",
        ],
      },
      {
        heading: "Where the click lands",
        paragraphs: [
          "You've now paid for the click. Everything from here decides whether it was worth anything.",
        ],
        bullets: [
          "The page loads quickly on a phone over mobile data, not just on your office wifi",
          "The first thing on the page says what the ad said, in recognisably the same words — sending a specific ad to a generic homepage is the most expensive mismatch there is",
          "There's one obvious next action rather than four competing ones",
          "The form asks only for what you genuinely need to have a first conversation — every extra field costs completions",
          "Something on the page proves you're a real business: real photos, an address, genuine reviews",
        ],
      },
      {
        heading: "What happens after the enquiry arrives",
        paragraphs: [
          "This is the part almost nobody checks before launching, and it's where good campaigns most often come apart. An ad that generates enquiries nobody answers has cost you money and produced nothing.",
        ],
        bullets: [
          "Someone is actually responsible for watching for new enquiries, and knows they are",
          "Notifications are switched on for whichever channel the leads arrive through — enquiries sitting unread in an app nobody checks is depressingly common",
          "There's a plan for enquiries arriving outside working hours, even if it's only an acknowledgement until morning",
          "You know what you'll say — a couple of prepared replies to common questions turns a five-minute response into a thirty-second one",
        ],
      },
      {
        heading: "One last thing before you press publish",
        paragraphs: [
          "Decide in advance what you'll judge the campaign on, and give it long enough to be judged fairly. Meta needs a couple of weeks of consistent spend before performance settles, so a decision made on day three is being made on noise.",
          "Write down the number that matters — cost per enquiry, or better, cost per booked customer — and the date you'll review it. Doing that beforehand stops you turning a campaign off during the normal early wobble, which is the most common way a first campaign gets abandoned just before it starts working.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you'd rather someone went through this with you before you spend anything, that's what a strategy call is for. Get in touch and we'll look at your setup, your budget and what's realistic for your business — even if the answer is that you're not quite ready to start yet.",
        ],
      },
    ],
  },
  {
    slug: "organic-social-vs-paid-ads",
    title: "Organic Social vs Paid Ads: Why You Probably Need Both",
    description:
      "They do genuinely different jobs, and the handover between them decides whether an interested person enquires or quietly moves on. Here's how they fit together.",
    publishedAt: "2026-08-18",
    keywords: [
      "organic vs paid social media",
      "do I need to post on social media if I run ads",
      "organic social media for small business",
      "social media strategy small business UK",
    ],
    sections: [
      {
        paragraphs: [
          "It's usually framed as a choice: should we be posting consistently, or should we put that effort and money into ads? For most small businesses it isn't really a choice, because the two aren't alternatives — they do different jobs, and each one is noticeably weaker without the other.",
          "The interesting part isn't the comparison. It's what happens in the handover between them, which is where most businesses quietly lose enquiries they'd already paid for.",
        ],
      },
      {
        heading: "They're doing two different jobs",
        paragraphs: [
          "Paid ads buy reach among people who don't know you exist. That's their entire function, and nothing else does it as quickly or as predictably. You decide who sees you, roughly how many of them, and when.",
          "Organic posting does almost the opposite. Its reach is mostly limited to people who already follow you or have already come across you — which sounds like a weakness until you consider that those are exactly the people closest to buying. Organic isn't a discovery channel for most small businesses; it's a credibility and depth channel for people already circling.",
          "Judging one by the other's yardstick is where the confusion starts. Organic posts that reach a few hundred people look like a failure next to an ad reaching thousands. But if those few hundred include people currently deciding whether to trust you, the comparison isn't measuring anything useful.",
        ],
      },
      {
        heading: "The moment they check your profile",
        paragraphs: [
          "Here's the interaction that gets overlooked, and it's the strongest practical argument for doing both.",
          "Someone sees your ad. It lands, they're interested — and before enquiring, a large share of people will tap through to your profile to see who you actually are. That check takes about four seconds, and what they find decides a lot.",
          "A profile with recent posts, real work, and some evidence the business is active reassures them and they carry on. A profile whose last post was eighteen months ago raises a quiet doubt — are these people still trading, are they any good, is this worth the risk? They rarely articulate it. They just don't enquire, and nothing in your ad reporting will ever tell you that's why.",
          "This is what makes the two genuinely interdependent. Paid does the work of getting someone interested; organic is the credibility check that happens immediately afterwards. Spending well on ads while your profile sits dormant means paying to send people to something that undermines the ad.",
        ],
      },
      {
        heading: "What each one genuinely can't do",
        paragraphs: [
          "Being honest about the limits on both sides makes the split easier to reason about:",
        ],
        bullets: [
          "Organic can't be scaled on demand — if you need enquiries next week, posting more won't reliably produce them, and there's no dial to turn",
          "Organic can't be targeted — you reach whoever the platform shows it to, largely people already connected to you",
          "Paid can't build trust on its own — an ad is a claim about your business; a profile full of real work is evidence for it",
          "Paid stops the moment you stop paying — the reach ends with the budget, whereas posts and the credibility they build stay put",
          "Neither fixes a weak offer — both simply get more people to the same decision faster",
        ],
      },
      {
        heading: "A realistic split when you're short on time",
        paragraphs: [
          "The usual failure isn't choosing wrongly — it's committing to an organic schedule nobody can sustain, posting daily for three weeks, then stopping entirely. A dormant profile with a burst of activity last spring reads worse than a modest but current one.",
          "For most small businesses, a sustainable rhythm beats an ambitious one. A couple of genuinely useful posts a week, kept up indefinitely, does the credibility job perfectly well. Real work, finished jobs, the team, answers to questions customers actually ask — none of which needs to be polished to count.",
          "Put the money into paid, because that's what buys reach and it's the part that scales. Put the time into keeping the profile current and credible, because that's the part that decides whether the reach converts. And bear in mind that the organic post which gets the most likes isn't necessarily the best ad creative — engagement and enquiries are different outcomes, and the crossover is less direct than it looks.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're running ads while your profile sits mostly untouched, that gap is worth closing before increasing budget — it's cheaper to fix than more spend is to buy. Get in touch for a free strategy call and we'll look at both sides of it together.",
        ],
      },
    ],
  },
  {
    slug: "meta-instagram-ads-for-professional-services",
    title: "Meta & Instagram Ads for Professional Services: What's Different",
    description:
      "Accountants, solicitors and consultants can't advertise like a takeaway. Longer decisions, higher lead values, and platform rules most firms don't know about.",
    publishedAt: "2026-08-17",
    keywords: [
      "Facebook ads for professional services",
      "lead gen ads for consultants",
      "Instagram ads for accountants",
      "digital marketing for solicitors UK",
    ],
    sections: [
      {
        paragraphs: [
          "Professional services sit awkwardly with most advertising advice. The standard playbook assumes a fairly quick decision, a visual product, and a customer who can be nudged into acting today. Nobody impulse-hires a solicitor at eleven at night because the creative was compelling.",
          "That doesn't mean Meta and Instagram ads don't work for accountants, consultants, solicitors and similar firms — it means the campaign has to be built around a longer, more considered decision, and around a set of platform rules that catch a lot of professional firms out.",
        ],
      },
      {
        heading: "The economics are different, and that changes the maths",
        paragraphs: [
          "A single professional services client can be worth thousands of pounds, often recurring over years. That changes what a sensible cost per lead looks like entirely. A figure that would be alarming for a restaurant filling midweek tables can be perfectly rational when the resulting client stays for five years.",
          "The flip side is that lead volume is usually lower and the proportion that convert is smaller, because people shop around more carefully for something they'll be trusting with their accounts, their legal position or their business strategy. Judging these campaigns on cost per lead alone tends to mislead — cost per signed client is the number that actually reflects whether it's working, even though it takes longer to establish.",
        ],
      },
      {
        heading: "Special Ad Categories — check this before you spend anything",
        paragraphs: [
          "This is the part that catches professional firms out most often, and it's worth understanding before your first campaign rather than after it gets rejected.",
          "Meta requires certain kinds of advertising to be declared as a Special Ad Category — credit, employment, housing, and social or political issues. If your firm advertises anything touching credit or lending, or roles you're recruiting for, that declaration is mandatory. Declaring it restricts your targeting significantly: age and gender targeting are removed, detailed targeting options are reduced, and location targeting is limited to a wider minimum radius than you'd otherwise use.",
          "Two practical consequences. First, if this applies to you, plan for it — a campaign designed around tight local targeting may need rethinking. Second, declare it honestly. Running restricted-category ads without the declaration risks having ads rejected and, repeated, your ad account restricted. Getting this wrong is a far more expensive problem than the targeting limitation you were avoiding.",
          "Separately, your own professional body's advertising rules still apply — the SRA, ICAEW, FCA and equivalents each have their own requirements about how services can be promoted. Meta approving an ad says nothing about whether your regulator would. That check is the firm's responsibility and worth doing properly.",
        ],
      },
      {
        heading: "Trust does most of the selling",
        paragraphs: [
          "For a considered, high-value service, credibility carries more weight than cleverness. People are choosing who to trust with something that matters, and the creative that works reflects that.",
        ],
        bullets: [
          "The actual professional on camera — a partner explaining a common problem in plain language consistently outperforms stock imagery, because clients are hiring a person rather than a firm in the abstract",
          "Genuine credentials, stated plainly — qualifications, accreditations and years in practice do quiet, unglamorous work here",
          "Real specifics about who you serve — \"accountants for owner-managed construction firms\" pulls harder than \"accountancy services,\" because the right person recognises themselves immediately",
          "Careful language about outcomes — never promise a result you can't guarantee. Beyond the regulatory problem, outcome promises tend to attract exactly the enquiries you'd rather not have",
        ],
      },
      {
        heading: "Offer a smaller first step, then follow up properly",
        paragraphs: [
          "Asking a stranger to instruct your firm straight from an ad is a large leap. A smaller commitment converts far better as an opening move: a genuinely useful guide, a short review of their current position, or simply a no-obligation conversation with a real person.",
          "What matters more is what happens next, because this is where professional services campaigns most often fall down. Someone who downloads a guide about business structure in August might not be ready to move until their year end. If the enquiry sits in an inbox and nobody follows up in the meantime, you've paid to generate a lead and then handed it to whoever does stay in touch.",
          "That makes structured follow-up — a record of every enquiry, a sensible sequence of contact over weeks rather than hours, and a clear owner for each conversation — more important in this sector than in almost any other. The ads open the door; the follow-up decides whether anyone walks through it.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you run a professional services firm and want Meta & Instagram ads built around a longer decision cycle — with the category rules handled properly and follow-up that survives a sales cycle measured in months — get in touch for a free strategy call.",
        ],
      },
    ],
  },
  {
    slug: "what-is-a-unified-inbox-lead-generation",
    title: "What Is a Unified Inbox, and Why Does It Matter for Lead Generation?",
    description:
      "Enquiries arrive across six different apps and half get missed. Here's what a unified inbox actually changes, what it doesn't, and when you genuinely need one.",
    publishedAt: "2026-08-16",
    keywords: [
      "social media inbox software UK",
      "unified inbox for business",
      "manage Instagram and Facebook messages in one place",
      "shared team inbox for enquiries",
    ],
    sections: [
      {
        paragraphs: [
          "Count the places a new enquiry can reach your business. Instagram DMs. Facebook Messenger. WhatsApp. Text messages. Email. The contact form on your website. Missed calls. For most small businesses that's seven separate channels, each with its own app, its own notifications, and sometimes its own device or member of staff.",
          "A unified inbox pulls all of them into one place. That sounds like a convenience feature — a bit of tidying up — and it's routinely underestimated for that reason. In practice it's usually the difference between knowing what enquiries you've had and guessing.",
        ],
      },
      {
        heading: "The problem it's actually solving",
        paragraphs: [
          "The obvious issue is missed messages, and that's real: an enquiry sitting unread in an app nobody thought to check is simply lost. But the less obvious problems tend to cost more over time.",
        ],
        bullets: [
          "Nobody knows what's already been handled — two people reply to the same person, or everyone assumes someone else did and nobody does",
          "The business owner has no visibility — you can't manage, measure or improve a flow of enquiries you can't actually see in one place",
          "Context disappears at handover — someone covering a shift has no idea what was already discussed, so the customer repeats themselves",
          "There's no record to look back on — \"did we ever follow up with that person from last month?\" becomes unanswerable",
          "Enquiries land on personal accounts — DMs arriving on a staff member's own phone leave with them when they go on holiday, or leave the business entirely",
        ],
      },
      {
        heading: "What changes when everything lands in one place",
        paragraphs: [
          "The immediate change is that every enquiry becomes visible in a single queue, whichever channel it arrived through. From there, several things become possible that simply weren't before: assigning conversations so there's always one clear owner, seeing a person's full history even if they messaged on WhatsApp last month and Instagram today, and using saved replies for the questions you answer constantly.",
          "The part that surprises people most is the reporting. Once every enquiry passes through one system, you can finally see how many you're actually getting, how quickly they're being answered, and which channels produce the ones that turn into customers. Most businesses running ads have a rough sense of their ad metrics and almost no data on what happens after the click — this is the gap that closes.",
          "That matters more when you're paying for the enquiries. A missed message from someone who found you organically is unfortunate. A missed message from someone you paid to bring in is money spent and thrown away, and it's happening in a channel you're not watching.",
        ],
      },
      {
        heading: "What it doesn't do",
        paragraphs: [
          "A unified inbox organises conversations. It doesn't have them for you. If nobody has time to reply, consolidating the enquiries just gives you a tidier view of the ones you're missing — the automation and AI answering sit on top of it as separate things, not as features you get automatically by consolidating.",
          "It also isn't quite the seamless picture the marketing usually paints. Messaging platforms each impose their own rules about what can be accessed through their APIs and how long you have to respond, so a few things behave slightly differently than they would in the native app. It's a real limitation, though a minor one next to not seeing the message at all.",
          "And there's genuine setup involved — connecting accounts, sorting out permissions, agreeing who handles what. It's a couple of hours of faff, not a switch you flip.",
        ],
      },
      {
        heading: "Do you actually need one yet?",
        paragraphs: [
          "Not every business does, and it's worth being honest about that. If you're a sole trader getting a handful of enquiries a week, all by phone, answering them yourself as they come in, a unified inbox is solving a problem you don't have.",
          "It starts genuinely earning its place when any of these are true:",
        ],
        bullets: [
          "Enquiries are arriving on three or more channels and you're checking them separately",
          "More than one person handles enquiries, so ownership and context matter",
          "You're running paid ads, and every unanswered message is money already spent",
          "Messages arrive outside working hours and you have no reliable way of catching them",
          "You genuinely don't know how many enquiries you got last month",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "A unified inbox is part of what we set up for clients from the Growth plan upwards, alongside the automated follow-up that runs on top of it. If enquiries are scattered across half a dozen apps and you suspect some are being missed, get in touch for a free strategy call and we'll map out where they're actually arriving.",
        ],
      },
    ],
  },
  {
    slug: "signs-your-landing-page-is-losing-leads",
    title: "7 Signs Your Landing Page Is Losing You Leads",
    description:
      "Your ads can do everything right and still produce nothing if the page they land on leaks. Seven specific problems to check, and how to spot them yourself.",
    publishedAt: "2026-08-15",
    keywords: [
      "landing page conversion tips",
      "why is my landing page not converting",
      "landing page mistakes lead generation",
      "improve landing page conversion rate UK",
    ],
    sections: [
      {
        paragraphs: [
          "It's a particularly frustrating way to waste money: the campaign is well built, the creative is stopping people mid-scroll, the clicks are coming in at a sensible cost — and almost nobody enquires. The instinct is to go back and change the ads, when the ads have already done their job.",
          "Everything after the click is the landing page's responsibility, and a page that leaks will quietly undo good advertising. Here are seven specific things that cause it, grouped by where in the journey they lose people.",
        ],
      },
      {
        heading: "Before they've read a word: speed and mobile",
        paragraphs: [
          "The first two problems cost you visitors who never saw your offer at all.",
        ],
        bullets: [
          "Slow loading — someone tapping an ad on a phone, often on mobile data, will give your page a couple of seconds at most. A page heavy with large uncompressed images or unnecessary scripts loses a meaningful share of visitors before anything appears, and you've already paid for every one of those clicks",
          "Not genuinely built for mobile — most ad traffic arrives on a phone. If text needs pinching to read, the page scrolls sideways, or buttons are too small to tap confidently, you're asking people to work for the privilege of enquiring. Open your own page on your phone rather than judging it on a desktop screen",
        ],
      },
      {
        heading: "The moment they land: does the page keep the ad's promise?",
        paragraphs: [
          "The next three are about continuity — whether the page delivers what the ad set up.",
        ],
        bullets: [
          "A page that doesn't match the ad — the most common and most expensive fault of the seven. An ad promoting a specific service or offer that lands on a generic homepage forces the visitor to go looking for what they were promised, and most won't bother. Whatever the ad said should be the first thing on the page, in recognisably the same words",
          "No single obvious action — pages offering four competing options (call, email, book, download, follow) spread attention instead of directing it. One primary action, repeated, converts better than five presented as equals",
          "The main action buried below the fold — if someone has to scroll to work out what you want them to do, a portion never will. The offer and the way to take it should be visible immediately, then repeated further down for people who read on",
        ],
      },
      {
        heading: "At the point of enquiring: friction and doubt",
        paragraphs: [
          "The last two lose people who were genuinely ready — which makes them the most painful of the seven.",
        ],
        bullets: [
          "A form asking for too much — every additional field costs you completions. Ask only for what you genuinely need to have a useful first conversation, and collect the rest once you're talking. A form demanding postcode, budget, company size and preferred contact time is doing your qualification at the expense of your conversion rate",
          "Nothing proving you're a real business — a stranger who arrived thirty seconds ago is being asked for their phone number. Real photos of your work, genuine reviews, a company address, a named person: these do quiet, unglamorous work. A page that could belong to anyone gets treated with the caution that deserves",
        ],
      },
      {
        heading: "A ten-minute self-check",
        paragraphs: [
          "You don't need analytics tooling to catch most of this. Click your own ad on your own phone, as though you'd never seen it before, and ask:",
          "Did the page appear quickly? Does the first thing on screen say what the ad said? Is it immediately obvious what I'm meant to do next? Could I complete the form one-handed, standing up, in under a minute? Is there anything here proving this is a real business?",
          "If you hesitate on any of those, you've found something worth fixing — and fixing the page is usually faster and cheaper than rebuilding the campaign that's pointing at it.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "Landing pages are part of what we build for every client, precisely because the campaign and the page it points to have to be designed as one thing rather than handed off between two. If your ads are generating clicks that aren't turning into enquiries, get in touch for a free strategy call and we'll look at where the drop-off is actually happening.",
        ],
      },
    ],
  },
  {
    slug: "facebook-ads-vs-instagram-ads-budget",
    title: "Facebook Ads vs Instagram Ads: Where Should Your Budget Go?",
    description:
      "Most businesses ask which platform to pick. It's usually the wrong question — here's why, and when restricting placements genuinely does make sense.",
    publishedAt: "2026-08-14",
    keywords: [
      "Instagram ads vs Facebook ads",
      "should I advertise on Facebook or Instagram",
      "Meta ads placements explained",
      "Advantage+ placements",
    ],
    sections: [
      {
        paragraphs: [
          "\"We only want to be on Instagram — our customers aren't really on Facebook.\" It's one of the most common things business owners say when setting up their first campaign, and it's usually a decision made on instinct rather than on anything from their own account.",
          "It's also, more often than not, a decision that quietly costs money. Here's why the question is framed wrongly, and when choosing between them is genuinely the right call.",
        ],
      },
      {
        heading: "They're not two platforms — they're placements in one",
        paragraphs: [
          "Facebook and Instagram ads are bought through the same system. You're not choosing between two advertising products; you're choosing which surfaces within Meta's network your ads are eligible to appear on — Facebook Feed, Instagram Feed, Stories, Reels, Marketplace, and several others.",
          "That distinction matters because of how the auction works. Meta distributes your budget toward wherever it can get you results most cheaply at any given moment. Restricting placements doesn't redirect that budget to better opportunities — it removes options from the system, leaving it to buy from a smaller pool. Less competition to win on your behalf usually means paying more, not less.",
        ],
      },
      {
        heading: "\"My customers aren't on Facebook\" — worth actually checking",
        paragraphs: [
          "This assumption is usually rooted in something real: Facebook's user base does skew somewhat older than Instagram's in the UK. But \"skews older\" is not the same as \"absent,\" and the platform remains enormous across every age group that has money to spend.",
          "There's also a mismatch worth noticing between where people *post* and where they *see ads*. Someone might not have published anything to Facebook in five years while still scrolling it daily, checking Marketplace, or using Messenger constantly. Ad delivery follows attention, not posting activity — and plenty of people who'd describe themselves as \"not really on Facebook\" are reachable there.",
          "The honest answer is that you don't need to guess. Run both, let a few weeks of data accumulate, then look at the placement breakdown in Ads Manager. Your own account will tell you where your enquiries actually came from, and it fairly regularly surprises people.",
        ],
      },
      {
        heading: "Why letting Meta choose usually beats picking",
        paragraphs: [
          "Meta's automatic placement setting (Advantage+ placements) exists because the system optimises placement allocation faster and more granularly than manual selection realistically can. It's shifting delivery continuously based on live cost signals, not on a decision someone made at setup and never revisited.",
          "For most advertisers — particularly those working with modest budgets — leaving placements open is the higher-performing default. It gives the algorithm more room to find cheap conversions, and it means you're not paying a premium for a restriction you chose on a hunch. There's also a practical benefit: broader placement eligibility helps a campaign gather results faster, which matters for getting out of the learning phase.",
        ],
      },
      {
        heading: "When restricting placements genuinely makes sense",
        paragraphs: [
          "There are real cases for narrowing placements — they're just narrower than most people assume:",
        ],
        bullets: [
          "Your creative only works in one format — a vertical video built for Reels will look cropped and awkward squeezed into a right-column placement",
          "Your own placement data, over a meaningful period, shows one surface consistently generating cost-per-result well outside the others",
          "There's a specific brand or context reason a particular placement isn't appropriate for what you're advertising",
          "You're deliberately testing one placement in isolation, with a plan to reopen once you've learned what you needed",
        ],
      },
      {
        heading: "The real difference is format, not platform",
        paragraphs: [
          "If there's a practical decision to make here, it isn't Facebook versus Instagram — it's making sure your creative suits the surfaces it lands on. A Story or Reel is full-screen, vertical, fast, and expected to feel native to the feed around it. An in-feed placement is square or portrait, sits among static posts, and can carry more text before it stops being read.",
          "The advertisers who get the most out of leaving placements open are the ones who supply creative in more than one aspect ratio, so whichever surface Meta chooses, the ad actually looks like it belongs there. That's a far better use of effort than agonising over which platform to switch off.",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're running Instagram-only because it felt like the obvious choice, it's worth opening things up and letting a few weeks of real data settle the question. Get in touch for a free strategy call and we'll look at where your results are genuinely coming from, rather than where anyone assumed they would.",
        ],
      },
    ],
  },
  {
    slug: "ad-spend-vs-management-fees",
    title: "Ad Spend vs Management Fees: What You're Actually Paying For",
    description:
      "Two separate costs that get confused constantly — and the confusion is expensive. Here's what each one buys and what to ask before you sign with any agency.",
    publishedAt: "2026-08-13",
    keywords: [
      "Facebook ads management fees UK",
      "ad spend vs management fee",
      "how much do agencies charge for Facebook ads",
      "Meta ads agency pricing explained",
    ],
    sections: [
      {
        paragraphs: [
          "\"I've got about £1,000 a month for marketing.\" It's a completely reasonable thing to say, and it's also the point at which two very different costs get quietly merged into one — usually without anyone noticing until it causes a problem.",
          "Does that £1,000 mean £1,000 going to Meta to actually run ads, with a management fee on top? Or £1,000 total, split between the agency and the ads? Those are wildly different arrangements, and getting the answer straight before anything starts saves an awkward conversation later.",
        ],
      },
      {
        heading: "Two different things, paid to two different places",
        paragraphs: [
          "Ad spend is money that goes to Meta. It buys distribution — impressions, clicks, the actual showing of your ad to people. It's paid from your ad account on your card, and it scales directly with how much volume you want.",
          "The management fee is money that goes to whoever runs the campaigns. It buys strategy, creative, setup, ongoing optimisation and reporting. It doesn't buy a single impression.",
          "The distinction matters because they don't substitute for one another. Doubling your management fee doesn't put your ad in front of more people. Doubling your ad spend doesn't make the campaign better structured. A business that spends heavily on ads with nobody managing them wastes money slowly; a business paying a large fee with almost nothing left for ad spend has an expertly optimised campaign that barely anyone sees.",
        ],
      },
      {
        heading: "What the management fee actually buys",
        paragraphs: [
          "It's a fair question, and \"we manage your ads\" isn't much of an answer. In practice, the work sits in a few distinct areas:",
        ],
        bullets: [
          "Campaign structure — objectives, audiences, and how ad sets are organised so the platform optimises toward the outcome you actually want",
          "Creative — producing and testing the images, video and copy, then replacing them as they fatigue",
          "Tracking setup — the Pixel, Conversions API and event configuration that let Meta learn which clicks became real enquiries",
          "Ongoing optimisation — cutting what isn't working, shifting budget toward what is, and adjusting as costs move",
          "Reporting and interpretation — not just numbers, but what they mean and what changes next",
          "Judgement — knowing when a bad week is normal variance and when it's a genuine problem worth acting on",
        ],
      },
      {
        heading: "How agencies charge, and what each model rewards",
        paragraphs: [
          "There are two common structures, and neither is inherently right or wrong — but they do pull in different directions, which is worth understanding before you pick one.",
          "A percentage of ad spend, typically somewhere in the region of 10–20%, scales with your budget. It can work out cheaper at low spend levels, and it means the agency earns more as you grow. The trade-off is the incentive it creates: the agency's income rises when your ad budget rises, whether or not increasing it was the right call for you.",
          "A flat monthly fee is predictable and doesn't move with your budget. You know the cost regardless of whether you spend £500 or £5,000 with Meta that month, which makes forecasting straightforward and removes any incentive to push your budget upward. The trade-off runs the other way — at very high spend, a flat fee can end up cheaper than a percentage would have been, and at very low spend it can represent a large share of your total marketing cost.",
          "For transparency: we charge a flat monthly fee, starting at £400, with ad spend paid separately and directly to Meta. That's a deliberate choice, but it isn't the only defensible one.",
        ],
      },
      {
        heading: "Getting the split right at smaller budgets",
        paragraphs: [
          "This is where the distinction stops being academic. If your total marketing budget is modest, how you divide it genuinely affects whether the campaign can work at all.",
          "Meta's delivery system needs a consistent flow of data before it optimises well — it has to gather enough results to move out of its learning phase. A campaign starved of ad spend takes far longer to get there, or never quite does, which means poor performance that gets blamed on the platform when the real cause was a budget spread too thin.",
          "As a rough sanity check: if the management fee is consuming most of your total budget, something needs to change — either the budget goes up, or you start with a simpler, cheaper level of management and scale it as results come in. An honest agency will tell you when your budget isn't yet at a level where their full service makes sense.",
        ],
      },
      {
        heading: "What to ask before you sign with anyone",
        paragraphs: [
          "Whoever you end up working with, these questions are worth asking plainly at the start:",
        ],
        bullets: [
          "Is your fee separate from ad spend, or does it come out of the same budget?",
          "Whose name is the ad account in? You want to own it — if the agency owns the account, you can lose your campaign history and accumulated Pixel data when you leave, and that data has real value",
          "Who owns the creative and the landing pages if we part ways?",
          "Is there a minimum contract, and what's the notice period?",
          "What reporting will I get, how often, and will it show cost per lead rather than just reach and impressions?",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If you're weighing up quotes and struggling to compare them because everyone presents their pricing differently, it's usually because the split between fee and spend is being described inconsistently. Get in touch for a free strategy call — we'll break down what your budget realistically supports, and tell you straight if it isn't there yet.",
        ],
      },
    ],
  },
  {
    slug: "what-an-ai-receptionist-actually-does",
    title: "What an AI Receptionist Actually Does (and What It Doesn't)",
    description:
      "An honest look at what an AI receptionist handles well, where it genuinely falls short, and which businesses get the most out of one.",
    publishedAt: "2026-08-12",
    keywords: [
      "AI receptionist for small business UK",
      "what does an AI receptionist do",
      "AI chatbot for customer enquiries",
      "automated appointment booking small business",
    ],
    sections: [
      {
        paragraphs: [
          "\"AI receptionist\" is a term that gets used to describe everything from a basic auto-reply to something close to a full virtual employee, which makes it hard to know what you'd actually be buying. It's worth being specific — both about what these systems genuinely do well, and about where they fall short.",
          "Here's an honest breakdown, including the parts that don't tend to feature in the sales pitch.",
        ],
      },
      {
        heading: "What it actually does well",
        paragraphs: [
          "The core value is simple: it responds immediately, at any hour, to every enquiry. Not eventually, not when someone gets a moment between jobs — immediately, including at eleven o'clock on a Sunday night when the alternative is silence until Monday.",
          "Within that, the things it handles reliably are the repetitive ones:",
        ],
        bullets: [
          "Answering the same common questions it gets asked constantly — opening hours, rough pricing, which areas you cover, whether you offer a particular service",
          "Qualifying an enquiry by asking the questions you'd ask anyway, so what reaches you is already useful rather than just a name",
          "Booking appointments straight into your calendar, without the back-and-forth of proposing times",
          "Handling several conversations at once, so nobody sits in a queue during a busy spell",
          "Capturing the enquiry in writing, so even the ones that don't convert leave a record you can look back at",
        ],
      },
      {
        heading: "What it doesn't do — and shouldn't pretend to",
        paragraphs: [
          "This is the part worth being clear-eyed about, because expecting the wrong things is how businesses end up disappointed.",
          "It won't replace a salesperson on anything complex or high-value. Reading hesitation in someone's voice, sensing when to push and when to back off, negotiating a bespoke job — that's still human work, and it's usually the difference on the deals that matter most. What the AI does is make sure the conversation exists at all, so a human can pick it up warm rather than never knowing it happened.",
          "It also can't rescue a weak offer. If your pricing isn't competitive or your service isn't what people are looking for, replying in four seconds rather than four hours simply gets you to the same answer faster. Fast follow-up amplifies a good offer — it doesn't substitute for one.",
          "And it isn't set-and-forget. It answers based on what it's been given about your business, which means it needs proper setup and periodic review as your prices, services and availability change. An AI receptionist working from last year's pricing is worse than no AI receptionist at all.",
          "Finally, it should hand over quickly when a conversation turns complicated — an upset customer or a genuine complaint needs a person, and fast. A well-configured system knows its own limits and escalates rather than looping.",
        ],
      },
      {
        heading: "Should it tell people it's AI?",
        paragraphs: [
          "This comes up almost every time, and the answer is yes — be upfront about it.",
          "In practice, most people are entirely comfortable dealing with an automated assistant to book an appointment or ask a straightforward question. What they react badly to is discovering they were misled about it. Presenting the system as a human and being found out costs you far more trust than simply saying \"I'm the virtual assistant, I can get you booked in or pass you to the team\" ever would.",
          "There's a practical argument too: when people know they're talking to an assistant, they tend to ask clearer, simpler questions — which is exactly the sort the system answers well.",
        ],
      },
      {
        heading: "Which businesses get the most out of one",
        paragraphs: [
          "An AI receptionist isn't equally valuable everywhere. The businesses that benefit most tend to share one of a few characteristics:",
        ],
        bullets: [
          "A high volume of similar, repetitive enquiries — the same handful of questions, over and over",
          "Real demand outside working hours, particularly evenings and weekends, that currently goes unanswered until the next working day",
          "A team that's physically unavailable exactly when enquiries peak — a restaurant mid-service, a tradesperson on a job, a workshop with everyone on the tools",
          "Paid advertising driving the enquiries, where every unanswered message is money already spent and wasted",
        ],
      },
      {
        heading: "Getting started",
        paragraphs: [
          "If your enquiries mostly arrive during working hours and you're already answering them within minutes, an AI receptionist probably isn't the first thing your business needs — a unified inbox or better follow-up might matter more. If enquiries are piling up overnight or during your busiest hours, it's solving a problem you actually have.",
          "It's included from our Scale plan, and we'd rather tell you honestly whether it fits before you pay for it. Get in touch for a free strategy call and we'll look at where your enquiries are actually coming from and when.",
        ],
      },
    ],
  },
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
