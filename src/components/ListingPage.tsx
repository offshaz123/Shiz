import { Builder } from "@/components/Builder";
import { JsonLd } from "@/components/JsonLd";
import type { Listing } from "@/lib/listings";
import { site } from "@/lib/site";

// A product page for Google Shopping (lib/listings): the builder already set
// up for the product, with product details Google can read.
export function ListingPage({ listing }: { listing: Listing }) {
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    sku: listing.id,
    brand: { "@type": "Brand", name: site.name },
    image: [listing.image],
    offers: {
      "@type": "Offer",
      price: (listing.price / 100).toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${site.url}${listing.path}`,
      seller: { "@type": "Organization", name: site.name },
    },
  };
  return (
    <>
      <JsonLd data={product} />
      <Builder initial={listing.config} />
    </>
  );
}
