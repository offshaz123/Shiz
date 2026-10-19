"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Doc = { id: number; kind: string; filename: string; mime: string; uploaded: string };

const REASONS = [
  "The photo is too blurry to read. Please take it again in good light.",
  "Part of the document is cut off. Please make sure the whole page is in the photo.",
  "The name on your ID doesn't match the name on the V5C.",
  "The registration on the document doesn't match your order.",
  "That isn't one of the documents we can accept. Please send your V5C logbook (or new keeper slip, V750 or V778) and your driving licence, passport or a recent utility bill.",
];

const label = (kind: string) => (kind === "entitlement" ? "Proof of entitlement (V5C etc.)" : kind === "identity" ? "Photo ID" : "Document");

// The order's V5C and ID side by side, with "Documents OK" and "Ask for a new photo".
export function DocsChecker({ orderRef, status, docs }: { orderRef: string; status: string; docs: Doc[] }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function act(action: string, extra: Record<string, string> = {}) {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderRef}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      setNote({ ok: res.ok, text: data.message ?? data.error ?? "Something went wrong" });
      if (res.ok) {
        setAsking(false);
        setReason("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  // The newest upload of each kind; earlier ones (e.g. a blurry first try) are listed underneath.
  const latest = [...new Map(docs.map((d) => [d.kind, d])).values()];
  const older = docs.filter((d) => !latest.includes(d));

  if (status === "not_needed") return <p className="text-sm text-muted">Show plates only, so no documents needed.</p>;

  return (
    <div>
      {docs.length === 0 ? (
        <p className="text-sm font-semibold text-[#b42318]">
          No documents yet. Don&apos;t make road-legal plates until the customer uploads them. They get an automatic reminder a day after
          paying, and another after three days.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {latest.map((d) => (
            <a key={d.id} href={`/api/admin/documents/${d.id}`} target="_blank" className="block rounded-xl border border-line bg-surface p-2">
              {d.mime.startsWith("image/") && !/heic|heif/.test(d.mime) ? (
                // eslint-disable-next-line @next/next/no-img-element -- private admin file, not for the image optimiser
                <img src={`/api/admin/documents/${d.id}`} alt={label(d.kind)} className="h-48 w-full rounded-lg bg-white object-contain" />
              ) : (
                <span className="flex h-48 items-center justify-center rounded-lg bg-white text-sm font-semibold text-gold underline">
                  Open {d.mime === "application/pdf" ? "PDF" : "file"}
                </span>
              )}
              <span className="mt-2 block text-sm font-semibold">{label(d.kind)}</span>
              <span className="block text-xs text-muted">
                {d.filename} · {d.uploaded}
              </span>
            </a>
          ))}
        </div>
      )}

      {older.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Earlier uploads:{" "}
          {older.map((d, i) => (
            <span key={d.id}>
              {i > 0 && ", "}
              <a href={`/api/admin/documents/${d.id}`} target="_blank" className="underline">
                {label(d.kind)} ({d.uploaded})
              </a>
            </span>
          ))}
        </p>
      )}

      {status === "approved" && <p className="mt-3 text-sm font-semibold text-[#1f7a3d]">✓ You&apos;ve checked these documents.</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {docs.length > 0 && status !== "approved" && (
          <button type="button" disabled={busy} className="rounded-lg bg-[#1f7a3d] px-4 py-2 text-sm font-semibold text-white" onClick={() => act("docs-approve")}>
            ✓ Documents OK
          </button>
        )}
        {docs.length > 0 && (
          <button type="button" disabled={busy} className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => setAsking((a) => !a)}>
            Ask for a new photo
          </button>
        )}
        {docs.length === 0 && (
          <button type="button" disabled={busy} className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => act("docs-remind")}>
            Email a reminder now
          </button>
        )}
      </div>

      {asking && (
        <div className="mt-3 rounded-xl border border-line bg-surface p-3">
          <p className="text-sm font-semibold">What&apos;s wrong? The customer sees this in the email.</p>
          <div className="mt-2 grid gap-1.5">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={reason === r}
                className={`rounded-lg border px-3 py-2 text-left text-sm ${reason === r ? "border-[#b8901f] bg-gold-soft" : "border-line bg-white"}`}
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            className="field mt-2 min-h-20 text-sm"
            placeholder="Or write your own reason"
            value={reason}
            maxLength={400}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            type="button"
            disabled={busy || !reason.trim()}
            className="btn btn-gold mt-2 w-full"
            onClick={() => act("docs-retake", { reason })}
          >
            {busy ? "Sending…" : "Email the customer"}
          </button>
        </div>
      )}

      {note && <p className={`mt-3 text-sm font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{note.text}</p>}
    </div>
  );
}
