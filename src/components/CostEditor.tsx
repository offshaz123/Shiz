"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Costs = Record<string, number>;

// The material prices form on Admin → Costs.
export function CostEditor({ costs, labels }: { costs: Costs; labels: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(Object.entries(costs).map(([k, v]) => [k, String(v)])));
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/costs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ costs: values, date }) });
      const data = await res.json().catch(() => ({}));
      setNote({ ok: res.ok, text: data.message ?? data.error ?? "Something went wrong" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(costs).map((k) => (
          <label key={k} className="block text-sm font-semibold">
            {labels[k]}
            <span className="mt-1 flex items-center gap-1">
              £<input className="field" inputMode="decimal" value={values[k]} onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))} />
            </span>
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm font-semibold">
          These prices apply from
          <input type="date" className="field mt-1" value={date} onChange={(e) => setDate(e.target.value)} />
          <span className="mt-1 block text-xs font-normal text-muted">Leave empty for today. Pick an earlier date if your supplier changed then.</span>
        </label>
        <button type="button" className="btn btn-gold" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save prices"}
        </button>
      </div>
      {note && <p className={`mt-3 text-sm font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{note.text}</p>}
    </div>
  );
}
