import Link from "next/link";
import { brand } from "@/lib/brand";
import { sectors } from "@/content/sectors";
import { solutions } from "@/content/solutions";
import { Logo } from "@/components/Logo";
import { RegulatoryNote } from "@/components/RegulatoryNote";

const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export function Footer() {
  const socials = Object.entries(brand.social).filter(([, href]) => href);

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Business payment accounts for the UK importers, wholesalers and distributors the high
              street will not serve properly.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Solutions</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {solutions.map((solution) => (
                <li key={solution.slug}>
                  <Link href={`/solutions/${solution.slug}`} className="hover:text-foreground">
                    {solution.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/business-accounts" className="hover:text-foreground">
                  How the account works
                </Link>
              </li>
              <li>
                <Link href="/opening-an-account" className="hover:text-foreground">
                  Opening an account
                </Link>
              </li>
              <li>
                <Link href="/software" className="hover:text-foreground">
                  Software for MSBs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  About us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Who we serve</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {sectors.map((sector) => (
                <li key={sector.slug}>
                  <Link href={`/who-we-serve/${sector.slug}`} className="hover:text-foreground">
                    {sector.longName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Get in touch</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a href={`tel:${brand.phoneE164}`} className="hover:text-foreground">
                  {brand.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${brand.email}`} className="hover:text-foreground">
                  {brand.email}
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Send an enquiry
                </Link>
              </li>
              {brand.address.city && (
                <li className="pt-1 text-muted">
                  {[brand.address.line1, brand.address.city, brand.address.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-4 flex gap-4 text-sm text-muted">
                {socials.map(([key, href]) => (
                  <li key={key}>
                    <a href={href} className="hover:text-foreground" rel="me noopener" target="_blank">
                      {socialLabels[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <RegulatoryNote />
          <div className="mt-6 flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {brand.legalName}. All rights reserved.
            </p>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
