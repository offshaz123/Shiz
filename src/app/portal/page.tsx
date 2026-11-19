import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { getAdminClient, getClientSummary, getClientTrend } from "@/lib/clients";
import { ClientDashboard } from "@/components/ClientDashboard";
import {
  SAMPLE_LEAD_VALUE,
  sampleBookings,
  sampleInvoices,
  sampleLeads,
  sampleQuotes,
  sampleSummary,
  sampleTrend,
} from "@/lib/client-sample";

import { loadEverything } from "@/lib/portal-data";
import { chances } from "@/lib/opportunities";
import { NeedsYou } from "@/components/NeedsYou";
import { LoginForm } from "./LoginForm";
import { InstallPrompt } from "@/components/InstallPrompt";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your results",
  robots: { index: false, follow: false },
};

/**
 * The client's own page.
 *
 * It exists because Google and Meta offer two settings and neither is the
 * one a client relationship needs: give them access and they see every
 * campaign, keyword and audience, or give them nothing and they are paying
 * into a black box. This is the middle, and it has to be built because
 * neither platform provides it.
 *
 * Everything here is scoped to the signed-in client by their session. There
 * is no client id in the URL to change, no account switcher, and no query
 * that is not already filtered by it.
 */
export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const client = await currentClient();
  if (!client) {
    const { error } = await searchParams;
    return <LoginForm failed={error === "1"} />;
  }

  const [summary, trend, everything, admin] = await Promise.all([
    getClientSummary(client.id),
    getClientTrend(client.id),
    loadEverything(client.id),
    getAdminClient(client.slug),
  ]);
  const leads = everything.leads;

  // Nothing real anywhere yet means the whole page shows the shape of the
  // thing rather than an empty screen on the day they sign.
  const isSample =
    summary !== null && summary.leads === 0 && leads.length === 0;

  // Built from whatever the page is showing, sample or real, so the panel
  // and the figures under it can never disagree with each other.
  const columns = isSample
    ? chances(sampleLeads, sampleQuotes, sampleBookings, sampleInvoices, SAMPLE_LEAD_VALUE)
    : chances(
        leads,
        everything.quotes,
        everything.bookings,
        everything.invoices,
        admin?.defaultLeadValue ?? null,
      );

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Your results
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Every enquiry your advertising brought in, and what each one cost.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <InstallPrompt />
      </div>

      {/* Above the figures, because it is the thing to act on and they are
          the thing to read. */}
      <div className="mt-5">
        <NeedsYou columns={columns} />
      </div>

      <div className="mt-5">
        {summary ? (
          // The moment one genuine enquiry exists, isSample is false and
          // none of the example data is reachable.
          isSample ? (
            <ClientDashboard
              summary={sampleSummary}
              trend={sampleTrend}
              leads={sampleLeads}
              isSample
            />
          ) : (
            <ClientDashboard summary={summary} trend={trend ?? []} leads={leads} />
          )
        ) : (
          <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
            We cannot reach your figures at the moment. This is our end, not yours — try again
            shortly, or give us a ring on {siteConfig.phoneDisplay}.
          </p>
        )}
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Something look wrong, or want something on here that is not?{" "}
        <a href={`tel:${siteConfig.phoneE164}`} className="font-medium text-foreground hover:underline">
          {siteConfig.phoneDisplay}
        </a>{" "}
        or{" "}
        <a href={`mailto:${siteConfig.email}`} className="font-medium text-foreground hover:underline">
          {siteConfig.email}
        </a>
        .
      </p>
    </div>
  );
}
