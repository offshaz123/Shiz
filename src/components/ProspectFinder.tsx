"use client";

import { useEffect, useState } from "react";
import { STATUSES, type Prospect, type ProspectStatus } from "@/lib/prospect-types";
import { industries } from "@/content/industries";
import { areaGroups, cities } from "@/content/areas";
import { siteConfig } from "@/lib/site-config";
import { buildDraft } from "@/lib/prospect-outreach";

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

/**
 * The status filter.
 *
 * "Any status" rather than "Everyone", because the tabs above already have an
 * Everyone, and two buttons on one screen carrying the same word for
 * different things is how somebody new ends up looking at the wrong list and
 * ringing a customer.
 */
const FILTERS = [
  { value: "to-call", label: "Not answered yet" },
  { value: "all", label: "Any status" },
  { value: "interested", label: "Interested" },
  { value: "not-interested", label: "Not interested" },
  { value: "customer", label: "Customers" },
] as const;

/**
 * The trades to offer, taken straight from the industries the site sells to
 * rather than a list invented here. If a sector is added to
 * content/industries.ts it turns up on this page without anyone remembering
 * to come and add it.
 *
 * "&" is dropped because it means nothing to a Google text search — "Garages
 * & MOT" finds less than "Garages MOT".
 */
function tradesFor(slug: string): string[] {
  const industry = industries.find((i) => i.slug === slug);
  return (industry?.examples ?? []).map((e) => e.replace(/\s*&\s*/g, " "));
}

function tone(score: number): string {
  if (score >= 8) return "text-emerald-500";
  if (score >= 6) return "text-amber-500";
  return "text-red-500";
}

type Busy = { scanning?: boolean; scanError?: string };


/**
 * What a search did, said plainly.
 *
 * Google is asked for businesses and the answer is then filtered by review
 * count before anything is saved, so "found twenty, kept none" is an ordinary
 * outcome — and until this existed it looked exactly like "found nothing",
 * which sends you looking for a fault that is not there. The review cap is
 * named because it is almost always the thing that did it: a city centre
 * trade with a cap of 25 filters out the entire high street.
 */
function searchOutcome(query: string, found: number, dropped: number, cap: number): string {
  if (!Number.isFinite(found) || found === 0) {
    return `Google found nothing for "${query}". Try different wording, or a bigger area.`;
  }
  const kept = found - (Number.isFinite(dropped) ? dropped : 0);
  if (kept <= 0) {
    return `Found ${found} for "${query}", and every one had more than ${cap} reviews, so none were kept. Raise "Max reviews" and search again.`;
  }
  if (dropped > 0) {
    return `Found ${found} for "${query}", kept ${kept}. The other ${dropped} had more than ${cap} reviews.`;
  }
  return `Found ${found} for "${query}", all kept.`;
}

export type SentEmail = {
  subject: string;
  body: string;
  step: number;
  status: string;
  sentAt: string;
};

/**
 * What to do about this business next, in one line.
 *
 * The call list answers "who is worth ringing". Once you are looking at one
 * of them the question changes to "what now", and the answer is sitting in
 * four or five fields that nobody wants to read and weigh up at nine in the
 * morning with a phone in their hand. So it gets said outright.
 *
 * Ordered by what overrules what: a request not to be contacted beats
 * everything, a reply beats the sequence, and the sequence beats a nudge to
 * write to them.
 */
function nextMove(p: Prospect, emails: SentEmail[]): string {
  if (p.unsubscribedAt) return "Leave them. They asked not to be contacted again.";
  if (p.status === "not-interested") return "Leave them. Marked not interested.";
  if (p.status === "customer") return "They are a customer. Nothing to chase here.";
  if (p.repliedAt) return "They have written back — the follow-ups have stopped. Answer them yourself.";
  if (p.status === "interested") return "Interested: ring them and get a time in the diary.";

  const sent = emails.filter((e) => e.status === "sent");
  if (!p.website) return `No website at all — which is the pitch. Ring them on ${p.phone || "the number on their listing"}.`;
  if (p.scannedAt === null) return "Scan their site first, so there is something to open with.";
  if (!p.email) return `No email published on their site. Ring them on ${p.phone || "the listing number"}.`;

  if (sent.length === 0) return "Write the first email. The scan has given you the opening line.";
  if (sent.length >= 3) {
    return "Three emails, no answer. One phone call is worth a try, then leave it alone.";
  }
  if (p.sequenceStoppedAt) {
    return "Follow-ups are off. If they are still worth it, ring them rather than emailing again.";
  }
  return sent.length === 1
    ? "Emailed once. The day 3 follow-up goes on its own — nothing to do unless you fancy ringing."
    : "Two emails in. The last one goes on day 5, then it stops.";
}

/**
 * Where the mail actually gets sent from.
 *
 * A plain mailto: link does nothing on a machine with no desktop mail client
 * registered, which is the case here — the inbox lives in Hostinger webmail in
 * a browser tab. There is no documented way to pre-fill that compose box from
 * a URL, so the draft goes to the clipboard and webmail opens beside it: one
 * paste, and it keeps working if the mail ever moves to Gmail or Outlook.
 */
const WEBMAIL_URL = "https://mail.hostinger.com";

/** Kept for a phone, where mailto: does have a handler and opens Mail with
 *  everything already filled in. */
function mailtoHref(to: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Copies without assuming the async clipboard API is there: it needs a secure
 *  context and a permission that an embedded or older browser may refuse. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(box);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ProspectFinder() {
  const [query, setQuery] = useState("");
  const [town, setTown] = useState("");
  const [industry, setIndustry] = useState("");
  const [maxReviews, setMaxReviews] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [status, setStatus] = useState<string>("to-call");

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [busy, setBusy] = useState<Record<number, Busy>>({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [sort, setSort] = useState<"default" | "worst-site">("default");
  // Which half of the list you are looking at. Anyone who has been emailed or
  // rung leaves the list of people still to approach, because the whole job
  // of that list is "who have we not got to yet".
  const [contact, setContact] = useState<"not-contacted" | "contacted" | "all">("not-contacted");
  const [counts, setCounts] = useState<{ notContacted: number; contacted: number } | null>(null);
  const [moved, setMoved] = useState("");
  /** What the last search actually did, in words. Without this a search that
   *  found twenty businesses and filtered every one of them out looks
   *  identical to one that found nothing at all. */
  const [searchNote, setSearchNote] = useState("");
  // Which town's prospects to show. Separate from the town box above, which
  // says where the next *search* runs — this one filters what is already in
  // the list, so you can work one area at a time on the phone.
  const [townFilter, setTownFilter] = useState("");
  const [towns, setTowns] = useState<{ town: string; n: number }[]>([]);
  const [scanAllState, setScanAllState] = useState<{ running: boolean; done: number }>({
    running: false,
    done: 0,
  });
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  /**
   * Fetches the list and touches no state, so it is safe to call from an
   * effect. React's lint rightly refuses a setState in an effect body — it
   * causes a second render before the first has painted — so every setState
   * below happens after the await, in the continuation.
   */
  type ListPayload = {
    prospects: Prospect[];
    counts: { notContacted: number; contacted: number } | null;
    towns: { town: string; n: number }[];
  };

  async function fetchList(): Promise<ListPayload> {
    const params = new URLSearchParams({
      maxReviews: String(maxReviews),
      minRating: String(minRating),
      status,
      contact,
      industry,
      town: townFilter,
      sort,
    });
    const res = await fetch(`/api/admin/prospects?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(ERRORS[data?.error] ?? "Couldn't load the list.");
    return {
      prospects: data.prospects as Prospect[],
      counts: (data.counts ?? null) as ListPayload["counts"],
      towns: (data.towns ?? []) as ListPayload["towns"],
    };
  }

  // Reload whenever a filter moves. The list is the thing on this page; the
  // search box only adds to it.
  useEffect(() => {
    let cancelled = false;
    fetchList()
      .then((payload) => {
        if (cancelled) return;
        setProspects(payload.prospects);
        setCounts(payload.counts);
        setTowns(payload.towns);
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
  }, [maxReviews, minRating, status, contact, industry, townFilter, sort]);

  /**
   * Works through every unscanned prospect, a batch at a time.
   *
   * The server scans eight per call and tells us whether more are waiting, so
   * this loops rather than asking it to do hundreds in one request — which on
   * this hosting would be a long-running process and a timeout. The count
   * climbs as it goes so a long run does not look like a hang.
   */
  async function scanAll() {
    setScanAllState({ running: true, done: 0 });
    setError("");
    try {
      let total = 0;
      for (let round = 0; round < 40; round++) {
        const res = await fetch("/api/admin/prospects/scan", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(ERRORS[data?.error] ?? "Couldn't scan.");
        total += Number(data.scanned ?? 0) + Number(data.unreadable ?? 0);
        setScanAllState({ running: true, done: total });
        if (data.done) break;
      }
      const payload = await fetchList();
      setProspects(payload.prospects);
      setCounts(payload.counts);
      setTowns(payload.towns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the server.");
    } finally {
      setScanAllState((s) => ({ running: false, done: s.done }));
    }
  }

  /** The Refresh button. An event handler, so it can show progress. */
  async function load() {
    setLoading(true);
    setError("");
    // Refresh is the deliberate "show me the list as it stands", so the
    // receipt from the last search goes with it. It is not cleared when a
    // filter moves, because the search resets the filters itself and would
    // wipe its own message a moment after writing it.
    setSearchNote("");
    try {
      const payload = await fetchList();
      setProspects(payload.prospects);
      setCounts(payload.counts);
      setTowns(payload.towns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the server.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  async function search(e?: React.FormEvent, override?: string) {
    e?.preventDefault();
    if (searching) return;

    const text = override ?? query;
    if (override) setQuery(override);
    setSearching(true);
    setError("");

    try {
      const res = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, maxReviews, industry, town: town.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(ERRORS[data?.error] ?? "That search didn't work.");
      } else {
        // A fresh search shows what it found under whatever status, but it
        // stays on the people still to approach. Dropping back to "everyone"
        // put businesses already emailed back in among the new ones, which
        // is the one thing this page is meant to keep apart.
        setStatus("all");
        setContact("not-contacted");
        // A search that just ran in Barking should not come back filtered to
        // Romford because that is where you were working an hour ago.
        setTownFilter("");
        setProspects(data.prospects as Prospect[]);
        if (data.counts) setCounts(data.counts as { notContacted: number; contacted: number });
        setSearchNote(searchOutcome(text, Number(data.found), Number(data.dropped), maxReviews));
        if (!data.saved) setError(ERRORS.no_database);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSearching(false);
    }
  }

  /**
   * Takes a business off the "to contact" list the moment it has been
   * written to, rather than leaving it there until the next reload looking
   * like it still needs doing.
   *
   * The line it leaves behind is the receipt: the row vanishing on its own
   * with nothing said would read as something having gone wrong.
   */
  function markContacted(id: number, name: string) {
    setCounts((c) => (c ? { notContacted: c.notContacted - 1, contacted: c.contacted + 1 } : c));
    if (contact !== "not-contacted") return;
    setMoved(`${name} → Contacted`);
    window.setTimeout(() => {
      setProspects((list) => list.filter((p) => p.id !== id));
      setMoved("");
    }, 2500);
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

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Industry</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {/* First, and spelled out, because the whole list is the default
              view anyone wants when the question is "who have we contacted"
              rather than "who shall I ring next". Clicking the selected
              industry again did this already, which nobody could be expected
              to guess. */}
          <button
            type="button"
            onClick={() => setIndustry("")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              industry === ""
                ? "border-brand-pink text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            All industries
          </button>
          {industries.map((i) => (
            <button
              key={i.slug}
              type="button"
              onClick={() => setIndustry(industry === i.slug ? "" : i.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                industry === i.slug
                  ? "border-brand-pink text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {i.name}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">
          {industry
            ? "The list below is filtered to this industry. Pick a trade to find more."
            : "Showing every business you have ever searched for. Pick an industry to narrow it down and to search for more."}
        </p>
      </div>

      {industry && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <label htmlFor="prospect-town" className="mb-1.5 block text-xs text-muted">
            Town or area to search in
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="prospect-town"
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="Romford"
              className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
            />
            {/* A whole city, for when you want to cast wider than the
                suburbs below. It fills the box rather than searching on its
                own, so the trade is still chosen the same way. */}
            <select
              value={cities.includes(town.trim()) ? town.trim() : ""}
              onChange={(e) => e.target.value && setTown(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted outline-none focus:border-brand-pink"
              aria-label="Pick a city"
            >
              <option value="">Or pick a city…</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {cities.includes(town.trim()) && (
            <p className="mt-2 text-xs text-muted">
              A whole city mostly returns the big operators who already have an agency. If it comes
              back thin, try a suburb of it below.
            </p>
          )}

          {/*
            Typing a town every time means thinking of one every time, and the
            ones that come to mind are the big names — which are precisely the
            searches that return four-hundred-review operators. These are
            suburbs, closest first. The box above still takes anything.
          */}
          <div className="mt-3 flex flex-col gap-2">
            {areaGroups.map((group) => (
              <div key={group.name} className="flex flex-wrap items-center gap-1.5">
                <span
                  title={group.note}
                  className="mr-1 w-full text-[11px] uppercase tracking-wide text-muted sm:w-auto"
                >
                  {group.name}
                </span>
                {group.areas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setTown(area)}
                    className={`rounded-md border px-2 py-0.5 text-[11px] ${
                      town === area
                        ? "border-brand-pink text-foreground"
                        : "border-border text-muted hover:text-foreground"
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs font-semibold text-foreground">
            {town.trim() ? `Search ${town.trim()} for:` : "Pick an area, then a trade:"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tradesFor(industry).map((trade) => (
              <button
                key={trade}
                type="button"
                disabled={!town.trim() || searching}
                onClick={() => search(undefined, `${trade} in ${town.trim()}`)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:border-brand-pink hover:text-foreground disabled:opacity-40"
              >
                {trade}
              </button>
            ))}
          </div>
          {!town.trim() && (
            <p className="mt-2 text-xs text-muted">
              Pick an area first. A suburb finds smaller operators than &ldquo;London&rdquo; does —
              searching a whole city mostly returns the big firms who don&apos;t need us.
            </p>
          )}
        </div>
      )}

      {/* The two lists. Everything found by a search starts on the left; the
          moment it is emailed or rung it moves to the right, so the left is
          always and only the people still waiting to be approached. */}
      <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-border pt-6">
        {([
          { value: "not-contacted", label: "To contact", count: counts?.notContacted },
          { value: "contacted", label: "Contacted", count: counts?.contacted },
          { value: "all", label: "Everyone", count: undefined },
        ] as const).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setContact(tab.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-bold ${
              contact === tab.value
                ? "border-brand-pink bg-brand-pink/10 text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="ml-2 font-semibold text-muted">{tab.count}</span>
            )}
          </button>
        ))}
        {moved && <span className="text-xs font-bold text-emerald-500">{moved}</span>}
      </div>

      {searchNote && (
        <p className="mt-3 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-foreground">
          {searchNote}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="f-reviews" className="mb-1.5 block text-xs text-muted">
            Max reviews
          </label>
          {/*
            A free number box let "02" be typed, which filters to businesses
            with two reviews or fewer and returns an empty page that looks
            broken rather than filtered. Fixed values can't be typed wrong.
          */}
          <select
            id="f-reviews"
            value={maxReviews}
            onChange={(e) => setMaxReviews(Number(e.target.value))}
            className="w-32 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          >
            <option value={10}>Under 10</option>
            <option value={25}>Under 25</option>
            <option value={50}>Under 50</option>
            <option value={100}>Under 100</option>
            <option value={200}>Under 200</option>
            <option value={500}>Any</option>
          </select>
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
        <div>
          <span className="mb-1.5 block text-xs text-muted">Status</span>
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
        </div>
        <div>
          <label htmlFor="f-town" className="mb-1.5 block text-xs text-muted">
            Town
          </label>
          <select
            id="f-town"
            value={townFilter}
            onChange={(e) => setTownFilter(e.target.value)}
            className="w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          >
            <option value="">Everywhere</option>
            {towns.map((t) => (
              <option key={t.town} value={t.town}>
                {t.town} ({t.n})
              </option>
            ))}
          </select>
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "default" | "worst-site")}
          className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-muted"
          aria-label="Order"
        >
          <option value="default">By status</option>
          <option value="worst-site">Worst site first</option>
        </select>
        <button
          type="button"
          onClick={scanAll}
          disabled={scanAllState.running}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-50"
        >
          {scanAllState.running ? `Scanning… ${scanAllState.done}` : "Scan all sites"}
        </button>
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
            <Row
              key={p.id}
              p={p}
              busy={busy[p.id]}
              onSave={save}
              onScan={scan}
              onContacted={markContacted}
            />
          ))}
        </Section>
      )}

      {withSite.length > 0 && (
        <Section
          title={`Has a website (${withSite.length})`}
          note="Fewest reviews first. Press Scan to score their site."
        >
          {withSite.map((p) => (
            <Row
              key={p.id}
              p={p}
              busy={busy[p.id]}
              onSave={save}
              onScan={scan}
              onContacted={markContacted}
            />
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

/** One label and one value on the profile panel. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-[5.5rem] font-semibold text-muted">{label}</span>
      <span className="truncate text-foreground" title={value}>
        {value}
      </span>
    </div>
  );
}

function Row({
  p,
  busy,
  onSave,
  onScan,
  onContacted,
}: {
  p: Prospect;
  busy?: Busy;
  onSave: (id: number, changes: { status?: ProspectStatus; notes?: string }) => void;
  onScan: (p: Prospect) => void;
  onContacted: (id: number, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(p.notes);
  const [copied, setCopied] = useState("");
  const [compose, setCompose] = useState<{ subject: string; body: string } | null>(null);
  // What the row knows about the sequence after an action on this page, so a
  // send or a stop shows immediately rather than on the next load.
  const [seq, setSeq] = useState<"unchanged" | "started" | "stopped">("unchanged");
  const [profile, setProfile] = useState(false);
  const [history, setHistory] = useState<SentEmail[] | null>(null);
  const [openEmail, setOpenEmail] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState("");
  const [sendError, setSendError] = useState("");

  /** Copies a piece of the draft and says so, optionally opening webmail in a
   *  new tab so the paste has somewhere to land. */
  async function take(label: string, text: string, openWebmail = false) {
    if (openWebmail) {
      // Opened before the await so it counts as part of the click and does not
      // get caught by the popup blocker.
      window.open(WEBMAIL_URL, "_blank", "noopener,noreferrer");
    }
    const ok = await copyText(text);
    setCopied(ok ? label : "copy failed");
    window.setTimeout(() => setCopied(""), 2500);
  }

  /** Everything already sent to them, loaded when the profile is opened
   *  rather than with the list: thirty rows of email bodies is a lot to carry
   *  for a panel that is usually closed. */
  async function openProfile() {
    const next = !profile;
    setProfile(next);
    if (!next || history) return;
    try {
      const res = await fetch(`/api/admin/prospects/email?id=${p.id}`);
      const data = (await res.json().catch(() => null)) as { sent?: SentEmail[] } | null;
      setHistory(data?.sent ?? []);
    } catch {
      setHistory([]);
    }
  }

  /** Calls off the day 3 and day 5 emails for this one business. */
  async function stopFollowUps() {
    setSeq("stopped");
    await fetch("/api/admin/prospects/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: p.id, action: "stop" }),
    }).catch(() => null);
  }

  /** Sends the draft through the site's own mail server, so this works from
   *  any device signed into the admin page with no mail client set up. */
  async function send() {
    if (!compose || sending) return;
    setSending(true);
    setSendError("");
    try {
      const res = await fetch("/api/admin/prospects/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: p.id, subject: compose.subject, body: compose.body }),
      });
      const data = (await res.json().catch(() => null)) as
        | {
            sent?: boolean;
            recipient?: string;
            filedInSent?: boolean;
            message?: string;
            error?: string;
          }
        | null;
      if (!res.ok || !data?.sent) {
        setSendError(data?.message ?? data?.error ?? "Could not send it.");
        return;
      }
      setSent(
        data.filedInSent === false
          ? `Sent to ${data.recipient ?? p.email} — but no copy went in your Sent folder`
          : `Sent to ${data.recipient ?? p.email}`,
      );
      setSeq("started");
      setCompose(null);
      onContacted(p.id, p.name);
    } catch {
      setSendError("Could not reach the server.");
    } finally {
      setSending(false);
    }
  }

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
        {/*
          The site link sits right after the phone and is styled as something
          to press, because on a call the two things wanted in the first three
          seconds are the number and a look at their website. Buried in the
          grey line with the address it read as plain text and nobody clicked
          it.
        */}
        {p.website && (
          <a
            href={p.website}
            target="_blank"
            rel="noreferrer noopener"
            className="max-w-[18rem] truncate rounded-lg border border-border px-2.5 py-1 font-semibold text-foreground hover:border-brand-pink"
          >
            {p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
          </a>
        )}
        {p.mapsUri && (
          <a
            href={p.mapsUri}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:border-brand-pink hover:text-foreground"
          >
            Maps ↗
          </a>
        )}
        {p.email && (
          <>
            <button
              type="button"
              onClick={() => take("address copied", p.email)}
              className="max-w-[16rem] truncate font-semibold hover:text-foreground"
              title={`${p.email} — click to copy`}
            >
              {p.email}
            </button>
            <button
              type="button"
              onClick={() => setCompose(compose ? null : buildDraft(1, p, p.unsubscribeUrl))}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:border-brand-pink hover:text-foreground"
              title="Write and send an email to them from here"
            >
              {compose ? "Close draft" : "Write email"}
            </button>
            {sent && <span className="font-semibold text-emerald-500">{sent}</span>}
            {!sent && p.emailedAt && (
              <span title={p.emailedAt}>emailed {p.emailedAt.slice(0, 10)}</span>
            )}
            {/* Where the three-email sequence has got to. The first one only
                ever goes out by hand; these two follow on their own unless
                something here says they should not. */}
            {p.unsubscribedAt ? (
              <span className="font-semibold text-red-500">unsubscribed</span>
            ) : p.repliedAt ? (
              <span className="font-semibold text-emerald-500">replied — follow-ups stopped</span>
            ) : seq === "stopped" || (seq === "unchanged" && p.sequenceStoppedAt) ? (
              <span title={p.sequenceStopReason}>
                follow-ups off{p.sequenceStopReason ? ` (${p.sequenceStopReason})` : ""}
              </span>
            ) : seq === "started" || p.sequenceStartedAt ? (
              <>
                <span className="font-semibold text-foreground">follow-ups on · day 3 + 5</span>
                <button
                  type="button"
                  onClick={stopFollowUps}
                  className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:border-brand-pink hover:text-foreground"
                  title="Cancel the day 3 and day 5 emails for this business"
                >
                  Stop
                </button>
              </>
            ) : null}
            {copied && <span className="font-semibold text-brand-pink">{copied}</span>}
          </>
        )}
        {/* How this one came to be on the contacted list: an email, a status
            set by hand, or both. Without it the Contacted tab says that
            something happened but never what. */}
        {p.calledAt && p.status !== "new" && (
          <span className="font-semibold text-foreground" title={p.calledAt}>
            {STATUS_LABEL[p.status]} · {p.calledAt.slice(0, 10)}
          </span>
        )}
        {p.category && <span>{p.category}</span>}
        {p.address && <span className="truncate">{p.address}</span>}
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

      {/* What the scanner found, which is the reason to ring them. Shown
          before the status buttons because it is what you read out loud. */}
      {p.findings.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 rounded-xl border border-border bg-background px-3 py-2.5">
          {p.findings.map((f) => (
            <li key={f.label} className="text-[11px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">{f.label}</span>
              {f.why ? ` — ${f.why}` : ""}
            </li>
          ))}
        </ul>
      )}

      {/* The draft itself, on the page rather than in a mail client.
          Editable before it goes, because the whole point is that a person
          reads it first — and sent by the server, so it works from a phone
          with nothing set up on it. */}
      {compose && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-background px-3 py-3">
          <div className="text-[11px] font-semibold text-muted">
            To <span className="text-foreground">{p.email}</span> · from{" "}
            <span className="text-foreground">{siteConfig.email}</span>
          </div>
          {/* Said here because pressing send does two things, and the second
              one happens days later when nobody is watching. */}
          <div className="text-[11px] leading-relaxed text-muted">
            Sending this starts the sequence: a longer follow-up goes on day 3 and a last one on
            day 5, both with an unsubscribe link. They stop on their own the moment this business
            replies, unsubscribes, or you mark them interested, not interested or a customer.
          </div>
          <input
            value={compose.subject}
            onChange={(e) => setCompose({ ...compose, subject: e.target.value })}
            placeholder="Subject"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-brand-pink"
          />
          <textarea
            value={compose.body}
            onChange={(e) => setCompose({ ...compose, body: e.target.value })}
            rows={12}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-relaxed text-foreground outline-none focus:border-brand-pink"
          />
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={send}
              disabled={sending}
              className="rounded-lg bg-brand-pink px-3 py-1.5 font-bold text-white disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send it"}
            </button>
            <button
              type="button"
              onClick={() => setCompose(null)}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold text-muted hover:text-foreground"
            >
              Cancel
            </button>
            {/* Kept for the times you would rather send it yourself: the
                draft goes to the clipboard and webmail opens next to it. */}
            <button
              type="button"
              onClick={() => take("draft copied", compose.body, true)}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold text-muted hover:text-foreground"
              title="Copies the message and opens Hostinger webmail in a new tab"
            >
              Copy + webmail
            </button>
            <a
              href={mailtoHref(p.email, compose.subject, compose.body)}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold text-muted hover:text-foreground"
              title="Opens the mail app on your phone with the draft filled in"
            >
              Mail app
            </a>
            {sendError && <span className="font-semibold text-red-500">{sendError}</span>}
          </div>
        </div>
      )}

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
          onClick={openProfile}
          className="ml-auto text-[11px] font-semibold text-muted hover:text-foreground"
        >
          {profile ? "Close profile" : "Profile"}
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[11px] font-semibold text-muted hover:text-foreground"
        >
          {p.notes && !open ? "Notes ✓" : open ? "Close notes" : "Notes"}
        </button>
      </div>

      {/* The profile: everything known about this business in one place, and
          what to do about it. The call list answers who to ring; this
          answers what happened last time and what happens next. */}
      {profile && (
        <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-background px-3 py-3 text-[11px]">
          <div>
            <div className="font-bold uppercase tracking-wide text-muted">Next move</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground">
              {nextMove(p, history ?? [])}
            </p>
          </div>

          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <Fact label="Phone" value={p.phone || "—"} />
            <Fact label="Email" value={p.email || "none published"} />
            <Fact label="Listing" value={`${p.reviews} reviews${p.rating ? ` · ${p.rating}★` : ""}`} />
            <Fact
              label="Site score"
              value={p.siteScore === null ? "not scanned" : `${p.siteScore.toFixed(1)} / 10`}
            />
            <Fact label="Scanned" value={p.scannedAt ? p.scannedAt.slice(0, 10) : "never"} />
            <Fact label="First called" value={p.calledAt ? p.calledAt.slice(0, 10) : "not yet"} />
            <Fact label="Town" value={p.town || "—"} />
            <Fact label="Found under" value={p.foundFor || p.industry || "—"} />
            <Fact
              label="Sequence"
              value={
                p.unsubscribedAt
                  ? "unsubscribed"
                  : p.repliedAt
                    ? `replied ${p.repliedAt.slice(0, 10)}`
                    : p.sequenceStoppedAt
                      ? `stopped${p.sequenceStopReason ? ` — ${p.sequenceStopReason}` : ""}`
                      : p.sequenceStartedAt
                        ? `running since ${p.sequenceStartedAt.slice(0, 10)}`
                        : "not started"
              }
            />
          </div>

          <div>
            <div className="font-bold uppercase tracking-wide text-muted">
              Emails sent{history ? ` (${history.length})` : ""}
            </div>
            {history === null ? (
              <p className="mt-1 text-muted">Loading…</p>
            ) : history.length === 0 ? (
              <p className="mt-1 text-muted">Nothing sent to them yet.</p>
            ) : (
              <ul className="mt-1 flex flex-col gap-1">
                {history.map((e, i) => (
                  <li key={`${e.sentAt}-${i}`} className="rounded-lg border border-border px-2.5 py-1.5">
                    <button
                      type="button"
                      onClick={() => setOpenEmail(openEmail === i ? null : i)}
                      className="flex w-full flex-wrap items-center gap-2 text-left"
                    >
                      <span className="font-bold text-foreground">Email {e.step}</span>
                      <span className="text-muted">{e.sentAt.slice(0, 10)}</span>
                      <span
                        className={
                          e.status === "sent"
                            ? "font-semibold text-emerald-500"
                            : "font-semibold text-red-500"
                        }
                      >
                        {e.status}
                      </span>
                      <span className="truncate text-muted">{e.subject}</span>
                      <span className="ml-auto text-muted">{openEmail === i ? "−" : "+"}</span>
                    </button>
                    {openEmail === i && (
                      <pre className="mt-2 whitespace-pre-wrap font-sans leading-relaxed text-muted">
                        {e.body}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

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
