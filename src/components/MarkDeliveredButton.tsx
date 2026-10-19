"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// For parcels Packlink doesn't track (e.g. sent another way): mark them delivered by hand.
export function MarkDeliveredButton({ orderRef }: { orderRef: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold"
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/admin/orders/${orderRef}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delivered" }) }).catch(() => {});
        router.refresh();
        setBusy(false);
      }}
    >
      {busy ? "Saving…" : "Mark as delivered"}
    </button>
  );
}
