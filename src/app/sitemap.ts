import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/design",
    ...products.map((p) => `/${p.slug}`),
    "/faqs",
    "/about",
    "/contact",
    "/legal",
    "/upload-documents",
    "/delivery",
    "/returns-policy",
    "/terms-conditions",
    "/privacy-policy",
  ];
  return paths.map((p) => ({ url: `${site.url}${p}` }));
}
