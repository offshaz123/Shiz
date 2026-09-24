import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import { publicUser } from "@/lib/auth";
import { currentUser } from "@/lib/session";
import { Section, Eyebrow } from "@/components/Section";
import { AccountSettings } from "@/components/AccountSettings";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

/**
 * Checked on the server, not in the browser. A client-side guard would ship
 * the page first and hide it afterwards, which is a flash of somebody else's
 * screen rather than a protection.
 */
export default async function AccountPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <Eyebrow>Your account</Eyebrow>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Account settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
          Your details and your password. Nothing here is shared with anyone, and we
          use it only to reach you about an account with {brand.name}.
        </p>

        <div className="mt-10">
          <AccountSettings user={publicUser(me)} />
        </div>
      </div>
    </Section>
  );
}
