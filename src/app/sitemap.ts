import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";
import { areas } from "@/content/areas";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/tints", changeFrequency: "monthly", priority: 0.9 },
    { path: "/repairs", changeFrequency: "monthly", priority: 0.9 },
    { path: "/number-plates", changeFrequency: "monthly", priority: 0.7 },
    { path: "/quote", changeFrequency: "monthly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  ];

  const staticEntries = routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const areaEntries = areas.map((area) => ({
    url: `${siteConfig.url}/window-tinting/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...areaEntries, ...blogEntries];
}
