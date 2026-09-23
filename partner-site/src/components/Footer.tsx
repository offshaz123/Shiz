import type { ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { solutions } from "@/content/solutions";
import { Logo } from "@/components/Logo";
import { RegulatoryNote } from "@/components/RegulatoryNote";

const socialIconClass = "h-4 w-4";

/** Only the networks we would actually post to. A blank href in brand.social hides one. */
const socials = [
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClass} aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3zM9.5 9h3.8v1.65h.05c.53-.95 1.82-1.95 3.75-1.95 4 0 4.75 2.5 4.75 5.75V21h-4v-5.65c0-1.35-.03-3.1-1.95-3.1-1.95 0-2.25 1.48-2.25 3v5.75h-4Z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={socialIconClass} aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className={socialIconClass} aria-hidden="true">
        <path d="M16.5 2h-3v13.2a2.8 2.8 0 1 1-2.2-2.73v-3.05a5.85 5.85 0 1 0 5.2 5.81V9.1a6.8 6.8 0 0 0 4 1.28v-3a3.8 3.8 0 0 1-4-3.8Z" />
      </svg>
    ),
  },
] as const;

const company = [
  { label: "About us", href: "/about" },
  { label: "How the account works", href: "/business-accounts" },
  { label: "Software for MSBs", href: "/software" },
  { label: "Contact", href: "/contact" },
];

const support = [
  { label: "Opening an account", href: "/opening-an-account" },
  { label: "Send an enquiry", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
];

function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{children}</h2>
  );
}

const linkClass = "text-muted transition-colors hover:text-foreground";

export function Footer() {
  const links = socials.filter(
    (social) => brand.social[social.key as keyof typeof brand.social]
  );

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Business payment accounts for the UK importers, wholesalers and distributors the high
              street will not serve properly.
            </p>

            <div className="mt-5 space-y-1.5 text-sm">
              <p>
                <a href={`mailto:${brand.email}`} className={linkClass}>
                  {brand.email}
                </a>
              </p>
              <p>
                <a href={`tel:${brand.phoneE164}`} className={linkClass}>
                  {brand.phoneDisplay}
                </a>
              </p>
              {brand.address.city && (
                <p className="text-muted">
                  {[brand.address.line1, brand.address.city, brand.address.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>

            {links.length > 0 && (
              <ul className="mt-5 flex gap-2.5">
                {links.map((social) => (
                  <li key={social.key}>
                    <a
                      href={brand.social[social.key as keyof typeof brand.social]}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                      rel="me noopener"
                      target="_blank"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <ColumnHeading>Solutions</ColumnHeading>
            <ul className="mt-4 space-y-2.5 text-sm">
              {solutions.map((solution) => (
                <li key={solution.slug}>
                  <Link href={`/solutions/${solution.slug}`} className={linkClass}>
                    {solution.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Company</ColumnHeading>
            <ul className="mt-4 space-y-2.5 text-sm">
              {company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Help &amp; support</ColumnHeading>
            <ul className="mt-4 space-y-2.5 text-sm">
              {support.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <RegulatoryNote compact />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            &copy; {new Date().getFullYear()} {brand.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
