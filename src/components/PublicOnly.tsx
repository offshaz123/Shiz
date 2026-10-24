"use client";

import { usePathname } from "next/navigation";

/**
 * Renders its children on the public site and nothing on the admin pages.
 *
 * The admin screen is a tool, not a page on the website: it has no business
 * carrying the nav, the footer, the WhatsApp button or the Meta Pixel. The
 * pixel especially — firing it while Walid works through his own leads would
 * put his own sessions into the audience data the ads are optimised against.
 */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}
