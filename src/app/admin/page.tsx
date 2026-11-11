import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./LoginForm";
import { getCronHealth } from "@/lib/admin-data";
import { getEngineRoom } from "@/lib/engine-room";
import { EngineRoom } from "@/components/EngineRoom";
import { SchedulerStatus } from "@/components/SchedulerStatus";

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
  if (!(await isAdmin())) return <LoginForm />;

  const [engine, cron] = await Promise.all([getEngineRoom(), getCronHealth()]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      {engine ? (
        <EngineRoom engine={engine} />
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
          No database connection, so there is nothing to show here. The system check will say why.
        </p>
      )}
      {cron && <SchedulerStatus cron={cron} />}
    </div>
  );
}
