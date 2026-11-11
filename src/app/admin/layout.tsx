import { isAdmin } from "@/lib/admin-auth";
import { AdminNav } from "@/components/AdminNav";

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
  const signedIn = await isAdmin();

  return (
    <>
      {signedIn && <AdminNav />}
      {children}
    </>
  );
}
