"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// For plates the customer collected, or that were delivered by hand: marks the
// order delivered and emails the customer. Asks first, since it sends an email.
export function HandOverButton({ orderRef, email, docsMissing, short = false }: { orderRef: string; email: string; docsMissing: boolean; short?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="rounded-lg bg-[#1f7a3d] px-3 py-1.5 text-xs font-semibold text-white"
        onClick={async () => {
          const warn = docsMissing ? "\n\nThis order is still missing its documents." : "";
          if (!confirm(`Mark as handed over (collected or delivered by hand)? ${email} will get an email saying they've received their plates.${warn}`)) return;
          setBusy(true);
          const res = await fetch(`/api/admin/orders/${orderRef}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "handed-over" }) }).catch(() => null);
          const data = await res?.json().catch(() => ({}));
          setNote({ ok: Boolean(res?.ok), text: data?.message ?? data?.error ?? "Something went wrong" });
          setBusy(false);
          router.refresh();
        }}
      >
        {busy ? "Saving…" : short ? "🤝 Handed over" : "🤝 Handed over (collected / by hand)"}
      </button>
      {note && <span className={`text-xs font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{note.text}</span>}
    </span>
  );
}
