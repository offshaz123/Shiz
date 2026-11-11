"use client";

import { useState } from "react";

/**
 * Finding companies on the day they start.
 *
 * Google Places finds businesses established enough to have reviews. The
 * register finds them the week they incorporate — no agency, often no
 * website, and a budget nobody has spent yet.
 *
 * What it cannot give you is a phone number or a website, because the
 * register lists legal entities and not shop fronts. So these land on the
 * call list with a name and an address, which is still the easiest
 * conversation this business has: there is nothing to criticise, only
 * something to build.
 */

const SECTORS = [
  { slug: "automotive", label: "Automotive" },
  { slug: "hospitality", label: "Restaurants & Hospitality" },
  { slug: "beauty", label: "Health, Beauty & Wellness" },
  { slug: "trades", label: "Home & Trade Services" },
  { slug: "professional", label: "Professional Services" },
];

type Hit = {
  number: string;
  title: string;
  kind: string;
  address: string;
  incorporatedOn: string;
  sic: string[];
};

export function RegisterFinder() {
  const [sector, setSector] = useState("automotive");
  const [location, setLocation] = useState("");
  const [months, setMonths] = useState(3);
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function run(save: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/admin/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, location, months, size: 25, save }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "That didn't work.");
        return;
      }
      setHits(data.results as Hit[]);
      setNote(
        save
          ? `${data.saved} added to the call list. They are under "No website at all" — ring these first.`
          : `${(data.results as Hit[]).length} found. Nothing saved yet.`,
      );
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-bold text-foreground">Find newly started companies</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Straight off the register, by trade and area. A company three months old has no agency and
        usually no website — and the register has them the week they start, long before Google does.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="r-sector" className="mb-1.5 block text-xs text-muted">
            Trade
          </label>
          <select
            id="r-sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          >
            {SECTORS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="r-location" className="mb-1.5 block text-xs text-muted">
            Area
          </label>
          <input
            id="r-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Romford, or IG11"
            className="w-44 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label htmlFor="r-months" className="mb-1.5 block text-xs text-muted">
            Started within
          </label>
          <select
            id="r-months"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          >
            <option value={1}>1 month</option>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => run(false)}
          disabled={busy}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground disabled:opacity-50"
        >
          {busy ? "Looking…" : "Show me"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={busy}
          className="rounded-lg bg-brand-pink px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Add to call list
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {note && <p className="mt-4 text-sm font-semibold text-foreground">{note}</p>}

      {hits && hits.length > 0 && (
        <ul className="mt-4 flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
          {hits.map((h) => (
            <li key={h.number} className="rounded-xl border border-border px-3 py-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">{h.title}</span>
                <span className="text-muted">{h.number}</span>
                {h.incorporatedOn && (
                  <span className="font-semibold text-emerald-500">
                    started {h.incorporatedOn}
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-muted">{h.address}</div>
            </li>
          ))}
        </ul>
      )}

      {hits && hits.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          Nothing on the register matches that. Try a wider area, or a longer window.
        </p>
      )}
    </div>
  );
}
