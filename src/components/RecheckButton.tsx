"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Runs the status checks again now instead of waiting for the next one.
export function RecheckButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className="rounded-md border border-line bg-white px-2 py-1 font-semibold text-ink"
      onClick={async (e) => {
        e.preventDefault();
        setBusy(true);
        await fetch("/api/admin/health", { method: "POST" }).catch(() => {});
        router.refresh();
        setBusy(false);
      }}
    >
      {busy ? "Checking…" : "Check again"}
    </button>
  );
}
