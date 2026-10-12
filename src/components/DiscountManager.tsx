"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = {
  id: number;
  code: string;
  title: string;
  offer: string;
  rules: string[];
  uses: string;
  active: boolean;
  expired: boolean;
};

// Admin → Discount codes: create codes and switch them on or off.
export function DiscountManager({ codes }: { codes: Row[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"percent" | "amount">("percent");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(body: object) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) setMsg({ text: json.error ?? "Something went wrong", ok: false });
    else if (json.message) setMsg({ text: json.message, ok: true });
    router.refresh();
    return res.ok;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
      <form
        className="space-y-4 rounded-2xl border border-line bg-white p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = Object.fromEntries(new FormData(form));
          const ok = await send({ action: "create", ...data, kind, firstOrderOnly: data.firstOrderOnly === "on" });
          if (ok) form.reset();
        }}
      >
        <h2 className="font-display text-2xl font-bold">New discount code</h2>
        <label className="block">
          <span className="text-sm font-semibold">Code customers type</span>
          <input name="code" className="field mt-1 uppercase" placeholder="e.g. SUMMER15" maxLength={40} required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Title (for you)</span>
          <input name="title" className="field mt-1" placeholder="e.g. Summer sale 15%" maxLength={200} required />
        </label>
        <div>
          <span className="text-sm font-semibold">Discount</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["percent", "amount"] as const).map((k) => (
              <button key={k} type="button" className="option text-sm font-semibold" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {k === "percent" ? "% off" : "£ off"}
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {kind === "amount" && <span className="font-semibold">£</span>}
            <input
              name="value"
              type="number"
              className="field"
              min={kind === "percent" ? 1 : 0.01}
              max={kind === "percent" ? 100 : 1000}
              step={kind === "percent" ? 1 : 0.01}
              placeholder={kind === "percent" ? "10" : "5.00"}
              required
            />
            {kind === "percent" && <span className="font-semibold">%</span>}
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-line p-3">
          <input type="checkbox" name="firstOrderOnly" className="h-5 w-5 accent-[#8a6812]" />
          <span className="text-sm font-semibold">First order only</span>
        </label>
        <details className="rounded-xl border border-line p-3">
          <summary className="cursor-pointer py-1 text-sm font-semibold">More options (optional)</summary>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm">Minimum spend on plates (£)</span>
              <input name="minSpend" type="number" min={0} step={0.01} className="field mt-1" placeholder="No minimum" />
            </label>
            <label className="block">
              <span className="text-sm">How many times it can be used in total</span>
              <input name="maxUses" type="number" min={1} step={1} className="field mt-1" placeholder="Unlimited" />
            </label>
            <label className="block">
              <span className="text-sm">Last day it works</span>
              <input name="expires" type="date" className="field mt-1" />
            </label>
          </div>
        </details>
        <button type="submit" className="btn btn-gold w-full" disabled={busy}>
          {busy ? "Saving…" : "Create code"}
        </button>
        {msg && (
          <p role="status" className={`text-sm font-semibold ${msg.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>
            {msg.text}
          </p>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <h2 className="border-b border-line px-5 py-4 font-display text-2xl font-bold">Your codes</h2>
        {codes.length === 0 ? (
          <p className="p-5 text-muted">No codes yet. Create one on the left.</p>
        ) : (
          <ul className="divide-y divide-line">
            {codes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-dashed border-line px-2 py-0.5 font-mono font-bold">{c.code}</span>
                    <span className="font-semibold">{c.offer}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        c.active && !c.expired ? "bg-[#e7f6ec] text-[#1f7a3d]" : "bg-[#f3f3f3] text-[#555]"
                      }`}
                    >
                      {c.expired ? "Expired" : c.active ? "On" : "Off"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm">{c.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    Used {c.uses} {c.uses === "1" ? "time" : "times"}
                    {c.rules.length > 0 && ` · ${c.rules.join(" · ")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => send({ action: "toggle", id: c.id, active: !c.active })}
                    className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    {c.active ? "Turn off" : "Turn on"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => window.confirm(`Delete ${c.code}? Customers won't be able to use it.`) && send({ action: "delete", id: c.id })}
                    className="rounded-lg border border-[#f1b4a5] bg-white px-3 py-2 text-sm font-semibold text-[#b42318] disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
