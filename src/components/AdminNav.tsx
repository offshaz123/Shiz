"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/admin/actions";
import { siteConfig } from "@/lib/site-config";
import type { AdminPage, NewCounts } from "@/lib/admin-pages";
import { ADMIN_GROUPS, TONE } from "@/lib/nav-groups";

/**
 * The way around the admin.
 *
 * A column down the left on a wide screen, at Walid's ask, and the better
 * shape for it: there are ten pages now and a row of ten across the top
 * either wrapped onto two lines or pushed the work down the screen. A
 * column has room for each page to say what it is for.
 *
 * Hovering a page shows what is on it. That came from a real complaint —
 * the reviews sit at the bottom of the enquiries page and nothing anywhere
 * said so, so the only way to find them was to have been told. Each entry
 * links to its own heading, so you land on the part you wanted rather than
 * at the top of a long page.
 *
 * It waits before it opens, which was the second complaint and a fair one:
 * on the first version the menu appeared the instant the pointer touched a
 * row, so crossing the column on the way to the page content made three
 * menus flash open and shut. A pause long enough to mean "I stopped here"
 * and short enough not to feel broken fixes that, and it closes on a
 * shorter pause so moving down the list does not leave a trail open.
 *
 * The arrow is also a button. Hover intent is a guess about what somebody
 * meant; a click is not, and once clicked the menu stays until clicked
 * again.
 *
 * A number next to a page means something arrived since you last opened
 * it. Opening the page clears it, which is why it counts what is new to
 * you rather than what is outstanding overall: a badge showing work
 * waiting never goes away, and a badge that never goes away stops being
 * read within a week.
 *
 * Below lg it is a picker, as it was. On a phone the operating system's
 * own list beats anything built here, and a sidebar would eat half the
 * screen.
 */

export function AdminNav({
  pages,
  who,
  counts,
}: {
  pages: AdminPage[];
  who: string;
  counts: NewCounts;
}) {
  const current = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  /** Set by clicking the arrow. A pinned menu ignores the pointer. */
  const [pinned, setPinned] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * The pause before a hover counts as asking for the menu.
   *
   * This has been wrong in both directions. With no pause at all,
   * crossing the column flashed three menus open on the way past. At
   * 450ms it felt broken — you stop on a row and wait, which is worse
   * than the flashing was.
   *
   * Just under a fifth of a second is the gap: long enough that passing
   * through does not trigger it, short enough that stopping on a row
   * feels like the menu was already there. Closing waits longer, so
   * moving the pointer down into the menu does not lose it.
   */
  const OPEN_AFTER = 180;
  const CLOSE_AFTER = 320;

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function hoverOpen(key: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(key), OPEN_AFTER);
  }

  function hoverClose(key: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setOpen((current) => (current === key ? null : current));
    }, CLOSE_AFTER);
  }

  const active =
    pages.find((page) =>
      page.href === "/admin" ? current === "/admin" : current.startsWith(page.href),
    ) ??
    pages[0] ?? { href: "/admin", label: "Admin", hint: "", key: "overview" as const };

  return (
    <>
      {/* The column. Sticky, so the way out of a long call list does not
          depend on scrolling back to the top of it. */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-surface lg:px-3 lg:py-5">
        <Link href="/admin" className="px-2 text-sm font-bold tracking-tight text-foreground">
          {siteConfig.shortName}
          <span className="ml-1.5 rounded-md bg-brand-pink/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-pink">
            ADMIN
          </span>
        </Link>

        <nav className="mt-6 flex flex-col">
          {ADMIN_GROUPS.map((group) => {
            const mine = pages.filter((page) => page.group === group.key);
            // A heading over nothing is worse than no heading: it tells
            // somebody there is a part of this they cannot see.
            if (mine.length === 0) return null;
            const tone = TONE[group.tone];

            return (
              <div key={group.key} className="mb-1">
                <div className="mb-1 mt-4 flex items-center gap-2 px-2 first:mt-0">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`} />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] ${tone.label}`}
                  >
                    {group.label}
                  </span>
                  <span className={`h-px flex-1 ${tone.rule}`} />
                </div>

                <div className="flex flex-col gap-0.5">
          {mine.map((page) => {
            const here = page.href === active.href;
            const fresh = counts[page.key] ?? 0;
            const has = (page.sections?.length ?? 0) > 0;
            const showing = has && (pinned === page.key || open === page.key);

            return (
              <div
                key={page.href}
                onMouseEnter={() => has && pinned !== page.key && hoverOpen(page.key)}
                onMouseLeave={() => pinned !== page.key && hoverClose(page.key)}
              >
                <div className="flex items-stretch">
                <Link
                  href={page.href}
                  title={page.hint}
                  aria-current={here ? "page" : undefined}
                  className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    here
                      ? tone.active
                      : "border-l-2 border-transparent text-muted hover:border-border hover:bg-background hover:text-foreground"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{page.label}</span>

                  {/* Only when there is something. A row of zeroes is a row
                      of noise, and the one month everything is quiet is the
                      month somebody stops looking at the numbers. */}
                  {fresh > 0 && (
                    <span
                      title={`${fresh} new since you last opened this`}
                      className="shrink-0 rounded-full bg-brand-pink px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white"
                    >
                      {fresh > 99 ? "99+" : fresh}
                    </span>
                  )}

                </Link>

                {/* Its own button, outside the link. Inside it, a click
                    meant "open the menu" and "go to the page" at once,
                    and the navigation won. */}
                {has && (
                  <button
                    type="button"
                    aria-expanded={showing}
                    aria-label={`What is on ${page.label}`}
                    onClick={() => {
                      if (timer.current) clearTimeout(timer.current);
                      setPinned((k) => (k === page.key ? null : page.key));
                      setOpen(null);
                    }}
                    className="ml-0.5 rounded-lg px-1.5 text-muted transition hover:text-foreground"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden
                      className={`h-3 w-3 transition ${showing ? "rotate-90" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                )}
                </div>

                {/* What is on that page. In the flow rather than floating
                    over it: a menu that appears on top of the next item is
                    a menu you lose by moving the mouse two pixels. */}
                {showing && (
                  <ul className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-2 pt-0.5">
                    {page.sections?.map((section) => (
                      <li key={section.id}>
                        <Link
                          href={`${page.href}#${section.id}`}
                          className="block rounded px-2 py-1 text-[11px] leading-snug text-muted hover:text-foreground"
                        >
                          {section.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-1">
          <span className="truncate px-2 text-[11px] text-muted" title={siteConfig.email}>
            Signed in as {who}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* The bar, below lg. */}
      <header className="border-b border-border bg-surface lg:hidden">
        <div className="flex items-center gap-3 px-5 py-3">
          <Link href="/admin" className="text-sm font-bold tracking-tight text-foreground">
            {siteConfig.shortName}
            <span className="ml-1.5 rounded-md bg-brand-pink/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-pink">
              ADMIN
            </span>
          </Link>
          <span className="ml-auto text-[11px] text-muted">{who}</span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="px-5 pb-3">
          <label className="sr-only" htmlFor="admin-page">
            Go to
          </label>
          <select
            id="admin-page"
            value={active.href}
            onChange={(e) => router.push(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold text-foreground"
          >
            {/* The same grouping as the column, because a flat list of
                fifteen in a phone picker is the thing the headings were
                added to fix. */}
            {ADMIN_GROUPS.map((group) => {
              const mine = pages.filter((page) => page.group === group.key);
              if (mine.length === 0) return null;
              return (
                <optgroup key={group.key} label={group.label}>
                  {mine.map((page) => {
                    const fresh = counts[page.key] ?? 0;
                    return (
                      <option key={page.href} value={page.href}>
                        {page.label}
                        {fresh > 0 ? ` (${fresh} new)` : ""}
                      </option>
                    );
                  })}
                </optgroup>
              );
            })}
          </select>
          <p className="mt-1.5 px-1 text-[11px] text-muted">{active.hint}</p>
        </div>
      </header>
    </>
  );
}
