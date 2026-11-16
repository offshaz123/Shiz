import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
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
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <AdminHeading title="Scan a site">
        Safe to show a customer. Nothing of ours is on this page.
      </AdminHeading>

      <div className="mt-8">
        <AdminScanner />
      </div>
    </div>
  );
}
