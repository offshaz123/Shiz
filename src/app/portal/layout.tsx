import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { getClientLogo } from "@/lib/clients";
import { PortalShell } from "@/components/PortalShell";

/**
 * The frame every signed-in client screen sits in.
 *
 * Here rather than repeated on each page: both pages were carrying their own
 * copy of the heading, the logo, the two links and the sign-out button, which
 * is three places to change a name and two of them to forget.
 *
 * Signed out, it renders nothing of its own. The sign-in screen should offer
 * one thing to do and should not show a navigation bar for pages that cannot
 * be opened.
 *
 * Their logo in the browser tab, not ours.
 *
 * A client with the portal open beside six other tabs finds it by the
 * little picture, and ours is the wrong picture: this is their system
 * while they are in it. The address carries the stamp that changes when
 * they upload a new one, so the tab follows the logo rather than keeping
 * whatever the browser cached the first time.
 */
export async function generateMetadata(): Promise<Metadata> {
  const client = await currentClient();
  if (!client) return {};

  const logo = await getClientLogo(client.id);
  return logo ? { icons: { icon: logo } } : {};
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await currentClient();
  if (!client) return <>{children}</>;

  const logo = await getClientLogo(client.id);

  return (
    <PortalShell name={client.name} logo={logo}>
      {children}
    </PortalShell>
  );
}
