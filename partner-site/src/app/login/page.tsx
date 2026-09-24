import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { AuthShell } from "@/components/AuthShell";
import { AuthPanel } from "@/components/AuthPanel";

export const metadata: Metadata = {
  title: "Log in",
  description: `Log in to your ${brand.name} account.`,
  alternates: { canonical: "/login" },
  // No use in a search result, and an indexed login page mostly attracts
  // credential-stuffing traffic.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <AuthPanel />
    </AuthShell>
  );
}
