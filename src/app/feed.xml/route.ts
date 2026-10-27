import { loadPriceChanges } from "@/lib/prices";
import { allListings } from "@/lib/listings";
import { FREE_DELIVERY_FROM, delivery, styles } from "@/lib/plates";
import { site } from "@/lib/site";

// Product feed for Google Merchant Center (free listings in Google Shopping).
// Add it in Merchant Center → Products → Add products → From a file →
// "Add a URL": https://platedup.co.uk/feed.xml
// Every product in lib/listings (each style as a pair, single, motorbike,
// 4x4 / import, hex and show plates); each link opens that product's own
// page, which shows the same price and product details.

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const gbp = (pence: number) => `${(pence / 100).toFixed(2)} GBP`;

export async function GET() {
  await loadPriceChanges();
  const standard = delivery.find((d) => d.id === "standard")!;
  const items = allListings().map((l) => {
    const style = styles.find((s) => s.id === l.style)!;
    const shipping = l.price >= FREE_DELIVERY_FROM ? "0.00 GBP" : gbp(standard.price);
    return `
    <item>
      <g:id>${l.id}</g:id>
      <title>${esc(`${l.title} | ${site.name}`)}</title>
      <description>${esc(l.description)}</description>
      <link>${esc(`${site.url}${l.path}`)}</link>
      <g:image_link>${esc(l.image)}</g:image_link>
      <g:price>${gbp(l.price)}</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(site.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(`Vehicle Parts & Accessories > Number Plates > ${l.kind === "show" ? "Show Plates" : style.name}`)}</g:product_type>
      <g:shipping>
        <g:country>GB</g:country>
        <g:service>${esc(standard.name)}</g:service>
        <g:price>${shipping}</g:price>
      </g:shipping>
    </item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${esc(site.url)}</link>
    <description>${esc(site.description)}</description>${items.join("")}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
