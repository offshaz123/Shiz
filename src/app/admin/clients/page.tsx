import type { Metadata } from "next";
import { canSee, currentUser } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { NotYours } from "../NotYours";
import { markPageSeen } from "@/lib/whats-new";
import { ClientManager } from "@/components/ClientManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clients",
  robots: { index: false, follow: false },
};

export default async function AdminClientsPage() {
  const who = await currentUser();
  if (!who) return <LoginForm />;
  if (!canSee(who, "clients")) return <NotYours page="clients" />;
  await markPageSeen(who.id, "clients");

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <AdminHeading title="Clients">
        The businesses who pay us, their logins, and what they spent on advertising. This is the
        only place their figures can be changed.
      </AdminHeading>

      <div className="mt-6">
        <ClientManager />
      </div>
    </div>
  );
}
