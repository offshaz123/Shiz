import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { getClientLogo } from "@/lib/clients";
import { listUpcoming } from "@/lib/bookings";
import { ClientCalendar } from "@/components/ClientCalendar";
import { PortalNav } from "@/components/PortalNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your diary",
  robots: { index: false, follow: false },
};

function when(day: string, time: string): string {
  const at = new Date(`${day}T12:00:00`);
  const label = Number.isNaN(at.getTime())
    ? day
    : at.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return time ? `${label}, ${time}` : label;
}

export default async function CalendarPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const [upcoming, logo] = await Promise.all([
    listUpcoming(client.id),
    getClientLogo(client.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          {/* Same mark as the dashboard, so moving between the two pages does
              not look like leaving their system. */}
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-contain"
            />
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Your diary
            </h1>
            <p className="mt-1 text-sm text-muted">
              Every job booked in. We email you the night before and a list each morning.
            </p>
          </div>
        </div>
        <PortalNav />
      </div>

      <div className="mt-6">
        <InstallPrompt />
      </div>

      <div className="mt-5">
        <ClientCalendar />
      </div>

      {upcoming && upcoming.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Coming up</h2>
          <p className="mt-0.5 text-xs text-muted">The next fortnight, in order.</p>
          <ul className="mt-3 divide-y divide-border">
            {upcoming.map((job) => (
              <li key={job.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                <span className="text-xs font-semibold tabular-nums text-muted">
                  {when(job.bookedOn, job.startsAt)}
                </span>
                <span className="text-sm font-medium text-foreground">{job.customerName}</span>
                {job.job && <span className="text-xs text-muted">{job.job}</span>}
                {job.phone && (
                  <a href={`tel:${job.phone}`} className="ml-auto text-xs font-semibold text-brand-pink">
                    {job.phone}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
