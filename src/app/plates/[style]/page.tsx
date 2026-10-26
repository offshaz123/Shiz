import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Builder } from "@/components/Builder";
import { JsonLd } from "@/components/JsonLd";
import { loadPriceChanges } from "@/lib/prices";
import { type StyleId, styles } from "@/lib/plates";
import { site } from "@/lib/site";

// One page per plate style (e.g. /plates/3d-gel): the builder already on that
// style, with its price, and product details Google can read. Each product in
// the Google Shopping feed (feed.xml) links to its own page here.

export const dynamicParams = false;
// Rebuilt hourly so launch prices switch over on the day they rise.
export const revalidate = 3600;

export function generateStaticParams() {
  return styles.map((s) => ({ style: s.id }));
}

const find = (id: string) => styles.find((s) => s.id === id);
const title = (name: string) => `${name} Number Plates: Road Legal Pair`;

export async function generateMetadata(props: PageProps<"/plates/[style]">): Promise<Metadata> {
  const s = find((await props.params).style);
  if (!s) return {};
  return { title: title(s.name), description: `${s.blurb} Design your road-legal front and rear pair with a live preview.`, alternates: { canonical: `/plates/${s.id}` } };
}

export default async function StylePage(props: PageProps<"/plates/[style]">) {
  await loadPriceChanges();
  const s = find((await props.params).style);
  if (!s) notFound();
  const image = (side: string) =>
    `${site.url}/api/plate-image?${new URLSearchParams({ text: "PL24 TED", type: "legal", style: s.id, badge: "none", border: "none", side })}`;
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${s.name} Number Plates – Road Legal Pair (Front & Rear)`,
    description: `${s.blurb} A pair of road-legal front and rear number plates made to order for your registration, to BS AU 145e by a DVLA registered supplier.`,
    sku: `PU-${s.id.toUpperCase()}-PAIR`,
    brand: { "@type": "Brand", name: site.name },
    image: [image("rear"), image("front")],
    offers: {
      "@type": "Offer",
      price: (s.pair / 100).toFixed(2),
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `${site.url}/plates/${s.id}`,
      seller: { "@type": "Organization", name: site.name },
    },
  };
  return (
    <>
      <JsonLd data={product} />
      <Builder initial={{ style: s.id as StyleId }} />
    </>
  );
}
