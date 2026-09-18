"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { NewsletterForm } from "./NewsletterForm";
import { siteConfig, whatsappHref, hasPublishedReviews } from "@/lib/site-config";
import { services } from "@/content/services";
import { industries } from "@/content/industries";
import { locations } from "@/content/locations";

const partnerBadges = [
  { label: "Google Partner", className: "border-[#4285F4]/45 text-[#4285F4]" },
  { label: "Meta Partner", className: "border-[#0081FB]/45 text-[#0081FB]" },
  { label: "WordPress Expert", className: "border-[#21759B]/50 text-[#3b96c4]" },
];

const companyLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/industries", label: "Industries" },
  { href: "/locations", label: "Locations" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/pricing", label: "Pricing" },
  { href: "/free-audit", label: "Free Audit" },
  { href: "/blog", label: "Blog" },
  { href: "/walid", label: "Talk to Walid" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-[3px] h-3.5 w-3.5 shrink-0 text-brand-pink">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stars() {
  return (
    <span className="flex gap-0.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#f7941e]">
          <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

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
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr_0.85fr_1.15fr]">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              A UK marketing agency for businesses that want customers, not impressions. We run
              Meta, Instagram and Google campaigns, build the websites and landing pages behind
              them, handle SEO and local search, and put every enquiry into one inbox with the
              follow-up already set up.
            </p>

            <SocialLinks className="mt-6" />

            <div className="mt-6 flex flex-wrap gap-2">
              {partnerBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`rounded-full border bg-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Our Services
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="flex items-start gap-2 hover:text-foreground"
                  >
                    <Chevron />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Company
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-start gap-2 hover:text-foreground">
                    <Chevron />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
              Get In Touch
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-muted">
              <li>
                <a href={`tel:${siteConfig.phoneE164}`} className="flex items-start gap-3 hover:text-foreground">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <path
                      d="M7 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6v3a1.6 1.6 0 0 1-1.8 1.6A16.5 16.5 0 0 1 5.4 5.8 1.6 1.6 0 0 1 7 4Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-3 hover:text-foreground">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m3.8 7 8.2 5.6L20.2 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 hover:text-foreground"
                >
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <path
                      fill="currentColor"
                      d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.8 1.8 0 0 0 .2-.4.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.9 10a5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9 9.9 9.9 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"
                    />
                  </svg>
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
                    <path
                      d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <address className="not-italic leading-relaxed">
                    {siteConfig.address.line1}, {siteConfig.address.line2}
                    <br />
                    {siteConfig.address.city} {siteConfig.address.postcode}
                  </address>
                </div>
              </li>
            </ul>

            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-brand-pink">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m3.8 7 8.2 5.6L20.2 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Get free marketing tips
              </h3>
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-9">
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

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-7 text-xs text-muted lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-foreground">{siteConfig.name}</span>.
            All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <a href="/sitemap.xml" className="hover:text-foreground">
              Sitemap
            </a>
            <span className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Client rating</span>
              <Stars />
              <span>97%</span>
            </span>
            {hasPublishedReviews && (
              <a
                href={siteConfig.reviews.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <span className="font-semibold text-foreground">Google</span>
                <Stars />
                <span>{siteConfig.reviews.averageRating.toFixed(1)}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
