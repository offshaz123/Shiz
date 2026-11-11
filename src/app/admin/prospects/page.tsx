import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "../LoginForm";
import { ProspectFinder } from "@/components/ProspectFinder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who to call",
  robots: { index: false, follow: false },
};

/**
 * The call list.
 *
 * Unlike the scanner page, this one is NOT for showing a customer: it holds
 * other businesses' details and notes on what they said about us. Keep it on
 * your own screen.
 */
export default async function AdminProspectsPage() {
  if (!(await isAdmin())) return <LoginForm />;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Who to call</h1>
          <p className="mt-1 text-sm text-muted">
            Keep this one to yourself — it has other businesses on it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/company"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Company check
          </Link>
          <Link
            href="/admin/health"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            System check
          </Link>
          <Link
            href="/admin/scan"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Scan a site
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Back to leads
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <ProspectFinder />
      </div>
    </div>
  );
}
