import type { AutomaticEmailLog } from "@/lib/admin-data";

/**
 * What the site has emailed on its own.
 *
 * Its own section because Walid asked to be able to see what is going out
 * without his hand on it, and because that genuinely was not visible
 * anywhere. The call list shows a prospect's own history one row at a time,
 * which answers "what did we send this business" and not "what did the site
 * send today".
 *
 * The three counts at the top are the whole point of it. The list below is
 * for reading one; the counts are for noticing that yesterday it sent eight
 * and today it sent none.
 *
 * Failures are shown, not hidden. A page that lists only successful sends
 * makes "nothing was due" and "the mail server refused everything" look the
 * same, and they are not remotely the same.
 */

const STEP_LABEL: Record<string, string> = {
  "outreach-1": "First email",
  "outreach-2": "Follow-up, day 3",
  "outreach-3": "Follow-up, day 5",
  "audit-1": "Audit follow-up, day 1",
  "audit-3": "Audit follow-up, day 3",
  "audit-6": "Audit follow-up, day 6",
};

function when(value: string): string {
  const at = new Date(value.replace(" ", "T"));
  if (Number.isNaN(at.getTime())) return value;
  return at.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AutomaticEmails({ log }: { log: AutomaticEmailLog }) {
  const { recent, sentToday, sentLast7Days, failedLast7Days } = log;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-foreground">Automatic emails sent</h2>
        <span className="text-xs text-muted">
          Everything the site sent without you pressing send
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{sentToday}</p>
          <p className="mt-0.5 text-xs text-muted">today</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-2xl font-bold tabular-nums text-foreground">{sentLast7Days}</p>
          <p className="mt-0.5 text-xs text-muted">last 7 days</p>
        </div>
        <div
          className={`rounded-xl border px-4 py-3 ${
            failedLast7Days > 0
              ? "border-red-500/50 bg-red-500/5"
              : "border-border bg-background"
          }`}
        >
          <p className="text-2xl font-bold tabular-nums text-foreground">{failedLast7Days}</p>
          <p className="mt-0.5 text-xs text-muted">failed, last 7 days</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Nothing has gone out automatically yet. The first emails send at 10:15 each morning,
          to businesses on the call list whose website has been scanned. Three a day to start
          with, rising slowly as the domain builds up a sending history.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-border">
          {recent.map((email) => (
            <li key={email.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {email.to}
              </span>
              <span className="text-xs text-muted">
                {STEP_LABEL[`${email.kind}-${email.step}`] ??
                  `${email.kind === "audit" ? "Audit follow-up" : "Outreach"}, step ${email.step}`}
              </span>
              {email.failed && (
                <span className="rounded-full border border-red-500/50 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-foreground">
                  failed
                </span>
              )}
              <span className="text-xs tabular-nums text-muted">{when(email.sentAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
