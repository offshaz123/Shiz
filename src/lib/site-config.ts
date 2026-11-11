export const siteConfig = {
  name: "Shaz Marketing Group",
  shortName: "Shaz Marketing",
  description:
    "UK marketing agency running Meta, Instagram and Google Ads, SEO, websites and social media, with every enquiry landing in one inbox so none go unanswered.",
  url: "https://shazmarketing.com",
  email: "info@shazmarketing.com",
  phoneDisplay: "07539 559947",
  phoneE164: "+447539559947",
  whatsappNumber: "447539559947",
  whatsappMessage: "Hi Shaz Marketing Group, I'd like to find out more about what you do.",
  // Google Calendar "Appointment schedule" booking link for the /demo page's Book Now button.
  // Leave empty until it's set up — the page falls back to the lead form until then.
  demoBookingUrl: "https://calendar.app.google/KPLv3BHXqZPeZ3Bk8",
  // Demo walkthrough video (YouTube/Vimeo embed URL, or a direct video file URL). Leave empty for now.
  demoVideoUrl: "",
  // Meta (Facebook/Instagram) Pixel ID, from Events Manager. Leave empty to disable.
  metaPixelId: "1096415716381078",
  // Google Analytics 4 measurement ID, from Admin -> Data streams. Looks like
  // "G-XXXXXXXXXX". Leave empty to disable. Both this and the Pixel only load
  // once a visitor has accepted cookies.
  googleAnalyticsId: "G-E2E96L33Z6",
  address: {
    line1: "Level 39",
    line2: "One Canada Square",
    city: "London",
    postcode: "E14 5AB",
    country: "United Kingdom",
  },
  // Public social profiles. These are published in the Organization schema's
  // `sameAs` so Google links these accounts to this business as one entity.
  // Leave a value empty to omit it. Use full URLs.
  social: {
    instagram: "https://www.instagram.com/shaz.marketing/",
    facebook: "",
    linkedin: "https://www.linkedin.com/company/shaz-marketing-group/",
    x: "",
    youtube: "",
    tiktok: "",
  },
  // Icons shown in the footer with no link behind them, for platforms we want
  // visible before the profile is live. Nothing here is published in `sameAs`,
  // since that would tell Google about a page that doesn't exist. To make one
  // clickable, put its URL in `social` above and drop the key from this list.
  socialPlaceholders: ["facebook", "x"] as const,
  // Google Search Console verification. In Search Console choose the "HTML tag"
  // method and paste only the content value here — the long string, not the
  // whole tag. While this is empty no verification tag is rendered.
  googleSiteVerification: "",
  // Bing Webmaster Tools verification, same idea. Bing feeds DuckDuckGo and
  // increasingly gets used by AI assistants, so it is worth the two minutes.
  bingSiteVerification: "878B8AB36868DC27A6EC555CB86AFBAA",
  // Public review rating, shown as a star badge and published in the
  // Organization schema. Fill these in ONLY from reviews genuinely received on
  // a real profile — the count and average must match what's publicly visible
  // there. While `count` is 0 the badge renders nothing and no rating is
  // published, which is deliberate: publishing a rating you can't evidence
  // breaches UK consumer protection rules and risks a Google manual action.
  reviews: {
    averageRating: 0,
    count: 0,
    profileUrl: "",
  },
  // Trustpilot. `domain` is the one claimed on the Trustpilot business account,
  // which is what both their URLs are keyed on — not a profile ID. Clear it to
  // remove every Trustpilot link from the site at once.
  //
  // Deliberately a plain link rather than one of Trustpilot's TrustBox
  // widgets. A widget loads their script into every page that carries it, the
  // score-showing ones would display 0.0 until reviews land, and the better
  // ones belong to paid plans, so the badge would vanish when a trial ends. A
  // link does the one thing that matters — put someone on the review form —
  // and keeps working on the free plan forever.
  trustpilot: {
    domain: "shazmarketing.com",
    // Same discipline as `reviews` above: these must match what the public
    // Trustpilot profile shows, because the badge links straight to it and
    // anyone can check in one click. While `reviewCount` is 0 the homepage
    // badge renders nothing — the "review us" link is unaffected, since
    // inviting a review claims nothing. Set `trustScore` to 0 to show the
    // count without a star rating.
    reviewCount: 0,
    trustScore: 0,
  },
};

export const hasPublishedReviews = siteConfig.reviews.count > 0;

export const hasTrustpilot = siteConfig.trustpilot.domain !== "";

/** Only true once there are reviews on the profile to point at. */
export const hasTrustpilotReviews = hasTrustpilot && siteConfig.trustpilot.reviewCount > 0;

/** Trustpilot's "write a review" form for this business. */
export const trustpilotReviewUrl = hasTrustpilot
  ? `https://uk.trustpilot.com/evaluate/${siteConfig.trustpilot.domain}`
  : "";

/** The public profile, where reviews are read rather than written. */
export const trustpilotProfileUrl = hasTrustpilot
  ? `https://uk.trustpilot.com/review/${siteConfig.trustpilot.domain}`
  : "";

export const socialProfileUrls = Object.values(siteConfig.social).filter(Boolean);

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;
