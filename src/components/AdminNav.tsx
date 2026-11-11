"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { siteConfig } from "@/lib/site-config";

/**
 * One bar across every admin page.
 *
 * Each page used to carry its own handful of links back to the others, which
 * meant the way out of a page depended on which page you were on, and a new
 * page meant editing four files to make it reachable. Somebody who has been
 * here five minutes should be able to see everything there is and get to it
 * from anywhere.
 *
 * The current page is marked rather than hidden. Knowing where you are is
 * half of knowing how to get somewhere else.
 */

const PAGES = [
  { href: "/admin", label: "Overview", hint: "What the machinery has done" },
  { href: "/admin/leads", label: "Leads", hint: "People who came to us" },
  { href: "/admin/prospects", label: "Who to call", hint: "The call list" },
  { href: "/admin/company", label: "Company check", hint: "The official register" },
  { href: "/admin/scan", label: "Scan a site", hint: "Audit any website" },
  { href: "/admin/health", label: "System check", hint: "Is anything broken" },
];

export function AdminNav() {
  // Read rather than passed in, so adding a page means adding one line to
  // PAGES and nothing else anywhere.
  const current = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3 sm:px-8">
        <Link href="/admin" className="text-sm font-bold tracking-tight text-foreground">
          {siteConfig.shortName}
          <span className="ml-1.5 rounded-md bg-brand-pink/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-pink">
            ADMIN
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {PAGES.map((page) => {
            const active =
              page.href === "/admin" ? current === "/admin" : current.startsWith(page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                title={page.hint}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-brand-pink text-white"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {page.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[11px] text-muted sm:inline">{siteConfig.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
