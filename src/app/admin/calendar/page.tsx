import type { Metadata } from "next";
import Link from "next/link";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { CalendarMonth } from "@/components/CalendarMonth";
import { teamDiary } from "@/lib/team-calendar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendar",
  robots: { index: false, follow: false },
};

/**
 * The team's month.
 *
 * Everything dated that somebody has to do was already being recorded;
 * none of it was anywhere you could see a week at a time. A promise to
 * ring back lived on a prospect row, an invoice falling due lived on a
 * client, and the day the automatic follow-ups go out lived nowhere at
 * all — a cron worked it out at four in the morning and told nobody.
 *
 * So one month with all three on it. Nothing new to fill in: a call-back
 * appears because somebody typed a day and a time into the box after a
 * call, which they already had to do.
 *
 * A member of staff sees their own promises and their own countries.
 * The owner sees everybody's, plus the money, because chasing an
 * invoice is not a caller's job.
 */
export default async function CalendarPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "calendar")) return <NotYours page="calendar" />;

  const everyone = who.kind === "owner";
  const items = await teamDiary({
    regions: who.regions,
    staffId: everyone ? null : who.id,
  });

  // Worked out on the server so the grid, the banner and the database
  // agree about what day it is. A browser in another time zone deciding
  // for itself is how a call-back ends up on the wrong square.
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const stamp = `${today} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <AdminHeading title="Calendar">
        {everyone
          ? "Everything the team has promised to do, by the day it was promised for."
          : "What you have promised to do, by the day you promised it for."}
      </AdminHeading>

      {items === null ? (
        <p className="mt-6 rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-muted">
          No database connection, so the calendar cannot be read.
        </p>
      ) : (
        <CalendarMonth items={items} today={today} now={stamp} everyone={everyone} />
      )}

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Call-backs come from the box you fill in after a call, on{" "}
        <Link href="/admin/prospects" className="underline hover:text-brand-pink">
          Who to call
        </Link>
        . Choose &ldquo;Asked to call back&rdquo;, give it a day and a time, and it lands here. A
        reminder appears across the top of every page when one falls due.
      </p>
    </div>
  );
}
