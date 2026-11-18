"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The client's two screens.
 *
 * Deliberately two and not more. This is opened on a phone by somebody
 * between jobs, and a tab bar with six things on it is a thing you read
 * rather than use.
 */
const PAGES = [
  { href: "/portal", label: "Results" },
  { href: "/portal/calendar", label: "Diary" },
];

export function PortalNav() {
  const current = usePathname();

  return (
    <nav className="flex gap-1.5">
      {PAGES.map((page) => {
        const active = current === page.href;
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-brand-pink text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
