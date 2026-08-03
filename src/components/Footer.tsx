import Link from "next/link";
import { Logo } from "./Logo";
import { siteConfig, whatsappHref, fullAddress, googleMapsHref, yearsExperience } from "@/lib/site-config";

const trustStats = [
  { label: `Founded ${siteConfig.foundedYear}` },
  { label: `${yearsExperience}+ Years Experience` },
  { label: siteConfig.ratingLabel },
  { label: `Based in ${siteConfig.address.postcode.split(" ")[0]}` },
];

const socialLinks = [
  {
    name: "Instagram",
    href: siteConfig.socials.instagram,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: siteConfig.socials.facebook,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
        <path
          d="M14 8.5h2V5.5h-2c-2 0-3.5 1.6-3.5 3.5v2H8v3h2.5V21h3v-7h2.4l.6-3h-3v-2c0-.5.4-1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: siteConfig.socials.tiktok,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
        <path
          d="M15 4v9.5a3.5 3.5 0 1 1-3.5-3.5c.3 0 .6 0 .9.1M15 4c.3 2 1.8 3.4 4 3.6V10c-1.5 0-2.9-.5-4-1.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-5 py-6 sm:px-8">
          {trustStats.map((stat) => (
            <span
              key={stat.label}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-muted"
            >
              {stat.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.description}</p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand-pink/60 hover:text-foreground"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>
                <Link href="/services" className="hover:text-foreground">
                  Services
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
                <Link href="/#faq" className="hover:text-foreground">
                  FAQs
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
                <a href={googleMapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  {fullAddress}
                </a>
              </li>
              <li>
                <a href={`tel:${siteConfig.phoneE164}`} className="hover:text-foreground">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
          <p>Window Tints · Wraps &amp; Dechrome · PPF · Ceramic Coating · Number Plates · Alloy Refurbishment</p>
        </div>
      </div>
    </footer>
  );
}
