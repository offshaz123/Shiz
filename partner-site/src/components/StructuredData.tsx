import { brand, currencies } from "@/lib/brand";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own content, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const sameAs = Object.values(brand.social).filter(Boolean);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "@id": `${brand.url}/#organization`,
        name: brand.name,
        legalName: brand.legalName,
        url: brand.url,
        description: brand.description,
        email: brand.email,
        telephone: brand.phoneE164,
        areaServed: "GB",
        currenciesAccepted: currencies.map((c) => c.code).join(", "),
        ...(brand.address.city
          ? {
              address: {
                "@type": "PostalAddress",
                ...(brand.address.line1
                  ? {
                      streetAddress: [brand.address.line1, brand.address.line2]
                        .filter(Boolean)
                        .join(", "),
                    }
                  : {}),
                addressLocality: brand.address.city,
                ...(brand.address.postcode ? { postalCode: brand.address.postcode } : {}),
                addressCountry: "GB",
              },
            }
          : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }}
    />
  );
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${brand.url}/#website`,
        url: brand.url,
        name: brand.name,
        publisher: { "@id": `${brand.url}/#organization` },
        inLanguage: "en-GB",
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: readonly { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${brand.url}${crumb.path}`,
        })),
      }}
    />
  );
}
