import type { ClientLead, ClientSummary, MonthPoint } from "@/lib/clients";
import { LeadList } from "./LeadList";

/**
 * What a client sees about their own marketing.
 *
 * Four figures, and they are the four on purpose: how many enquiries and
 * from where, what each cost, how many became customers, and how long
 * people waited for an answer. No impressions, no reach, no click-through
 * rate — not because they are fake, but because they are the wrong altitude
 * for the person deciding whether to keep spending.
 *
 * Nothing here can reach a campaign, a keyword, an audience or another
 * client. That is a property of the queries behind it rather than of this
 * component: there is no code path from a client session to any of it.
 *
 * Honest about gaps rather than filling them. A cost per enquiry with no
 * spend recorded shows as "not recorded yet", because an unknown cost is
 * not £0 and a dashboard that rounds the difference away is one you stop
 * trusting the moment you notice.
 */

const SOURCE_LABEL: Record<string, string> = {
  google: "Google Ads",
  "google-ads": "Google Ads",
  meta: "Facebook & Instagram",
  facebook: "Facebook & Instagram",
  instagram: "Instagram",
  organic: "Found you on Google",
  maps: "Google Maps listing",
  website: "Your website",
  referral: "Referral",
  phone: "Phone",
};

function money(amount: number): string {
  return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthName(iso: string): string {
  const at = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Hours read badly past a day or two, which is exactly where it matters. */
function waited(hours: number): string {
  if (hours < 1) return "under an hour";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function Tile({
  label,
  value,
  note,
  tone = "plain",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "plain" | "quiet";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={`mt-1.5 text-3xl font-bold leading-none ${
          tone === "quiet" ? "text-muted" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-muted">{note}</p>
    </div>
  );
}

export function ClientDashboard({
  summary,
  trend,
  leads,
  isSample = false,
}: {
  summary: ClientSummary;
  trend: MonthPoint[];
  leads: ClientLead[];
  /** True when there is nothing real yet and these are example figures. */
  isSample?: boolean;
}) {
  const busiest = Math.max(1, ...trend.map((m) => m.leads));
  const unanswered = summary.leads - summary.answered;

  return (
    <div className="flex flex-col gap-6">
      {/* Before any figure is readable, not after.
          The danger with example data is somebody taking it for their own,
          screenshotting it or quoting it back, and a note at the bottom of
          a long page does not prevent that. This sits above everything. */}
      {isSample && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 px-5 py-4">
          <p className="text-sm font-bold text-foreground">
            These are example figures, not yours.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Your campaigns have not sent us any enquiries yet, so this is a preview of what the
            page will show once they do. Every number and name below is made up.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Enquiries"
          value={String(summary.leads)}
          note={monthName(summary.month)}
        />
        <Tile
          label="Cost per enquiry"
          value={summary.costPerLead === null ? "—" : money(summary.costPerLead)}
          tone={summary.costPerLead === null ? "quiet" : "plain"}
          note={
            summary.costPerLead === null
              ? "No ad spend recorded for this month yet"
              : `${money(summary.spend)} of advertising`
          }
        />
        <Tile
          label="Became customers"
          value={String(summary.customers)}
          note={
            summary.leads > 0
              ? `${Math.round((summary.customers / summary.leads) * 100)}% of enquiries`
              : "Nothing to measure yet"
          }
        />
        <Tile
          label="Typical reply time"
          value={summary.medianHoursToReply === null ? "—" : waited(summary.medianHoursToReply)}
          tone={summary.medianHoursToReply === null ? "quiet" : "plain"}
          note={
            summary.medianHoursToReply === null
              ? "Nothing marked as answered yet"
              : unanswered > 0
                ? `${unanswered} still waiting for a reply`
                : "Everything has been answered"
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Where your enquiries came from</h2>
          <p className="mt-0.5 text-xs text-muted">{monthName(summary.month)}</p>

          {summary.bySource.length === 0 ? (
            <p className="mt-5 text-sm text-muted">No enquiries recorded this month yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2.5">
              {summary.bySource.map((row) => {
                const share = summary.leads > 0 ? (row.leads / summary.leads) * 100 : 0;
                return (
                  <li key={row.source} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-xs text-muted">
                      {SOURCE_LABEL[row.source] ?? row.source}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                      <span
                        className="block h-full rounded-full bg-series-1"
                        style={{ width: `${Math.max(share, row.leads > 0 ? 2 : 0)}%` }}
                      />
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted">
                      <b className="font-semibold text-foreground">{row.leads}</b>{" "}
                      {Math.round(share)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Enquiries by month</h2>
          <p className="mt-0.5 text-xs text-muted">The last six months.</p>

          {trend.length === 0 ? (
            <p className="mt-5 text-sm text-muted">Not enough history yet.</p>
          ) : (
            <>
              <div className="mt-4 flex items-end gap-2">
                {trend.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold tabular-nums text-foreground">
                      {m.leads}
                    </span>
                    <div className="flex h-24 w-full flex-col justify-end">
                      <span
                        className="w-full rounded-t bg-series-1"
                        style={{ height: `${(m.leads / busiest) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted">
                      {monthName(m.month).slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>

              <details className="mt-4 border-t border-border pt-3">
                <summary className="cursor-pointer text-xs font-medium text-muted hover:text-foreground">
                  Show as a table
                </summary>
                <table className="mt-3 w-full text-left text-xs">
                  <thead>
                    <tr className="text-muted">
                      <th scope="col" className="py-1 font-medium">Month</th>
                      <th scope="col" className="py-1 text-right font-medium">Enquiries</th>
                      <th scope="col" className="py-1 text-right font-medium">Customers</th>
                      <th scope="col" className="py-1 text-right font-medium">Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {trend.map((m) => (
                      <tr key={m.month}>
                        <td className="py-1.5 text-foreground">{monthName(m.month)}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">{m.leads}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">{m.customers}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted">
                          {m.spend > 0 ? money(m.spend) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Your enquiries</h2>
          <p className="mt-0.5 text-xs text-muted">
            Newest first. Mark one answered and move it along as you go — that is where the
            customer count and the reply time above come from.
          </p>
        </div>

        <LeadList leads={leads} readOnly={isSample} />
      </section>

      {isSample && (
        <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
          <b className="text-foreground">Your live data will show here soon.</b> As soon as the
          first real enquiry comes in, everything above is replaced by your own figures and the
          examples disappear for good.
        </p>
      )}
    </div>
  );
}
