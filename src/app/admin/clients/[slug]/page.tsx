import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { canSee, currentUser } from "@/lib/admin-auth";
import {
  getAdminClient,
  getClientSummary,
  getClientTrend,
  listClientLeads,
} from "@/lib/clients";
import { listUpcoming } from "@/lib/bookings";
import { ClientDashboard } from "@/components/ClientDashboard";
import { ClientSettings } from "@/components/ClientSettings";
import { ClientLoginLink } from "@/components/ClientLoginLink";
import { LoginForm } from "../../LoginForm";
import { NotYours } from "../../NotYours";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client",
  robots: { index: false, follow: false },
};

/**
 * Everything about one client, in one place.
 *
 * The point of it is the top half: the same dashboard the client is looking
 * at, with the same figures, rendered from the same component. Before a call
 * you want to be looking at their screen, not at a different summary of the
 * same database that drifts away from theirs the first time one of the two
 * is changed.
 *
 * Read-only up there, deliberately. Marking their enquiries answered on
 * their behalf would put a reply time on their dashboard that nobody ever
 * replied in.
 *
 * The bottom half is the things only we can change — what a job is worth,
 * what they spent, what goes out automatically — which is why they live
 * behind an admin login rather than on the client's own page.
 */

/** "3 days ago" rather than a date, which is a sum before it is a fact. */
function ago(iso: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "";
  const days = Math.floor((Date.now() - at.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return "over a year ago";
}

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "clients")) return <NotYours page="clients" />;

  const { slug } = await params;
  const client = await getAdminClient(slug);
  if (!client) notFound();

  const [summary, trend, leads, upcoming] = await Promise.all([
    getClientSummary(client.id),
    getClientTrend(client.id),
    listClientLeads(client.id),
    listUpcoming(client.id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <Link
        href="/admin/clients"
        className="text-xs font-semibold text-muted hover:text-foreground"
      >
        ‹ All clients
      </Link>

      <div className="mt-4 flex flex-wrap items-start gap-4 border-b border-border pb-5">
        {client.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={client.logoUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl object-contain"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-lg font-bold text-muted">
            {client.name.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {client.name}
            </h1>
            {!client.isActive && (
              <span className="rounded-full border border-amber-500/50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                switched off
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            Signs in as <b className="font-semibold text-foreground">{client.slug}</b>
            {client.contactEmail && ` · ${client.contactEmail}`}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {client.lastLoginAt
              ? `Last signed in ${ago(client.lastLoginAt)}`
              : "Has never signed in — worth checking they got their password"}
            {" · "}
            {client.leads} enquir{client.leads === 1 ? "y" : "ies"} all time
            {!client.hasPassword && " · no password set"}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <ClientLoginLink slug={client.slug} name={client.name} />
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-foreground">What they see</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          Their own dashboard, exactly as it looks to them. Read-only here — marking an enquiry
          answered from this side would put a reply time on their page that nobody replied in.
        </p>

        <div className="mt-4">
          {summary ? (
            <ClientDashboard
              summary={summary}
              trend={trend ?? []}
              leads={leads ?? []}
              readOnly
            />
          ) : (
            <p className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
              Could not read their figures just now.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-foreground">Their diary</h2>
        <p className="mt-0.5 text-xs text-muted">The next two weeks of jobs they have booked in.</p>

        <div className="mt-3 rounded-2xl border border-border bg-surface">
          {!upcoming || upcoming.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">Nothing booked in.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((booking) => (
                <li key={booking.id} className="flex flex-wrap items-baseline gap-x-3 px-5 py-3">
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {new Date(`${booking.bookedOn}T00:00:00`).toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    {booking.startsAt && ` · ${booking.startsAt}`}
                  </span>
                  <span className="text-sm text-foreground">{booking.customerName}</span>
                  {booking.job && <span className="text-xs text-muted">{booking.job}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-foreground">Settings</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          The things only we can change. Text boxes save when you click away.
        </p>

        <div className="mt-4">
          <ClientSettings client={client} />
        </div>
      </section>
    </div>
  );
}
