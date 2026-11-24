import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminNav } from "@/components/AdminNav";
import { ADMIN_PAGES } from "@/lib/admin-pages";
import { openSitting, touchSitting } from "@/lib/staff";
import { ShiftBar } from "@/components/ShiftBar";
import { isConnected } from "@/lib/zadarma";
import { whatsNew } from "@/lib/whats-new";

/**
 * The bar across every admin page.
 *
 * Here rather than on each page: every page used to carry its own handful of
 * links back to the others, so the way out depended on which page you were
 * on, and a new page meant editing four files before anybody could reach it.
 *
 * Hidden when signed out, because the login screen should offer exactly one
 * thing to do.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const who = await currentUser();
  // The bar only offers what this person is allowed to open. The pages
  // check for themselves as well — a link that is not drawn is not a lock.
  const pages = ADMIN_PAGES.filter((page) => canSee(who, page.key));

  // Still here. One indexed UPDATE per page load, which is what turns
  // "signed in at nine" into "signed in at nine and still on it at one".
  if (who) await touchSitting(who.id);

  // What has arrived since this person last opened each page.
  const counts = who ? await whatsNew(who.id) : {};

  // The shift bar is for somebody who makes calls. Drawn when the phone
  // system is connected and this person has an extension, which is the
  // same test the Call button uses — one answer, two places.
  const sitting = who?.extension && isConnected() ? await openSitting(who.id) : null;

  return (
    <>
      {who && <AdminNav pages={pages} who={who.name} counts={counts} />}
      {who && sitting && (
        <div className="lg:pl-60">
          <ShiftBar name={who.name} signedInAt={sitting} />
        </div>
      )}
      {/* Room for the column, which is fixed so it does not scroll away. */}
      <div className={who ? "lg:pl-60" : undefined}>{children}</div>
    </>
  );
}
