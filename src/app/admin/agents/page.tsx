import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { Office } from "@/components/Office";
import { getOffice } from "@/lib/office";
import { isRegion } from "@/lib/regions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI agents",
  robots: { index: false, follow: false },
};

/**
 * The automatic jobs, as a room with people in it.
 *
 * The same facts are on the overview page as a row of tiles, and tiles
 * are easy to stop reading. A desk with somebody asleep at it is not:
 * you see it from the other side of the room and you want to know why.
 * That is the whole argument for this page, and it only holds as long
 * as the picture is honest — so what each figure is doing is decided by
 * what the job behind it is really doing, and every number under them
 * is counted from the database.
 */
export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "agents")) return <NotYours page="agents" />;

  // Carried in the address, like the overview, so the server fetches the
  // right numbers rather than the page filtering them afterwards.
  const asked = (await searchParams).region;
  const picked = isRegion(asked) && who.regions.includes(asked) ? asked : undefined;

  const office = await getOffice(picked);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <AdminHeading title="AI agents">
        The jobs that run without anybody pressing anything, drawn as the room they would be in
        if they were people. Press one to see what it has done.
      </AdminHeading>

      <div className="mt-6">
        <Office office={office} />
      </div>
    </main>
  );
}
