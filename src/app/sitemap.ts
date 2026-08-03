import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { serviceCategories } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.85 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  ];

  const staticEntries = routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const serviceEntries = serviceCategories.map((category) => ({
    url: `${siteConfig.url}/services/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  return [...staticEntries, ...serviceEntries];
}
