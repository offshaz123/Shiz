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
