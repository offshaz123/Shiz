import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products } from "@/lib/content";
import { publishedPosts } from "@/lib/blog";

// Picks up new blog posts as they go live.
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/design",
    ...products.map((p) => `/${p.slug}`),
    "/faqs",
    "/blog",
    ...publishedPosts().map((p) => `/blog/${p.slug}`),
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
