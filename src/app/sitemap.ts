import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { blogPosts } from "@/content/blog";
import { services } from "@/content/services";
import { industries } from "@/content/industries";
import { locations } from "@/content/locations";
import { approaches } from "@/content/case-studies";
import { projects, hasProjects } from "@/content/projects";

export const dynamic = "force-static";

/**
 * Every entry used to report `new Date()`, so each deploy told Google the whole
 * site had changed that day. Google learns to ignore a lastmod that is always
 * "today", so pages carry the date of the content behind them instead, and the
 * rest use the date of the newest post as a stand-in for the last real edit.
 */
const newestPost = blogPosts
  .map((post) => post.publishedAt)
  .sort()
  .at(-1);
const siteUpdated = new Date(newestPost ?? "2026-01-01");

export default function sitemap(): MetadataRoute.Sitemap {
  // /demo is deliberately absent: it's a standalone landing page for paid
  // traffic with no internal links pointing at it, so listing it asks Google to
  // crawl a page the site itself doesn't link to.
  const routes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/free-audit", changeFrequency: "monthly", priority: 0.95 },
    { path: "/walid", changeFrequency: "monthly", priority: 0.7 },
    { path: "/industries", changeFrequency: "monthly", priority: 0.85 },
    { path: "/locations", changeFrequency: "monthly", priority: 0.8 },
    { path: "/case-studies", changeFrequency: "monthly", priority: 0.85 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  ];

  const staticEntries = routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: siteUpdated,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const serviceEntries = services.map((service) => ({
    url: `${siteConfig.url}/services/${service.slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const industryEntries = industries.map((industry) => ({
    url: `${siteConfig.url}/industries/${industry.slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const locationEntries = locations.map((location) => ({
    url: `${siteConfig.url}/locations/${location.slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const approachEntries = approaches.map((approach) => ({
    url: `${siteConfig.url}/case-studies/${approach.slug}`,
    lastModified: siteUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const projectEntries = hasProjects
    ? [
        {
          url: `${siteConfig.url}/projects`,
          lastModified: siteUpdated,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
        ...projects.map((project) => ({
          url: `${siteConfig.url}/projects/${project.slug}`,
          lastModified: siteUpdated,
          changeFrequency: "monthly" as const,
          priority: 0.75,
        })),
      ]
    : [];

  const blogEntries = blogPosts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...industryEntries,
    ...locationEntries,
    ...approachEntries,
    ...projectEntries,
    ...blogEntries,
  ];
}
