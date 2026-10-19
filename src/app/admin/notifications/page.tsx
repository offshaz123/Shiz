import { AdminShell } from "@/components/AdminShell";
import { PushSetup } from "@/components/PushSetup";
import { fmtDateTime, requireAdmin } from "@/lib/admin";
import { listPushSubscriptions } from "@/lib/push";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requireAdmin();
  const devices = await listPushSubscriptions();
  return (
    <AdminShell active="notifications">
      <h2 className="font-display text-2xl font-bold">New order notifications</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Your phone pings the moment an order is paid, like a message. Turn it on once on each phone (or computer) you want it on.
      </p>
      <div className="mt-6">
        <PushSetup devices={devices.map((d) => ({ id: d.id, label: d.label, added: fmtDateTime(d.created_at) }))} />
      </div>
    </AdminShell>
  );
}
