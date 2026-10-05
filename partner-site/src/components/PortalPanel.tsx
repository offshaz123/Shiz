import Link from "next/link";
import { brand } from "@/lib/brand";

/**
 * What /login shows now: the two ways into the account, both of which live
 * on the provider's platform rather than here.
 *
 * It sits in the same AuthShell as the website-account form did, so the
 * globe and the blue are still alongside it — somebody arriving from the
 * header lands on our page, in our branding, and only then crosses over.
 * Sending them straight out from the header meant the last thing they saw
 * of us was a nav bar.
 *
 * Both links are plain anchors. The portal is another host, so there is
 * nothing for the router to prefetch, and they stay in the same tab because
 * each one starts a job rather than opening a reference.
 */
export function PortalPanel() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Your account lives in the {brand.name} online banking portal. Sign in there to see
        balances, send payments and download statements.
      </p>

      <a href={brand.portalUrl} rel="noopener" className="btn btn-primary mt-8 w-full">
        Log in to your account
      </a>

      <div className="mt-8 flex items-center gap-4">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          No account yet
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <a href={brand.portalApplyUrl} rel="noopener" className="btn btn-ghost mt-6 w-full">
        Apply for an account
      </a>
      <p className="mt-3 text-center text-xs text-muted">
        Takes about ten minutes. You will need your company number and ID for the people who
        own or run the business.
      </p>

      <p className="mt-10 text-center text-sm text-muted">
        Rather talk it through first?{" "}
        <Link href="/contact" className="font-semibold text-accent-2 hover:underline">
          Send us a message
        </Link>
      </p>
    </div>
  );
}
