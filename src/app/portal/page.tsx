import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { getClientSummary, getClientTrend, listClientLeads } from "@/lib/clients";
import { ClientDashboard } from "@/components/ClientDashboard";
import { sampleLeads, sampleSummary, sampleTrend } from "@/lib/client-sample";
import { LoginForm } from "./LoginForm";
import { clientLogout } from "./actions";
import { PortalNav } from "@/components/PortalNav";
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

  const [summary, trend, leads] = await Promise.all([
    getClientSummary(client.id),
    getClientTrend(client.id),
    listClientLeads(client.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Your enquiries and what they cost, updated as they come in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <PortalNav />
          <form action={clientLogout}>
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <InstallPrompt />
      </div>

      <div className="mt-5">
        {summary ? (
          // Nothing real yet means the page shows the shape of the thing
          // rather than an empty screen on the day they sign. The moment one
          // genuine enquiry exists, isSample is false and none of the
          // example data is reachable.
          summary.leads === 0 && (leads?.length ?? 0) === 0 ? (
            <ClientDashboard
              summary={sampleSummary}
              trend={sampleTrend}
              leads={sampleLeads}
              isSample
            />
          ) : (
            <ClientDashboard summary={summary} trend={trend ?? []} leads={leads ?? []} />
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
