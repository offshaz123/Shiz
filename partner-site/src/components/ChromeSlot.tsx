"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides the site header and footer on the routes that supply their own
 * full-screen layout.
 *
 * A nested layout.tsx cannot do this: in the App Router a nested layout
 * renders INSIDE the root one rather than replacing it, so the header would
 * still be there above it. A route group with its own root layout would
 * work, but it would mean moving every other page into a second group for
 * the sake of one screen.
 *
 * This is a client component so it can read the path, but its children are
 * still whatever the server passed in — the footer stays a server component
 * and none of it ships to the browser on the pages that do render it.
 */
const BARE_ROUTES = ["/login"];

export function ChromeSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (BARE_ROUTES.includes(pathname)) return null;
  return <>{children}</>;
}
