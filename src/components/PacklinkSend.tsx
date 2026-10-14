"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Sends (or re-sends) an order to Packlink from the admin order page.
export function PacklinkSend({ orderRef, sent }: { orderRef: string; sent: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    if (sent && !window.confirm("This order is already in Packlink. Send it again as a new draft?")) return;
    setBusy(true);
    setNote(null);
    const res = await fetch(`/api/admin/orders/${orderRef}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "packlink" }),
    }).catch(() => null);
    const json = await res?.json().catch(() => ({}));
    setBusy(false);
    setNote(res?.ok ? { ok: true, text: json.message } : { ok: false, text: json?.error ?? "Something went wrong. Please try again." });
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button type="button" className="btn btn-white w-full" onClick={send} disabled={busy}>
        {busy ? "Sending…" : sent ? "Send to Packlink again" : "Send to Packlink"}
      </button>
      {note && (
        <p role="status" className={`mt-2 text-sm font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>
          {note.text}
        </p>
      )}
    </div>
  );
}
