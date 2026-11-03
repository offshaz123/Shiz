"use client";

import { useEffect, useState } from "react";
import { STATUSES, type Prospect, type ProspectStatus } from "@/lib/prospect-types";

/**
 * The call list.
 *
 * Type a trade and a town, and it gives you the businesses Google has for it,
 * fewest reviews first, phone number already there. Everything found is kept,
 * so the list builds up as you search more areas rather than vanishing when
 * you close the tab.
 *
 * Review count is the filter because it is the only honest read we can get on
 * how established a business is. Four hundred reviews means they have been
 * doing fine without us for years. Eleven means they are still building, and
 * far more likely to pick up the phone.
 *
 * The rating filter exists for the opposite reason: a business sitting on 3.1
 * stars has a reputation problem that no amount of advertising fixes, and
 * selling them ads first would be selling them the wrong thing. A business
 * with no rating at all is kept, not filtered out — no reviews yet is a
 * better prospect than mediocre ones, and it would be daft to exclude them
 * for failing a test they cannot take.
 *
 * The website score is NOT fetched up front. Scanning twenty sites takes a
 * minute and most of them you will never ring. Press Scan on the row you care
 * about and it is saved against them.
 */

const ERRORS: Record<string, string> = {
  no_key: "GOOGLE_PLACES_KEY isn't set on the server, so searching won't work.",
  budget: "This month's Google lookup allowance is spent. It resets on the 1st.",
  error: "Google didn't answer. Try again in a minute.",
  query_too_short: "Say what you're after and where — e.g. car detailing in Romford.",
  unauthorised: "Session expired. Reload the page and log in again.",
  no_database: "No database connection, so nothing can be saved.",
};

const STATUS_LABEL: Record<ProspectStatus, string> = {
  new: "Not called",
  called: "Called",
  interested: "Interested",
  "not-interested": "Not interested",
  "no-answer": "No answer",
  customer: "Customer",
};

const STATUS_STYLE: Record<ProspectStatus, string> = {
  new: "border-border text-muted",
  called: "border-border text-foreground",
  interested: "border-emerald-500/50 bg-emerald-500/10 text-emerald-500",
  "not-interested": "border-border text-muted line-through",
  "no-answer": "border-amber-500/50 bg-amber-500/10 text-amber-500",
  customer: "border-emerald-500/50 bg-emerald-500/20 text-emerald-400",
};

const FILTERS = [
  { value: "to-call", label: "To call" },
  { value: "all", label: "Everyone" },
  { value: "interested", label: "Interested" },
  { value: "not-interested", label: "Not interested" },
  { value: "customer", label: "Customers" },
] as const;

const SUGGESTIONS = [
  "car detailing in Romford",
  "window tinting in Essex",
  "mobile valeting in Ilford",
  "car wrapping in Barking",
  "alloy wheel repair in Enfield",
];

function tone(score: number): string {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
}

type Busy = { scanning?: boolean; scanError?: string };

export function ProspectFinder() {
  const [query, setQuery] = useState("");
  const [maxReviews, setMaxReviews] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [status, setStatus] = useState<string>("to-call");

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [busy, setBusy] = useState<Record<number, Busy>>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  /**
   * Fetches the list and touches no state, so it is safe to call from an
   * effect. React's lint rightly refuses a setState in an effect body — it
   * causes a second render before the first has painted — so every setState
   * below happens after the await, in the continuation.
   */
  async function fetchList(): Promise<Prospect[]> {
    const params = new URLSearchParams({
      maxReviews: String(maxReviews),
      minRating: String(minRating),
      status,
    });
    const res = await fetch(`/api/admin/prospects?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(ERRORS[data?.error] ?? "Couldn't load the list.");
    return data.prospects as Prospect[];
  }

  // Reload whenever a filter moves. The list is the thing on this page; the
  // search box only adds to it.
  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((list) => {
        if (cancelled) return;
        setProspects(list);
        setError("");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Couldn't reach the server.");
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxReviews, minRating, status]);

  /** The Refresh button. An event handler, so it can show progress. */
  async function load() {
    setLoading(true);
    setError("");
    try {
      setProspects(await fetchList());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the server.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (searching) return;
    setSearching(true);
    setError("");

    try {
      const res = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, maxReviews }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data?.error] ?? "That search didn't work.");
      } else {
        // A fresh search shows everything it found, whatever filter was set.
        setStatus("all");
        setProspects(data.prospects as Prospect[]);
        if (!data.saved) setError(ERRORS.no_database);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSearching(false);
    }
  }

  function patch(id: number, changes: Partial<Prospect>) {
    setProspects((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  }

  async function save(id: number, changes: { status?: ProspectStatus; notes?: string; siteScore?: number }) {
    patch(id, changes as Partial<Prospect>);
    await fetch("/api/admin/prospects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...changes }),
    }).catch(() => null);
  }

  async function scan(p: Prospect) {
    if (!p.website || busy[p.id]?.scanning) return;
    setBusy((b) => ({ ...b, [p.id]: { scanning: true } }));

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: p.website }),
      });
      const data = await res.json();
      if (res.ok) {
        setBusy((b) => ({ ...b, [p.id]: {} }));
        await save(p.id, { siteScore: data.score });
      } else {
        setBusy((b) => ({ ...b, [p.id]: { scanError: "wouldn't load" } }));
      }
    } catch {
      setBusy((b) => ({ ...b, [p.id]: { scanError: "failed" } }));
    }
  }

  const noSite = prospects.filter((p) => !p.website);
  const withSite = prospects.filter((p) => p.website);

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="prospect-query" className="mb-1.5 block text-sm text-muted">
            Find more — trade and place
          </label>
          <input
            id="prospect-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="car detailing in Romford"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-brand-pink"
          />
        </div>
        <button
          type="submit"
          disabled={searching}
          className="brand-gradient-bg rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {searching ? "Searching…" : "Find"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-end gap-4 border-t border-border pt-6">
        <div>
          <label htmlFor="f-reviews" className="mb-1.5 block text-xs text-muted">
            Max reviews
          </label>
          <input
            id="f-reviews"
            type="number"
            min={0}
            max={500}
            value={maxReviews}
            onChange={(e) => setMaxReviews(Number(e.target.value))}
            className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          />
        </div>
        <div>
          <label htmlFor="f-rating" className="mb-1.5 block text-xs text-muted">
            Min stars
          </label>
          <select
            id="f-rating"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          >
            <option value={0}>Any</option>
            <option value={3}>3.0+</option>
            <option value={4}>4.0+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                status === f.value
                  ? "border-brand-pink text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-50"
        >
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      {loaded && !error && prospects.length === 0 && (
        <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          Nothing here yet. Search a trade and a town above — try a suburb rather than
          &ldquo;London&rdquo;, it surfaces the smaller operators.
        </p>
      )}

      {noSite.length > 0 && (
        <Section
          title={`No website at all — ring these first (${noSite.length})`}
          note="Nothing to criticise, just something to build."
        >
          {noSite.map((p) => (
            <Row key={p.id} p={p} busy={busy[p.id]} onSave={save} onScan={scan} />
          ))}
        </Section>
      )}

      {withSite.length > 0 && (
        <Section
          title={`Has a website (${withSite.length})`}
          note="Fewest reviews first. Press Scan to score their site."
        >
          {withSite.map((p) => (
            <Row key={p.id} p={p} busy={busy[p.id]} onSave={save} onScan={scan} />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted">{note}</p>
      <ul className="mt-4 flex flex-col gap-2">{children}</ul>
    </section>
  );
}

function Row({
  p,
  busy,
  onSave,
  onScan,
}: {
  p: Prospect;
  busy?: Busy;
  onSave: (id: number, changes: { status?: ProspectStatus; notes?: string }) => void;
  onScan: (p: Prospect) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(p.notes);

  return (
    <li className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-semibold text-foreground">{p.name}</span>
        <span className="text-xs text-muted">
          {p.reviews === 1 ? "1 review" : `${p.reviews} reviews`}
          {p.rating !== null && ` · ${p.rating.toFixed(1)}★`}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
        {p.phone && (
          <a
            href={`tel:${p.phone.replace(/\s+/g, "")}`}
            className="font-semibold text-foreground underline"
          >
            {p.phone}
          </a>
        )}
        {p.category && <span>{p.category}</span>}
        {p.address && <span className="truncate">{p.address}</span>}
        {p.mapsUri && (
          <a href={p.mapsUri} target="_blank" rel="noreferrer noopener" className="underline">
            Maps
          </a>
        )}
        {p.website && (
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer noopener"
            className="truncate underline"
          >
            {p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        )}
        {p.website &&
          (p.siteScore !== null ? (
            <span className={`font-bold ${tone(p.siteScore)}`}>site {p.siteScore.toFixed(1)}</span>
          ) : busy?.scanError ? (
            <span>site {busy.scanError}</span>
          ) : (
            <button
              type="button"
              onClick={() => onScan(p)}
              disabled={busy?.scanning}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:text-foreground disabled:opacity-50"
            >
              {busy?.scanning ? "Scanning…" : "Scan"}
            </button>
          ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSave(p.id, { status: s })}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${
              p.status === s ? STATUS_STYLE[s] : "border-border text-muted hover:text-foreground"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto text-[11px] font-semibold text-muted hover:text-foreground"
        >
          {p.notes && !open ? "Notes ✓" : open ? "Close notes" : "Notes"}
        </button>
      </div>

      {p.notes && !open && <p className="mt-2 text-xs italic text-muted">{p.notes}</p>}

      {open && (
        <div className="mt-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => notes !== p.notes && onSave(p.id, { notes })}
            rows={3}
            placeholder="What they said, when to ring back…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          />
          <p className="mt-1 text-[11px] text-muted">Saves when you click away.</p>
        </div>
      )}
    </li>
  );
}
