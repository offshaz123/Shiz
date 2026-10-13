import { FREE_DELIVERY_FROM, delivery, styles } from "@/lib/plates";
import { site } from "@/lib/site";

// Product feed for Google Merchant Center (free listings in Google Shopping).
// Add it in Merchant Center → Products → Add products → From a file →
// "Add a URL": https://platedup.co.uk/feed.xml
// One product per plate style, priced as a pair; the link opens the builder
// with that style picked, which shows the same price.

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const gbp = (pence: number) => `${(pence / 100).toFixed(2)} GBP`;

export function GET() {
  const standard = delivery.find((d) => d.id === "standard")!;
  const items = styles.map((s) => {
    const image = `${site.url}/api/plate-image?${new URLSearchParams({ text: "PL24 TED", type: "legal", style: s.id, badge: "none", border: "none", side: "rear" })}`;
    const front = `${site.url}/api/plate-image?${new URLSearchParams({ text: "PL24 TED", type: "legal", style: s.id, badge: "none", border: "none", side: "front" })}`;
    const shipping = s.pair >= FREE_DELIVERY_FROM ? "0.00 GBP" : gbp(standard.price);
    return `
    <item>
      <g:id>PU-${s.id.toUpperCase()}-PAIR</g:id>
      <title>${esc(`${s.name} Number Plates – Road Legal Pair (Front & Rear) | PlatedUp`)}</title>
      <description>${esc(`${s.blurb} A pair of road-legal front and rear number plates made to order for your registration. Made to BS AU 145e by a DVLA registered supplier. Same day dispatch when you order before ${site.dispatchCutoff} on a working day.`)}</description>
      <link>${esc(`${site.url}/design?style=${s.id}`)}</link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:additional_image_link>${esc(front)}</g:additional_image_link>
      <g:price>${gbp(s.pair)}</g:price>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:brand>${esc(site.name)}</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>Vehicle Parts &amp; Accessories &gt; Number Plates &gt; ${esc(s.name)}</g:product_type>
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
