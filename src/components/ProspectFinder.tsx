"use client";

import { useEffect, useState } from "react";
import { STATUSES, type Prospect, type ProspectStatus } from "@/lib/prospect-types";
import { industries } from "@/content/industries";
import { areaGroups } from "@/content/areas";
import { siteConfig } from "@/lib/site-config";
import { outreachLine, servicesLine } from "@/lib/outreach-lines";

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
 * The signature on the bottom of every draft.
 *
 * Built from site-config rather than typed out here, so a profile that goes
 * live — Facebook, a Google review link — appears in the signature the moment
 * its URL is filled in there, and an empty one is simply left out rather than
 * sending people to a page that does not exist.
 *
 * The postal address is on it deliberately. A cold email from a business with
 * no address behind it reads as a mailshot to a person and scores as one with
 * a spam filter.
 */
const SIGNATURE: string[] = [
  "Walid",
  siteConfig.name,
  `${siteConfig.phoneDisplay} · ${siteConfig.email}`,
  siteConfig.url,
  ...(siteConfig.social.linkedin ? [`LinkedIn: ${siteConfig.social.linkedin}`] : []),
  ...(siteConfig.social.instagram ? [`Instagram: ${siteConfig.social.instagram}`] : []),
  ...(siteConfig.social.facebook ? [`Facebook: ${siteConfig.social.facebook}`] : []),
  `${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city} ${siteConfig.address.postcode}`,
];

/**
 * The draft that gets sent to a prospect: subject, body, and his signature.
 *
 * Written as a person writes, not as the report reads. The findings go
 * through outreachLine, which turns the audit's shorthand into a sentence the
 * owner of a nail salon can read without knowing what a meta description is,
 * and what we actually do is said out loud rather than left to be guessed at
 * from a link.
 *
 * Deliberately a draft and never a send-without-looking. This is one person
 * writing to one business about their own website, which he reads before it
 * goes — not a campaign fired from a server.
 */
function buildDraft(p: Prospect): { subject: string; body: string } {
  const lines = [
    `Hi,`,
    ``,
    `I run a marketing agency in London and I had a look at the ${p.name} website.`,
    ``,
    ...(p.findings.length
      ? [
          p.findings.length === 1 ? `One thing stood out:` : `A few things stood out:`,
          ``,
          ...p.findings.flatMap((f) => [`- ${outreachLine(f)}`, ``]),
        ]
      : []),
    `Fixing that sort of thing is part of what we do. The rest of it is ${servicesLine()} — so whether the problem is that not enough people are finding you or that the ones who do are not getting in touch, it is the same conversation.`,
    ``,
    `Happy to send over the full report on your site. It is free, there is no obligation, and it is yours to act on with or without us.`,
    ``,
    // Said plainly because it is the objection, and because an offer to be
    // compared is worth more than a claim to be better: one can be checked
    // in a minute, the other is what every email of this kind says.
    `If you are already working with someone, that is fine and I am not trying to talk you out of it. Tell me what you are paying and I will tell you straight whether we would beat it. Our prices are on the website either way.`,
    ``,
    // The owner saying he will take the call himself is the one thing in
    // here an agency with a sales floor cannot say back.
    `Reply here or give me a ring on ${siteConfig.phoneDisplay}. If it is easier to go through it properly, I do these calls myself — I am Walid Shah, I own the business — and we can sit on a Google Meet for twenty minutes and go through what is worth doing for you.`,
    ...(siteConfig.demoBookingUrl ? [``, `You can pick a time straight out of my diary here: ${siteConfig.demoBookingUrl}`] : []),
    ``,
    `If you would rather I did not email you again, just reply and say so.`,
    ``,
    ...SIGNATURE,
  ];
  return {
    // Written to them, not to us. The old subject was the internal shorthand
    // off the call list — "Melody Nail Spa - meta description" — which reads
    // like a support ticket landing in a stranger's inbox.
    subject: p.findings.length
      ? `${p.name} — a couple of things on your website`
      : `${p.name} — your website`,
    body: lines.join("\n"),
  };
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
  async function fetchList(): Promise<Prospect[]> {
    const params = new URLSearchParams({
      maxReviews: String(maxReviews),
      minRating: String(minRating),
      status,
      industry,
      sort,
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
  }, [maxReviews, minRating, status, industry, sort]);

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
      setProspects(await fetchList());
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
    try {
      setProspects(await fetchList());
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
        body: JSON.stringify({ query: text, maxReviews, industry }),
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

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Industry</p>
        <div className="mt-2 flex flex-wrap gap-2">
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
            : "Pick one to filter the list, and to get its trades as one-click searches."}
        </p>
      </div>

      {industry && (
        <div className="mt-4 rounded-xl border border-border bg-surface p-4">
          <label htmlFor="prospect-town" className="mb-1.5 block text-xs text-muted">
            Town or area to search in
          </label>
          <input
            id="prospect-town"
            value={town}
            onChange={(e) => setTown(e.target.value)}
            placeholder="Romford"
            className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand-pink"
          />

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

      <div className="mt-7 flex flex-wrap items-end gap-4 border-t border-border pt-6">
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
  const [copied, setCopied] = useState("");
  const [compose, setCompose] = useState<{ subject: string; body: string } | null>(null);
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
        | { sent?: boolean; recipient?: string; message?: string; error?: string }
        | null;
      if (!res.ok || !data?.sent) {
        setSendError(data?.message ?? data?.error ?? "Could not send it.");
        return;
      }
      setSent(`Sent to ${data.recipient ?? p.email}`);
      setCompose(null);
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
              onClick={() => setCompose(compose ? null : buildDraft(p))}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:border-brand-pink hover:text-foreground"
              title="Write and send an email to them from here"
            >
              {compose ? "Close draft" : "Write email"}
            </button>
            {sent && <span className="font-semibold text-emerald-500">{sent}</span>}
            {!sent && p.emailedAt && (
              <span title={p.emailedAt}>emailed {p.emailedAt.slice(0, 10)}</span>
            )}
            {copied && <span className="font-semibold text-brand-pink">{copied}</span>}
          </>
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
