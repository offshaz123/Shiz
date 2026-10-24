import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { isDbConfigured } from "@/lib/db";
import { getLeads, getStats, type AdminLead } from "@/lib/admin-data";
import { LoginForm } from "./LoginForm";
import { logout, saveNote, setContacted } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const SEQUENCE = [1, 3, 6];

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function when(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeadCard({ lead }: { lead: AdminLead }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{lead.name}</h3>
          <p className="mt-1 text-sm text-muted">{when(lead.createdAt)}</p>
        </div>
        <form action={setContacted}>
          <input type="hidden" name="id" value={lead.id} />
          <input type="hidden" name="contacted" value={lead.contacted ? "0" : "1"} />
          <button
            type="submit"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              lead.contacted
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {lead.contacted ? "Contacted" : "Mark contacted"}
          </button>
        </form>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <a href={`tel:${lead.phone}`} className="text-foreground hover:text-brand-pink">
          {lead.phone}
        </a>
        <a href={`mailto:${lead.email}`} className="break-all text-foreground hover:text-brand-pink">
          {lead.email}
        </a>
        <a
          href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
          target="_blank"
          rel="noreferrer noopener"
          className="break-all text-muted hover:text-foreground"
        >
          {lead.website}
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Only shown when it's true, because it's the one state that changes
            what you may do: an unsubscribed lead gets no more emails. */}
        {lead.unsubscribed && (
          <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
            Unsubscribed
          </span>
        )}

        {/* What the follow-up sequence has actually sent. Greyed means not yet
            sent — either it isn't due, or they never opted in, in which case
            it never will be. */}
        {SEQUENCE.map((step) => {
          const sent = lead.emailsSent.includes(step);
          return (
            <span
              key={step}
              title={sent ? `Day ${step} email sent` : `Day ${step} email not sent`}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                sent
                  ? "bg-brand-pink/15 text-brand-pink"
                  : "border border-border text-muted/60"
              }`}
            >
              Day {step}
            </span>
          );
        })}
      </div>

      <form action={saveNote} className="mt-4 flex flex-col gap-2">
        <input type="hidden" name="id" value={lead.id} />
        <textarea
          name="note"
          rows={2}
          defaultValue={lead.notes ?? ""}
          placeholder="Notes — what you said, when to call back"
          className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none"
        />
        <button
          type="submit"
          className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Save note
        </button>
      </form>
    </div>
  );
}

function NoDatabase() {
  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
      <h2 className="font-semibold text-foreground">No database connection</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {isDbConfigured()
          ? "The credentials are set but the connection failed. Check Runtime logs in hPanel for the error — the usual causes are a wrong password or DB_HOST set to localhost instead of 127.0.0.1."
          : "The database environment variables aren't set. Add DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASS in hPanel under Environment variables, then redeploy."}
      </p>
    </div>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const [stats, leads] = await Promise.all([getStats(), getLeads()]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
          >
            Log out
          </button>
        </form>
      </div>

      {!stats || !leads ? (
        <div className="mt-8">
          <NoDatabase />
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Total leads" value={stats.totalLeads} />
            <Stat label="Last 7 days" value={stats.leadsThisWeek} />
            <Stat label="Not yet contacted" value={stats.uncontacted} />
            <Stat label="Unsubscribed" value={stats.unsubscribed} />
            <Stat label="Page views, 7 days" value={stats.viewsThisWeek} />
          </div>

          {stats.topPages.length > 0 && (
            <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-sm font-semibold text-foreground">
                Most viewed pages, last 7 days
              </h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {stats.topPages.map((page) => (
                  <li key={page.path} className="flex justify-between gap-4 text-sm">
                    <span className="truncate text-muted">{page.path}</span>
                    <span className="shrink-0 font-semibold text-foreground">{page.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4">
            {leads.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
                Nobody has run a scan yet. They&apos;ll appear here as soon as they do.
              </p>
            ) : (
              leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </div>
        </>
      )}
    </div>
  );
}
