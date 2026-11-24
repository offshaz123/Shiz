import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";
import { NotYours } from "./NotYours";
import { getAutomaticEmails, getCronHealth, getRegionStats } from "@/lib/admin-data";
import { getEngineRoom } from "@/lib/engine-room";
import { EngineRoom } from "@/components/EngineRoom";
import { SchedulerStatus } from "@/components/SchedulerStatus";
import Link from "next/link";
import { RegionStats } from "@/components/RegionStats";
import { REGION_INFO, isRegion } from "@/lib/regions";
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
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "overview")) return <NotYours page="overview" />;

  // Which country the whole page is about, carried in the address so the
  // server can fetch the right numbers. It used to be state inside the
  // tiles, which meant pressing United States changed eight numbers and
  // left every figure below them British — the bug Walid found.
  const asked = (await searchParams).region;
  const picked = isRegion(asked) && who.regions.includes(asked) ? asked : undefined;

  const [engine, cron, finder, automatic, byRegion] = await Promise.all([
    getEngineRoom(picked),
    getCronHealth(),
    getCronHealth("find-and-scan"),
    // Only the three counts are wanted here now, so the list is short.
    getAutomaticEmails(1, picked),
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
      <div id="scheduler" className="scroll-mt-6">
        {cron && <SchedulerStatus cron={cron} finder={finder} />}
      </div>

      {picked && (
        <p className="rounded-xl border border-brand-pink/40 bg-brand-pink/5 px-4 py-2.5 text-xs text-foreground">
          Showing <b>{REGION_INFO[picked].name}</b> only. The scheduler above runs one job for
          both countries, and website enquiries are not split by country — everything else on
          this page is {REGION_INFO[picked].label} figures.
        </p>
      )}

      {/* Both markets, with a switch. Above the engine room because "how
          is each country doing" is the question this page gets opened
          for, and the machinery below it is the answer to why. */}
      <div id="pipeline" className="scroll-mt-6">
        {byRegion && <RegionStats rows={byRegion} regions={who.regions} picked={picked} />}
      </div>

      {engine ? (
        <EngineRoom engine={engine} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          No database connection, so there is nothing to show here. The system check will say why.
        </p>
      )}

      {/* The full list of everything sent has moved to its own page.
          It was the third long section on an overview, and the only way
          to answer "how many went today" was to count the rows or read
          a line off a chart. One line and a link is what an overview
          owes it. */}
      {automatic && (
        <div id="sent" className="scroll-mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-foreground">
            {automatic.sentToday} email{automatic.sentToday === 1 ? "" : "s"} sent today,{" "}
            {automatic.sentLast7Days} in the last seven days
            {automatic.failedLast7Days > 0
              ? `, ${automatic.failedLast7Days} failed to send`
              : ""}
            .
          </p>
          <Link
            href="/admin/emails"
            className="mt-2 inline-block text-xs font-semibold text-brand-pink underline decoration-dotted"
          >
            Open the mailbox: everything sent, and who has written back
          </Link>
        </div>
      )}
    </div>
  );
}
