import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Private pages stay out of search. Plate and product pictures
// (/api/plate-image, /api/product-image) are allowed: they're the product
// images Google Shopping checks. Googlebot and
// Googlebot-Image are named as well, as Merchant Center asks for.
const allow = ["/", "/api/plate-image", "/api/product-image"];
const disallow = ["/api/", "/checkout", "/basket", "/order-confirmed", "/admin", "/account", "/login", "/signup"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "Googlebot", allow, disallow },
      { userAgent: "Googlebot-Image", allow, disallow },
      { userAgent: "*", allow, disallow },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
