"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/plates";

type Row = {
  id: string;
  name: string;
  pair: number;
  single: number;
  original: { pair: number; single: number };
  upcoming: { id: number; day: string; pair: string; single: string; rise: boolean }[];
};

const pounds = (p: number) => (p / 100).toFixed(2);

function StyleRow({ row }: { row: Row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pair, setPair] = useState(pounds(row.pair));
  const [single, setSingle] = useState(pounds(row.single));
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/admin/prices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      setNote({ ok: res.ok, text: data.message ?? data.error ?? "Something went wrong" });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xl font-bold">{row.name}</p>
          <p className="text-sm">
            <strong>{money(row.pair)}</strong> a pair · <strong>{money(row.single)}</strong> single
          </p>
        </div>
        <button type="button" className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Change price"}
        </button>
      </div>

      {row.upcoming.map((u) => (
        <div key={u.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#fdf8e7] px-3 py-2 text-sm">
          <span>
            Changes to <strong>{u.pair}</strong> a pair · <strong>{u.single}</strong> single on <strong>{u.day}</strong>
            {u.rise && <span className="block text-xs text-[#b42318]">Customers are being shown &ldquo;goes up to {u.pair} on {u.day}&rdquo;.</span>}
          </span>
          <button
            type="button"
            disabled={busy}
            className="text-sm font-semibold text-[#b42318] underline"
            onClick={() => {
              if (u.rise && !confirm(`Customers have been told this price goes up on ${u.day}. Cancel it anyway?`)) return;
              send({ action: "cancel", id: u.id });
            }}
          >
            Cancel
          </button>
        </div>
      ))}

      {open && (
        <div className="mt-4 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-4 sm:items-end">
          <label className="block text-sm font-semibold">
            Pair (£)
            <input className="field mt-1" inputMode="decimal" value={pair} onChange={(e) => setPair(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            Single (£)
            <input className="field mt-1" inputMode="decimal" value={single} onChange={(e) => setSingle(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">
            When
            <input className="field mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <span className="mt-1 block text-xs font-normal text-muted">{date ? "Changes at midnight that day" : "Empty = change now"}</span>
          </label>
          <button type="button" disabled={busy} className="btn btn-gold" onClick={() => send({ style: row.id, pair, single, date })}>
            {busy ? "Saving…" : date ? "Schedule" : "Change now"}
          </button>
          <p className="text-xs text-muted sm:col-span-4">
            Original prices: {money(row.original.pair)} pair · {money(row.original.single)} single.
          </p>
        </div>
      )}
      {note && <p className={`mt-2 text-sm font-semibold ${note.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{note.text}</p>}
    </li>
  );
}

export function PriceEditor({ rows }: { rows: Row[] }) {
  return (
    <ul className="mt-6 grid gap-4 lg:grid-cols-2">
      {rows.map((r) => (
        <StyleRow key={r.id} row={r} />
      ))}
    </ul>
  );
}
