"use client";

import { usePathname } from "next/navigation";

/** Signed-in tools rather than pages of the website. */
const PRIVATE = ["/admin", "/portal"];

/**
 * Renders its children on the public site and nothing on the signed-in
 * screens.
 *
 * The admin screen is a tool, not a page on the website: it has no business
 * carrying the nav, the footer, the WhatsApp button or the Meta Pixel. The
 * pixel especially — firing it while Walid works through his own leads would
 * put his own sessions into the audience data the ads are optimised against.
 *
 * The client portal is the same, for the same two reasons and one more. A
 * client who signs in to see their figures should not be shown our pricing,
 * our free audit and a WhatsApp button; it is their system while they are
 * in it. And their visits were ending up in the pixel and the analytics for
 * this site, which measures how businesses find us — people who already
 * pay us are not that, and on a phone the footer alone was most of the
 * page they had to scroll past.
 */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PRIVATE.some((start) => pathname?.startsWith(start))) return null;
  return <>{children}</>;
}
