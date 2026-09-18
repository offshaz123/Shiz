"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { siteConfig, whatsappHref } from "@/lib/site-config";
import { services } from "@/content/services";
import { industries } from "@/content/industries";
import { locations } from "@/content/locations";
import { projects, hasProjects } from "@/content/projects";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navLinks: NavItem[] = [
  {
    href: "/services",
    label: "Services",
    children: services.map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
  },
  {
    href: "/industries",
    label: "Industries",
    children: industries.map((i) => ({ href: `/industries/${i.slug}`, label: i.name })),
  },
  {
    href: "/locations",
    label: "Locations",
    children: locations.map((l) => ({ href: `/locations/${l.slug}`, label: l.city })),
  },
  { href: "/case-studies", label: "Case Studies" },
  // Appears automatically once the first project is added.
  ...(hasProjects
    ? [
        {
          href: "/projects",
          label: "Projects",
          children: projects.map((p) => ({ href: `/projects/${p.slug}`, label: p.name })),
        },
      ]
    : []),
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className="flex items-center gap-1 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                {link.label}
                {link.children && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </Link>

              {link.children && (
                <div className="invisible absolute left-1/2 top-full z-50 w-60 -translate-x-1/2 pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-black/10">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-brand-pink"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
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
            href="/free-audit"
            className="brand-gradient-bg rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Get a Free Audit
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
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
        <div className="max-h-[75vh] overflow-y-auto border-t border-border bg-background px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <div key={link.href} className="flex flex-col gap-2">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-foreground"
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-3 flex flex-col gap-2 border-l border-border pl-4">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="text-sm text-muted transition-colors hover:text-brand-pink"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
              href="/free-audit"
              onClick={() => setOpen(false)}
              className="brand-gradient-bg rounded-full px-5 py-2 text-center text-sm font-semibold text-white"
            >
              Get a Free Audit
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
