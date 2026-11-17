import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { AuthShell } from "@/components/AuthShell";
import { PortalPanel } from "@/components/PortalPanel";

export const metadata: Metadata = {
  title: "Log in",
  description: `Log in to your ${brand.name} account, or apply for one.`,
  alternates: { canonical: "/login" },
  // No use in a search result, and an indexed login page mostly attracts
  // credential-stuffing traffic.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <PortalPanel />
    </AuthShell>
  );
}
