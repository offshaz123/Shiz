"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Payment = { id: number; day: string; platform: string; amount: number; note: string };

const gbp = (p: number) => `£${(p / 100).toFixed(2)}`;
const day = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// Admin → Money: type in each payment for ads from the TikTok and Google
// bills, and see the ones in the chosen dates.
export function AdSpendEditor({ payments, platforms, labels, today }: { payments: Payment[]; platforms: Record<string, string>; labels: Record<string, string>; today: string }) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [platform, setPlatform] = useState("tiktok");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(method: "POST" | "DELETE", url: string, body?: object) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      setMessage({ ok: res.ok, text: data.message ?? data.error ?? "Something went wrong" });
      if (res.ok) {
        if (method === "POST") {
          setAmount("");
          setNote("");
        }
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <form
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto_auto_1fr_auto] lg:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          send("POST", "/api/admin/ad-spend", { day: date, platform, amount, note });
        }}
      >
        <label className="block text-sm font-semibold">
          Date paid
          <input id="ad-day" type="date" className="field mt-1" value={date} max={today} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="block text-sm font-semibold">
          For
          <select id="ad-platform" className="field mt-1" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            {Object.entries(platforms).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Taken from your card
          <span className="mt-1 flex items-center gap-1">
            £<input id="ad-amount" className="field" inputMode="decimal" placeholder="120.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Note (optional)
          <input id="ad-note" className="field mt-1" placeholder="e.g. £100 top-up + VAT" maxLength={200} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" className="btn btn-gold" disabled={busy}>
          {busy ? "Saving…" : "Add"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">
        Type the full amount that came off your card, VAT included (a £100 TikTok top-up is £120). You&apos;re not VAT registered, so the VAT is a
        real cost. Find each payment under Billing / Payments in TikTok Ads Manager. Google and Meta come in by themselves.
      </p>
      {message && <p className={`mt-3 text-sm font-semibold ${message.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{message.text}</p>}

      {payments.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No ad payments in these dates yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">For</th>
                <th className="py-2 pr-3">Note</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2 pr-3 whitespace-nowrap">{day(p.day)}</td>
                  <td className="py-2 pr-3 font-semibold">{labels[p.platform] ?? p.platform}</td>
                  <td className="py-2 pr-3 text-muted">{p.note}</td>
                  <td className="py-2 pr-3 text-right font-semibold">{gbp(p.amount)}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      className="text-xs font-semibold text-[#b42318] underline"
                      disabled={busy}
                      onClick={() => send("DELETE", `/api/admin/ad-spend?id=${p.id}`)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
