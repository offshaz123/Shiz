import { siteConfig, socialProfileUrls, hasPublishedReviews } from "@/lib/site-config";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/opengraph-image`,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    priceRange: "££",
    // Tells Google these social profiles are the same business entity.
    ...(socialProfileUrls.length > 0 && { sameAs: socialProfileUrls }),
    // Only published once real reviews exist — an unevidenced rating here is a
    // manual-action risk, not just a credibility one.
    ...(hasPublishedReviews && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: siteConfig.reviews.averageRating,
        reviewCount: siteConfig.reviews.count,
      },
    }),
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postcode,
      addressCountry: "GB",
    },
    makesOffer: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "400",
        priceCurrency: "GBP",
        description:
          "Meta & Instagram ads management, a lead capture landing page, and a unified Instagram + Facebook inbox.",
      },
      {
        "@type": "Offer",
        name: "Growth",
        price: "700",
        priceCurrency: "GBP",
        description:
          "A full CRM pipeline, an all-in-one inbox across Instagram, Messenger, WhatsApp & SMS, and automated lead follow-up.",
      },
      {
        "@type": "Offer",
        name: "Scale",
        price: "1400",
        priceCurrency: "GBP",
        description:
          "Unlimited ad campaigns, a 24/7 AI receptionist & chatbot, advanced automation, and a dedicated account manager.",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Declares the site as a named entity and lists its primary sections. This is
// the structure Google draws on when deciding whether to show sitelinks under
// the main search result for a brand search.
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-GB",
    publisher: { "@id": `${siteConfig.url}/#organization` },
    hasPart: [
      { name: "Services", url: `${siteConfig.url}/services` },
      { name: "Pricing", url: `${siteConfig.url}/pricing` },
      { name: "About", url: `${siteConfig.url}/about` },
      { name: "Blog", url: `${siteConfig.url}/blog` },
      { name: "Contact", url: `${siteConfig.url}/contact` },
    ].map((item) => ({
      "@type": "SiteNavigationElement",
      name: item.name,
      url: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
