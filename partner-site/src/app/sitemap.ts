import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";
import { solutions } from "@/content/solutions";

export const dynamic = "force-static";

/**
 * A lastmod of "today" on every page, every deploy, teaches Google to ignore
 * the field. This is the date the site's content was last genuinely revised —
 * move it when you edit the pages, not when you redeploy them.
 */
const contentUpdated = new Date("2026-09-22");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/solutions", changeFrequency: "monthly", priority: 0.95 },
    { path: "/business-accounts", changeFrequency: "monthly", priority: 0.9 },
    { path: "/opening-an-account", changeFrequency: "monthly", priority: 0.8 },
    { path: "/software", changeFrequency: "monthly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...routes.map((route) => ({
      url: `${brand.url}${route.path}`,
      lastModified: contentUpdated,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...solutions.map((solution) => ({
      url: `${brand.url}/solutions/${solution.slug}`,
      lastModified: contentUpdated,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
