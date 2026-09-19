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
    linkedin: "",
    x: "",
    youtube: "",
    tiktok: "",
  },
  // Icons shown in the footer with no link behind them, for platforms we want
  // visible before the profile is live. Nothing here is published in `sameAs`,
  // since that would tell Google about a page that doesn't exist. To make one
  // clickable, put its URL in `social` above and drop the key from this list.
  socialPlaceholders: ["facebook", "x"] as const,
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
};

export const hasPublishedReviews = siteConfig.reviews.count > 0;

export const socialProfileUrls = Object.values(siteConfig.social).filter(Boolean);

export const whatsappHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage
)}`;
