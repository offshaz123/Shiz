import type { Metadata } from "next";
import { currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { StaffManager } from "@/components/StaffManager";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { listActivity, listSittings, listStaff, staffTallies } from "@/lib/staff";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Team",
  robots: { index: false, follow: false },
};

/**
 * The people who work here, what each of them can open, and what they did.
 *
 * Owner only, and not by hiding the link: a member of staff who could reach
 * this page could grant themselves the clients page, which would make every
 * other switch on it decorative.
 *
 * The activity list is facts with times against them and no score. Walid
 * asked for a hint as to whether somebody is working or "mocking around",
 * and the honest form of that is the record itself — fourteen calls between
 * nine and one reads differently from two at half past four, and he is
 * better placed than any number here to say which was the right day.
 */
export default async function StaffPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (who.kind !== "owner") return <NotYours page="staff" />;

  const [staff, tallies, activity, sittings] = await Promise.all([
    listStaff(),
    staffTallies(),
    listActivity("everyone", 80),
    listSittings(40),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <AdminHeading title="Team">
        Who can sign in, what each of them can open, and everything that has been done.
      </AdminHeading>

      <div className="mt-8">
        {staff === null ? (
          <p className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
            No database connection, so accounts cannot be read or changed.
          </p>
        ) : (
          <StaffManager
            staff={staff}
            tallies={tallies ?? []}
            activity={activity ?? []}
            sittings={sittings ?? []}
          />
        )}
      </div>
    </main>
  );
}
