"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { siteConfig, whatsappHref } from "@/lib/site-config";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/#faq", label: "FAQs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function QuickMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Quick links"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-brand-pink/60"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-red-500 hover:bg-surface-2"
          >
            Pricing
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            WhatsApp Us
          </a>
          <a
            href={`tel:${siteConfig.phoneE164}`}
            className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Call {siteConfig.phoneDisplay}
          </a>
          <Link
            href="/services/number-plates"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-surface-2"
          >
            Number Plates
          </Link>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
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
          <Link
            href="/contact"
            className="brand-gradient-bg rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Get a Quote
          </Link>
          <QuickMenu />
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
            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-red-500"
            >
              Pricing
            </Link>
            <Link
              href="/services/number-plates"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Number Plates
            </Link>
            <a
              href={`tel:${siteConfig.phoneE164}`}
              className="rounded-full border border-border px-4 py-2 text-center text-sm font-semibold text-foreground"
            >
              Call {siteConfig.phoneDisplay}
            </a>
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
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
