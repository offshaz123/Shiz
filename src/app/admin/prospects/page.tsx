import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { ProspectFinder } from "@/components/ProspectFinder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who to call",
  robots: { index: false, follow: false },
};

/**
 * The call list.
 *
 * Unlike the scanner page, this one is NOT for showing a customer: it holds
 * other businesses' details and notes on what they said about us. Keep it on
 * your own screen.
 */
export default async function AdminProspectsPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "prospects")) return <NotYours page="prospects" />;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <AdminHeading title="Who to call">
        Keep this one to yourself. It has other businesses on it.
      </AdminHeading>

      <div className="mt-8">
        <ProspectFinder />
      </div>
    </div>
  );
}
