"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { siteConfig, whatsappHref } from "@/lib/site-config";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith("/demo");

  if (isLandingPage) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Logo />
          <a
            href={`tel:${siteConfig.phoneE164}`}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60"
          >
            Call {siteConfig.phoneDisplay}
          </a>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Address strip — first thing on the page, above the nav. */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-2 text-center sm:justify-between sm:px-8 sm:text-left">
          <p className="flex items-center gap-2 text-xs text-muted">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0 text-brand-pink">
              <path
                d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <span>
              {siteConfig.address.line1}, {siteConfig.address.line2}, {siteConfig.address.city}{" "}
              {siteConfig.address.postcode}
            </span>
          </p>
          <div className="hidden items-center gap-5 text-xs text-muted sm:flex">
            <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
              {siteConfig.email}
            </a>
            <a href={`tel:${siteConfig.phoneE164}`} className="hover:text-foreground">
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-brand-pink/60"
          >
            WhatsApp Us
          </a>
          <Link
            href="/contact"
            className="brand-gradient-bg rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Get Free Strategy Call
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground"
            >
              WhatsApp Us
            </a>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="brand-gradient-bg rounded-full px-5 py-2 text-center text-sm font-semibold text-white"
            >
              Get Free Strategy Call
            </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
