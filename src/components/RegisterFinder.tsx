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
  /** Company numbers ticked for adding. Nothing is ticked to begin with. */
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [undoing, setUndoing] = useState(false);

  /** Lifts every company that came from the register back off the list. */
  async function undoAll() {
    if (undoing) return;
    if (
      !window.confirm(
        "Remove every company added from the Companies House register from the call list?\n\nAnything you have already emailed or rung is kept.",
      )
    ) {
      return;
    }
    setUndoing(true);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/admin/company", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Couldn't remove them.");
        return;
      }
      setNote(
        `${data.deleted} removed from the call list.` +
          (data.kept > 0
            ? ` ${data.kept} kept because you have already emailed or rung them.`
            : ""),
      );
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setUndoing(false);
    }
  }

  async function run(save: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/admin/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector,
          location,
          months,
          size: 25,
          save,
          select: save ? [...picked] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "That didn't work.");
        return;
      }
      setHits(data.results as Hit[]);
      if (save) {
        setPicked(new Set());
        setNote(
          `${data.saved} added to the call list. They are under "No website at all" — ring these first.`,
        );
      } else {
        setPicked(new Set());
        setNote(
          `${(data.results as Hit[]).length} found. Nothing saved — tick the ones you want.`,
        );
      }
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
        {/* The add button lives under the results now, next to the count
            of what is ticked. One press up here used to put every company
            the search returned onto the call list. */}
        <button
          type="button"
          onClick={undoAll}
          disabled={undoing}
          className="ml-auto rounded-lg border border-border px-4 py-2 text-xs text-muted hover:border-red-500/50 hover:text-foreground disabled:opacity-50"
        >
          {undoing ? "Removing…" : "Undo all register adds"}
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {note && <p className="mt-4 text-sm font-semibold text-foreground">{note}</p>}

      {hits && hits.length > 0 && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() =>
                setPicked(
                  picked.size === hits.length ? new Set() : new Set(hits.map((h) => h.number)),
                )
              }
              className="font-semibold text-brand-pink hover:underline"
            >
              {picked.size === hits.length ? "Clear all" : "Tick all"}
            </button>
            <span className="text-muted">
              {picked.size} of {hits.length} ticked
            </span>
          </div>

          <ul className="mt-2 flex max-h-80 flex-col gap-1.5 overflow-y-auto pr-1">
            {hits.map((h) => {
              const on = picked.has(h.number);
              return (
                <li key={h.number}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-xl border px-3 py-2 text-xs transition-colors ${
                      on ? "border-brand-pink bg-brand-pink/5" : "border-border hover:border-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => {
                        const next = new Set(picked);
                        if (on) next.delete(h.number);
                        else next.add(h.number);
                        setPicked(next);
                      }}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-pink"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground">{h.title}</span>
                        <span className="text-muted">{h.number}</span>
                        {h.incorporatedOn && (
                          <span className="font-semibold text-emerald-500">
                            started {h.incorporatedOn}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-muted">{h.address}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => run(true)}
            disabled={busy || picked.size === 0}
            className="mt-3 w-full rounded-lg bg-brand-pink px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {picked.size === 0
              ? "Tick the ones you want first"
              : `Add ${picked.size} to the call list`}
          </button>
        </>
      )}

      {hits && hits.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          Nothing on the register matches that. Try a wider area, or a longer window.
        </p>
      )}
    </div>
  );
}
