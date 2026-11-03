import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "../LoginForm";
import { AdminScanner } from "@/components/AdminScanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scan a site",
  robots: { index: false, follow: false },
};

/**
 * A screen that can be turned towards a customer.
 *
 * Deliberately holds nothing but the scanner — no leads, no phone numbers,
 * no visitor figures. Those live one page over and are nobody else's
 * business.
 */
export default async function AdminScanPage() {
  if (!(await isAdmin())) return <LoginForm />;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan a site</h1>
          <p className="mt-1 text-sm text-muted">
            Safe to show a customer — nothing of ours is on this page.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Back to leads
        </Link>
      </div>

      <div className="mt-8">
        <AdminScanner />
      </div>
    </div>
  );
}
