"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { siteConfig, whatsappHref } from "@/lib/site-config";

export function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith("/london");

  if (isLandingPage) {
    return (
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-10 text-center sm:px-8">
          <Logo />
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. ·{" "}
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand">
                <path
                  d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <address className="text-sm not-italic leading-relaxed text-muted">
                {siteConfig.address.line1}
                {siteConfig.address.line1 && <br />}
                {siteConfig.address.city} {siteConfig.address.postcode}
              </address>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <Link href="/tints" className="hover:text-foreground">
                  Window Tints
                </Link>
              </li>
              <li>
                <Link href="/repairs" className="hover:text-foreground">
                  Repairs &amp; Servicing
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground break-all">
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phoneE164}`} className="hover:text-foreground">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Window Tinting · Ceramic &amp; Chameleon Tint · Dechroming · Brakes · Servicing</p>
        </div>
      </div>
    </footer>
  );
}
