import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

const CHANNEL_LABELS: Record<string, string> = {
  web_form: "Website form",
  phone_call: "Phone call",
  whatsapp: "WhatsApp",
  walk_in: "Walk-in",
  chat_bot: "AI chat",
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  booked: "Booked",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  labels,
}: {
  title: string;
  rows: { key: string; count: number }[];
  labels?: Record<string, string>;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted">No data yet.</p>}
        {rows.map((row) => (
          <div key={row.key}>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{labels?.[row.key] ?? row.key}</span>
              <span>{row.count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-2">
              <div
                className="brand-gradient-bg h-2 rounded-full"
                style={{ width: `${Math.max(4, (row.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-xl font-bold text-foreground">Database not configured</h1>
        <p className="mt-2 text-sm text-muted">
          {error instanceof Error ? error.message : "Couldn't connect to the database."} See the README for the
          Hostinger MySQL environment variables this admin panel needs.
        </p>
      </div>
    );
  }

  const trendMax = Math.max(1, ...stats.dailyTrend.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">A live view of enquiries and channels.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total enquiries" value={stats.totalEnquiries} />
        <StatTile label="New this week" value={stats.newThisWeek} />
        <StatTile label="Booked" value={stats.booked} />
        <StatTile label="AI chat sessions (legacy)" value={stats.chatSessions} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownList
          title="Enquiries by channel"
          rows={stats.byChannel.map((r) => ({ key: r.channel, count: r.count }))}
          labels={CHANNEL_LABELS}
        />
        <BreakdownList
          title="Enquiries by status"
          rows={stats.byStatus.map((r) => ({ key: r.status, count: r.count }))}
          labels={STATUS_LABELS}
        />
        <BreakdownList title="Enquiries by service" rows={stats.byService.map((r) => ({ key: r.service, count: r.count }))} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-foreground">Enquiries — last 14 days</h3>
        <div className="mt-6 flex h-32 items-end gap-1.5">
          {stats.dailyTrend.length === 0 && <p className="text-sm text-muted">No enquiries yet.</p>}
          {stats.dailyTrend.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="brand-gradient-bg w-full rounded-t"
                style={{ height: `${Math.max(4, (d.count / trendMax) * 100)}%` }}
                title={`${d.day}: ${d.count}`}
              />
              <span className="text-[10px] text-muted">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent enquiries</h3>
          <Link href="/admin/enquiries" className="text-sm font-semibold text-brand-pink hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-4 divide-y divide-border">
          {stats.recentEnquiries.length === 0 && <p className="py-4 text-sm text-muted">No enquiries yet.</p>}
          {stats.recentEnquiries.map((enquiry) => (
            <div key={enquiry.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{enquiry.name}</p>
                <p className="text-xs text-muted">
                  {CHANNEL_LABELS[enquiry.channel]} · {enquiry.service_category || "No service specified"}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted">
                {STATUS_LABELS[enquiry.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
