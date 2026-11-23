import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminNav } from "@/components/AdminNav";
import { ADMIN_PAGES } from "@/lib/admin-pages";

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

  return (
    <>
      {who && <AdminNav pages={pages} who={who.name} />}
      {children}
    </>
  );
}
