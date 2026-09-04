import { siteConfig, socialProfileUrls, hasPublishedReviews, tintServices, repairServices } from "@/lib/site-config";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/apple-icon`,
    image: `${siteConfig.url}/opengraph-image`,
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    priceRange: "££",
    ...(socialProfileUrls.length > 0 && { sameAs: socialProfileUrls }),
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
      streetAddress: siteConfig.address.line1,
      addressLocality: siteConfig.address.city,
      postalCode: siteConfig.address.postcode,
      addressCountry: "GB",
    },
    openingHoursSpecification: siteConfig.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.schemaDays,
      opens: h.opens,
      closes: h.closes,
    })),
    makesOffer: [...tintServices, ...repairServices].map((s) => ({
      "@type": "Offer",
      name: s.name,
      priceCurrency: "GBP",
      price: s.fromPrice.replace("£", ""),
      description: "description" in s ? s.description : undefined,
    })),
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
      { name: "Window Tints", url: `${siteConfig.url}/tints` },
      { name: "Repairs & Servicing", url: `${siteConfig.url}/repairs` },
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
