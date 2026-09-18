"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { siteConfig, whatsappHref } from "@/lib/site-config";
import { services } from "@/content/services";
import { industries } from "@/content/industries";
import { locations } from "@/content/locations";

export function Footer() {
  const pathname = usePathname();
  const isLandingPage = pathname?.startsWith("/demo");

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
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A UK marketing agency for businesses that want customers, not impressions. We run
              Meta, Instagram and Google campaigns, build the websites and landing pages behind
              them, handle SEO and local search, and put every enquiry into one inbox with the
              follow-up already set up.
            </p>
            <div className="mt-6 flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                <path
                  d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <address className="text-sm not-italic leading-relaxed text-muted">
                {siteConfig.address.line1}, {siteConfig.address.line2}
                <br />
                {siteConfig.address.city} {siteConfig.address.postcode}
              </address>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`} className="hover:text-foreground">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/industries" className="hover:text-foreground">
                  Industries
                </Link>
              </li>
              <li>
                <Link href="/case-studies" className="hover:text-foreground">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="/free-audit" className="hover:text-foreground">
                  Free Audit
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/walid" className="hover:text-foreground">
                  Talk to Walid
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
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
                <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
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

        <div className="mt-12 border-t border-border pt-9">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Areas we cover
          </h3>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted">
            {locations.map((location) => (
              <Link key={location.slug} href={`/locations/${location.slug}`} className="hover:text-foreground">
                Marketing agency {location.city}
              </Link>
            ))}
          </div>

          <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Industries we work with
          </h3>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 text-sm text-muted">
            {industries.map((industry) => (
              <Link key={industry.slug} href={`/industries/${industry.slug}`} className="hover:text-foreground">
                {industry.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Shaz Marketing Group. All rights reserved.</p>
          <p>Meta &amp; Instagram Ads · Lead Generation · All-In-One CRM · AI Receptionist</p>
        </div>
      </div>
    </footer>
  );
}
