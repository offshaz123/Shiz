import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";
import { NotYours } from "./NotYours";
import { getAutomaticEmails, getCronHealth, getRegionStats } from "@/lib/admin-data";
import { getEngineRoom } from "@/lib/engine-room";
import { EngineRoom } from "@/components/EngineRoom";
import { SchedulerStatus } from "@/components/SchedulerStatus";
import { AutomaticEmails } from "@/components/AutomaticEmails";
import { RegionStats } from "@/components/RegionStats";
import { AdminHeading } from "@/components/AdminHeading";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

/**
 * The first thing anybody sees.
 *
 * It answers one question — is the machinery working, and what has it done —
 * and then gets out of the way. The leads themselves moved to their own page
 * when this one grew long enough that you had to scroll past the whole
 * pipeline to read an enquiry.
 */
export default async function AdminPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "overview")) return <NotYours page="overview" />;

  const [engine, cron, finder, automatic, byRegion] = await Promise.all([
    getEngineRoom(),
    getCronHealth(),
    getCronHealth("find-and-scan"),
    getAutomaticEmails(),
    getRegionStats(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8">
      <AdminHeading title="Overview">
        What the system is doing and what it has sent. Everything here is counted from the
        database, never estimated.
      </AdminHeading>

      {/* The scheduler first. Nothing below it means anything if the daily
          job has stopped, and a figure that stopped moving yesterday looks
          exactly like a quiet day until something says otherwise. */}
      {cron && <SchedulerStatus cron={cron} finder={finder} />}

      {/* Both markets, with a switch. Above the engine room because "how
          is each country doing" is the question this page gets opened
          for, and the machinery below it is the answer to why. */}
      {byRegion && <RegionStats rows={byRegion} regions={who.regions} />}

      {engine ? (
        <EngineRoom engine={engine} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          No database connection, so there is nothing to show here. The system check will say why.
        </p>
      )}

      {automatic && <AutomaticEmails log={automatic} />}
    </div>
  );
}
