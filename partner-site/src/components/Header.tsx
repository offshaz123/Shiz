"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { solutions } from "@/content/solutions";

const navLinks = [
  { href: "/business-accounts", label: "How it works" },
  { href: "/who-we-serve", label: "Who we serve" },
  { href: "/software", label: "Software for MSBs" },
  { href: "/opening-an-account", label: "Opening an account" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {/* Solutions opens on hover and, for anyone tabbing through, on
              focus-within — no state, no JavaScript, and the trigger is still
              a real link to the index page. */}
          <div className="group relative">
            <Link
              href="/solutions"
              className={`flex items-center gap-1.5 text-sm transition-colors hover:text-foreground ${
                pathname.startsWith("/solutions") ? "text-foreground" : "text-muted"
              }`}
            >
              Solutions
              <svg
                viewBox="0 0 16 16"
                className="h-3 w-3 transition-transform group-hover:rotate-180"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m4 6 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div className="invisible absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-lift)]">
                {solutions.map((solution) => (
                  <Link
                    key={solution.slug}
                    href={`/solutions/${solution.slug}`}
                    className="block rounded-xl px-3.5 py-3 transition-colors hover:bg-accent-soft"
                  >
                    <span className="block text-sm font-semibold">{solution.name}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                      {solution.tagline}
                    </span>
                  </Link>
                ))}
                <Link
                  href="/solutions"
                  className="mt-1 block border-t border-border px-3.5 pb-2 pt-3 text-xs font-semibold text-accent-2"
                >
                  All solutions &rarr;
                </Link>
              </div>
            </div>
          </div>

          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  active ? "text-foreground" : "text-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="btn btn-primary hidden !px-5 !py-2.5 sm:inline-flex"
          >
            Talk to us
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              {open ? (
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden" aria-label="Main, mobile">
          <div className="mx-auto flex max-w-6xl flex-col px-5 py-2">
            <p className="pt-3 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Solutions
            </p>
            {solutions.map((solution) => (
              <Link
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm text-muted hover:text-foreground"
              >
                {solution.name}
              </Link>
            ))}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // The menu stays mounted across a navigation, so it has to be
                // closed here or it covers the page you just asked for.
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm text-muted last:border-0 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn btn-primary mt-3 mb-3"
            >
              Talk to us
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
