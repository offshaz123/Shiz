import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * What makes the portal installable on a phone home screen.
 *
 * `start_url` and `scope` are both /portal, which is the point: installed,
 * it opens on the client's own screens and the browser keeps it there. A
 * scope of "/" would have made the marketing site part of their app, so
 * tapping a link would wander them out of it and into our pricing page.
 *
 * `display: standalone` drops the address bar, which is most of what makes
 * it feel like an app rather than a bookmark.
 *
 * Worth knowing what this cannot do. On Android, Chrome offers to install
 * it on its own. On iOS nothing prompts: the person has to use Share, then
 * Add to Home Screen, which is why the page says so rather than waiting
 * for a prompt that never comes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.shortName} — your results and diary`,
    short_name: siteConfig.shortName,
    description: "Your enquiries, what they cost, and every job in your diary.",
    start_url: "/portal",
    scope: "/portal",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#08080a",
    icons: [
      { src: "/portal-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/portal-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/portal-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
