import type { ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { Logo } from "@/components/Logo";
import { GlobeBackdrop } from "@/components/GlobeBackdrop";

/**
 * The split screen every account page sits in: brand on the blue, form on
 * the white.
 *
 * None of these pages use the site header and footer — see ChromeSlot. A
 * marketing nav across a login screen is a row of invitations to abandon
 * what you came to do, and the one link that matters is the way back, which
 * the logo already is.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hero-blue relative hidden overflow-hidden lg:block">
        <GlobeBackdrop />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="inline-flex" aria-label={`${brand.name} home`}>
            <Logo className="h-9 w-auto" />
          </Link>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight">
              Business payments,
              <span className="accent-gradient-text block">simplified.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted">
              One account in your own company name. Money in from your customers, currency
              converted at a rate you were quoted, money out to your suppliers.
            </p>
          </div>

          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {brand.legalName}
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-5 lg:hidden">
          <Link href="/" aria-label={`${brand.name} home`}>
            <Logo className="h-8 w-auto" />
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-accent-2">
            Talk to us
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-14">{children}</div>

        <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-5 text-xs text-muted">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M8.25 10.5V7.75a3.75 3.75 0 0 1 7.5 0v2.75" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          Regulated &middot; Encrypted &middot; Secure
        </div>
      </div>
    </div>
  );
}
