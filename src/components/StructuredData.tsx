import { siteConfig, socialProfileUrls, hasPublishedReviews } from "@/lib/site-config";
import { pricingGroups } from "@/content/pricing";
import { services } from "@/content/services";

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
    // Built from the pricing content so the two can't drift apart.
    makesOffer: pricingGroups.flatMap((group) =>
      group.plans
        .filter((plan) => plan.price.includes("£"))
        .map((plan) => ({
          "@type": "Offer",
          name: `${group.eyebrow} — ${plan.name}`,
          price: plan.price.replace(/[^\d.]/g, ""),
          priceCurrency: "GBP",
          description: plan.tagline,
          url: `${siteConfig.url}/pricing#${group.id}`,
        }))
    ),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Marketing services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          url: `${siteConfig.url}/services/${service.slug}`,
        },
      })),
    },
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
      { name: "Free Audit", url: `${siteConfig.url}/free-audit` },
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

/**
 * Schema.org requires absolute URLs in a BreadcrumbList. Callers pass site
 * paths as often as full URLs, so resolve them here rather than relying on
 * every page to remember.
 */
function absolute(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  return `${siteConfig.url}${url === "/" ? "" : url}`;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.url),
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

/**
 * A single service, tied back to the organization so Google reads them as one
 * entity rather than an unrelated business appearing on a sub-page.
 */
export function ServiceJsonLd({
  name,
  description,
  path,
  offer,
}: {
  name: string;
  description: string;
  path: string;
  offer?: { price: string; note: string };
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}${path}#service`,
    name,
    description,
    serviceType: name,
    url: `${siteConfig.url}${path}`,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    ...(offer && {
      offers: {
        "@type": "Offer",
        priceCurrency: "GBP",
        price: offer.price.replace(/[^\d.]/g, ""),
        description: offer.note,
        url: `${siteConfig.url}/pricing`,
      },
    }),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * A hub page's children as an ordered list. Helps Google understand that
 * /services, /industries and /locations are indexes rather than thin pages.
 */
export function ItemListJsonLd({
  name,
  items,
}: {
  name: string;
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
