import type { Metadata } from "next";
import { currentClient } from "@/lib/client-auth";
import { listUpcoming } from "@/lib/bookings";
import { ClientCalendar } from "@/components/ClientCalendar";
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

  const upcoming = await listUpcoming(client.id);

  return (
    <div className="mx-auto max-w-4xl px-5 py-7 sm:px-8 lg:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Your diary
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Every job booked in. We email you the night before, and a list of the day each morning.
        </p>
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
