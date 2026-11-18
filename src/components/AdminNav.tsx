"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
 *
 * On a phone the same eight links wrapped onto four rows, so the top third
 * of every screen was the way to leave it. Below `sm` they become a single
 * picker instead: one line, and on a phone the operating system opens its
 * own list, which beats anything built here. The hint for the page you are
 * on sits under it, because a picker shows one label where the row showed
 * all eight and that is the context the row gave for free.
 */

const PAGES = [
  { href: "/admin", label: "Overview", hint: "What the system has done on its own" },
  { href: "/admin/today", label: "Today", hint: "What to do now" },
  { href: "/admin/leads", label: "Leads", hint: "People who came to us" },
  { href: "/admin/clients", label: "Clients", hint: "Who pays us, their logins and their ad spend" },
  { href: "/admin/prospects", label: "Who to call", hint: "Every business found, and what has been sent to each" },
  { href: "/admin/company", label: "Company check", hint: "The official register" },
  { href: "/admin/scan", label: "Scan a site", hint: "Audit any website — safe to show a customer" },
  { href: "/admin/health", label: "System check", hint: "Is anything broken" },
];

export function AdminNav() {
  // Read rather than passed in, so adding a page means adding one line to
  // PAGES and nothing else anywhere.
  const current = usePathname();
  const router = useRouter();

  const active =
    PAGES.find((page) =>
      page.href === "/admin" ? current === "/admin" : current.startsWith(page.href),
    ) ?? PAGES[0];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-5 py-3 sm:px-8">
        <Link href="/admin" className="text-sm font-bold tracking-tight text-foreground">
          {siteConfig.shortName}
          <span className="ml-1.5 rounded-md bg-brand-pink/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-pink">
            ADMIN
          </span>
        </Link>

        <nav className="hidden flex-wrap items-center gap-1 sm:flex">
          {PAGES.map((page) => {
            const isHere = page.href === active.href;
            return (
              <Link
                key={page.href}
                href={page.href}
                title={page.hint}
                aria-current={isHere ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isHere
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

      <div className="mx-auto max-w-6xl px-5 pb-3 sm:hidden">
        <label className="sr-only" htmlFor="admin-page">
          Go to
        </label>
        <select
          id="admin-page"
          value={active.href}
          onChange={(e) => router.push(e.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground"
        >
          {PAGES.map((page) => (
            <option key={page.href} value={page.href}>
              {page.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 px-1 text-[11px] text-muted">{active.hint}</p>
      </div>
    </header>
  );
}
