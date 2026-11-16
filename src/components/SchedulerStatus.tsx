import type { CronHealth } from "@/lib/admin-data";

/**
 * Whether the follow-up scheduler is alive.
 *
 * Sits at the top of the page and says so in plain words, because the
 * failure this is here to catch is a silent one: the cron job was sitting in
 * hPanel on a perfectly sensible daily schedule, the endpoint was healthy,
 * the secret was set, and not one follow-up had gone out in a week. Nothing
 * on this page said anything was wrong, because nothing on this page was
 * looking.
 *
 * It is deliberately loud when the job hasn't run and quiet when it has.
 */
export function SchedulerStatus({ cron }: { cron: CronHealth }) {
  const neverRun = cron.lastRunAt === null;
  const stale = cron.hoursSince !== null && cron.hoursSince >= 48;
  // The job ran, so nothing above fires — but it refused to send anything
  // because it could not read the inbox to see who had already replied. That
  // is a frozen pipeline wearing a healthy scheduler's clothes.
  const held = cron.lastDetail?.startsWith("inbox unreadable") ?? false;

  if (!neverRun && !stale && held) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-500/50 bg-amber-500/5 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Prospect follow-ups are being held back
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The daily job is running, but it cannot read the inbox to check who has already
          replied — so it is sending nothing rather than risk a follow-up landing under
          somebody&apos;s answer. {cron.lastDetail}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          That is an IMAP problem on the mailbox: the host, the password, or the port. Audit
          follow-ups to leads are unaffected and still going out.
        </p>
      </div>
    );
  }

  if (neverRun || stale) {
    return (
      <div className="mt-8 rounded-2xl border border-red-500/50 bg-red-500/5 p-5">
        <h2 className="text-sm font-semibold text-foreground">
          Follow-up emails are not being sent automatically
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {neverRun
            ? "The daily job has never reported finishing a run. Day 1, 3 and 6 emails will only go out when you press the buttons on a lead below."
            : `The daily job last finished ${cron.hoursSince} hours ago. It should run every day.`}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Check the cron job in hPanel under Advanced → Cron Jobs. The two things that break
          it are the script path being wrong and CRON_SECRET missing from the file the cron
          reads, which is not necessarily the same place the website reads it from.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-foreground">Follow-up scheduler</h2>
        <span className="text-xs text-muted">
          {cron.hoursSince === 0 ? "ran within the hour" : `ran ${cron.hoursSince}h ago`}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {cron.runsLast7Days} {cron.runsLast7Days === 1 ? "run" : "runs"} in the last 7 days,{" "}
        {cron.sentLast7Days} {cron.sentLast7Days === 1 ? "email" : "emails"} sent.
      </p>
    </div>
  );
}
