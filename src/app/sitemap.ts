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
    "/number-plates-essex",
    "/trade",
    "/about",
    "/contact",
    "/legal",
    "/upload-documents",
    "/track",
    "/delivery",
    "/returns-policy",
    "/terms-conditions",
    "/privacy-policy",
  ];
  const posts = new Map(publishedPosts().map((p) => [`/blog/${p.slug}`, p.date]));
  return paths.map((p) => ({
    url: `${site.url}${p}`,
    ...(posts.has(p) && { lastModified: posts.get(p) }),
    priority: p === "" ? 1 : p === "/design" || products.some((x) => `/${x.slug}` === p) ? 0.9 : p.startsWith("/blog/") ? 0.6 : 0.7,
  }));
}
