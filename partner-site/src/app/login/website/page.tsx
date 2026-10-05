import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { AuthShell } from "@/components/AuthShell";
import { AuthPanel } from "@/components/AuthPanel";

/**
 * The website account — the signed-in area of this site, with the checklist,
 * the rates and the cost calculator on it. Not the banking portal, which is
 * what /login now points people at.
 *
 * It used to live at /login. It moved rather than being deleted because
 * accounts already exist against it.
 */
export const metadata: Metadata = {
  title: "Website account",
  description: `Sign in to your ${brand.name} website account.`,
  alternates: { canonical: "/login/website" },
  robots: { index: false, follow: false },
};

export default function WebsiteLoginPage() {
  return (
    <AuthShell>
      <AuthPanel />
    </AuthShell>
  );
}
