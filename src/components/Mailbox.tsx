"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { REGIONS, REGION_INFO, type Region } from "@/lib/regions";
import type { SentEmail, MailboxCounts } from "@/lib/mailbox-view";
import type { QueuedBatch } from "@/lib/sending-queue";
import { PER_SLOT, slotWords } from "@/lib/sending-hours";

/**
 * The mailbox, as a page.
 *
 * Walid's complaint was specific and correct: there was nowhere to see
 * how many emails had gone out. The number existed on the overview, as a
 * line on a chart, which is a thing you read by squinting at it.
 *
 * So the counts are first and they are plain. Then who has written back,
 * read live from the mailbox rather than from a table, because there is
 * no table — nothing copies incoming mail into the database and a second
 * record of an inbox is a record that is wrong whenever the job filling
 * it has not run. Then what was sent, with 1 of 3 against each business
 * so the state of a sequence is readable at a glance.
 */

/** Worked out once: the two batch times, written out. */
const SLOT_WORDS = slotWords();

type Folder = "reply" | "sent" | "bounced" | "other";

type InboxMessage = {
  uid: number;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  at: string;
  seen: boolean;
  /** The first few lines of what they actually said. Replies only. */
  said: string;
  folder: Folder;
  business: string;
  prospectId: number | null;
  region: Region | null;
};

const FOLDER_LABEL: Record<Folder, string> = {
  reply: "Replies",
  sent: "Sent",
  bounced: "Bounced",
  other: "Everything else",
};

const FOLDER_NOTE: Record<Folder, string> = {
  reply: "People writing to us. Answer these.",
  sent: "Everything we have sent. Open one to read exactly what went.",
  bounced: "Mail that came back. The address is dead and the sequence has stopped.",
  other: "DMARC reports, TikTok, Trustpilot and the rest. Nothing to do here.",
};

type Payload = {
  sent: SentEmail[];
  counts: MailboxCounts | null;
  /** Null means the mailbox could not be read at all. */
  inbox: InboxMessage[] | null;
  /** What is still to go out, and when. Null means the forecast failed. */
  queued: QueuedBatch[] | null;
};

function when(iso: string): string {
  const at = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(at.getTime())) return iso.slice(0, 16);
  const today = new Date().toDateString() === at.toDateString();
  return today
    ? at.toTimeString().slice(0, 5)
    : `${at.toDateString().slice(4, 10)} ${at.toTimeString().slice(0, 5)}`;
}

export function Mailbox({ regions }: { regions: Region[] }) {
  const [pick, setPick] = useState<Region | "both">(regions.length > 1 ? "both" : regions[0]);
  /** Which pile of the inbox is on screen. Replies first, always. */
  const [folder, setFolder] = useState<Folder>("reply");
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /** Bumped to ask again without changing anything else. */
  const [tick, setTick] = useState(0);

  // Nothing is set synchronously here: the state only moves once the
  // request comes back. Setting it on the way in is a render inside a
  // render, which React now warns about and which this page does not
  // need — the spinner is turned on by whatever asked for the reload.
  useEffect(() => {
    let cancelled = false;
    const query = pick === "both" ? "" : `?region=${pick}`;

    fetch(`/api/admin/emails${query}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("bad");
        return (await res.json()) as Payload;
      })
      .then((body) => {
        if (cancelled) return;
        setData(body);
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't reach the server.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pick, tick]);

  function reload() {
    setLoading(true);
    setTick((n) => n + 1);
  }

  function choose(next: Region | "both") {
    if (next === pick) return;
    setLoading(true);
    setPick(next);
  }

  const counts = data?.counts;
  // Both means everything out of the mailbox, audit follow-ups included:
  // the question is how much this address has sent today, and the
  // mailbox's own limit does not care which list it came from. One
  // country means that country's outreach only.
  const sentToday = !counts ? 0 : pick === "both" ? sum(counts.today) : (counts.today[pick] ?? 0);

  const all = data?.inbox ?? [];

  /**
   * A message that has arrived carries no country of its own. It gets
   * one from the business that sent it, where we recognise them.
   *
   * Choosing a country used to leave unmatched messages in, which meant
   * UK and US showed almost the same list and the filter looked broken.
   * It now shows only what it can place, and says how many it could
   * not, so the choice visibly does something and nothing disappears
   * without being accounted for.
   */
  const inRegion = (m: InboxMessage) => pick === "both" || m.region === pick;
  const unplaced = pick === "both" ? 0 : all.filter((m) => m.region === null).length;

  // Counted the same way the list is filtered. A tab reading "Replies 2"
  // above a list holding one is a tab nobody trusts again.
  const byFolder = (which: Folder) => all.filter((m) => m.folder === which && inRegion(m));
  const countIn = (which: Folder) => byFolder(which).length;
  const shown = byFolder(folder);

  // Sent is a folder now rather than a separate section at the bottom of
  // the page. Walid's point: the thing you most often want is what we
  // said to somebody, and it was the furthest thing from the top.
  const sentShown = data?.sent ?? [];

  return (
    <div className="flex flex-col gap-10">
      <section id="counts" className="scroll-mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {regions.length > 1 && (
            <button
              type="button"
              onClick={() => choose("both")}
              className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${
                pick === "both"
                  ? "border-brand-pink bg-brand-pink/10 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              Both
            </button>
          )}
          {regions.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-bold ${
                pick === key
                  ? "border-brand-pink bg-brand-pink/10 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {REGION_INFO[key].name}
            </button>
          ))}
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="ml-auto rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-50"
          >
            {loading ? "Checking…" : "Check again"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Tile
            value={sentToday}
            label="Sent today"
            note={pick === "both" ? "both countries" : REGION_INFO[pick].name}
          />
          <Tile
            value={counts ? (pick === "both" ? sum(counts.week) : (counts.week[pick] ?? 0)) : 0}
            label="Sent this week"
            note="last 7 days"
          />
          <Tile
            value={counts?.repliesWeek ?? 0}
            label="Wrote back"
            note="last 7 days, both countries"
          />
          <Tile
            value={counts?.failedWeek ?? 0}
            label="Failed to send"
            note={`${counts?.deadAddresses ?? 0} addresses proved dead`}
            warn={(counts?.failedWeek ?? 0) > 0}
          />
        </div>

        {/* Per country on one line, because the question behind the page
            is usually which of the two is actually moving. */}
        {counts && regions.length > 1 && (
          <p className="mt-3 text-xs text-muted">
            Today:{" "}
            {REGIONS.filter((r) => regions.includes(r))
              .map((r) => `${REGION_INFO[r].label} ${counts.today[r] ?? 0}`)
              .join(" · ")}
            {counts.today.audit ? ` · audit follow-ups ${counts.today.audit}` : ""}
          </p>
        )}

        {/* Which mailbox it all left from. One line while there is one
            address, a real list the moment there are two. */}
        {counts && counts.byFrom.length > 0 && (
          <p className="mt-1.5 text-xs text-muted">
            Sent from{" "}
            {counts.byFrom.map((f, i) => (
              <span key={f.from}>
                {i > 0 && " · "}
                <b className="text-foreground">{f.from}</b> ({f.n})
              </span>
            ))}
          </p>
        )}

        {/* Hostinger's free plan caps outbound at 100 a day across every
            address on the domain. Worth seeing next to the day's count
            rather than finding out when sends start failing. */}
        <p className="mt-1.5 text-[11px] text-muted">
          The mailbox allows 100 outgoing emails a day in total, shared across both countries and
          anything you send by hand.
        </p>

        {error && (
          <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-2.5 text-sm text-foreground">
            {error}
          </p>
        )}
      </section>

      {/* What has not gone yet.
          Above the inbox on purpose. Everything below this point is a
          record of things that already happened and cannot be changed;
          this is the one part of the page where seeing it early is worth
          something, because a batch you can see before it leaves is a
          batch you can still stop. */}
      <section id="queued" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Going out next</h2>
        <p className="mt-1 text-xs text-muted">
          Two batches of {PER_SLOT} a day for each country, at {SLOT_WORDS} in that country&rsquo;s
          own time, so nothing lands in the middle of somebody&rsquo;s night. These are the
          businesses next in line. Anyone who replies or unsubscribes before then drops out.
        </p>

        {data?.queued === null && (
          <p className="mt-3 text-xs text-muted">
            Could not work out what is next. The list itself is fine; this panel is the only
            thing missing.
          </p>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {(data?.queued ?? [])
            .filter((b) => pick === "both" || b.region === pick)
            .map((batch) => (
              <QueueCard key={batch.region} batch={batch} />
            ))}
        </div>
      </section>

      <section id="inbox" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">The inbox</h2>
        <p className="mt-1 text-xs text-muted">
          Read from the mailbox itself every time you open this, so it is whatever is in there
          now, with everything we have sent alongside it. Sorted, because most of what arrives
          is machinery.
        </p>

        {/* Three piles rather than one list. A month of the real inbox
            held nine bounce reports, sixteen DMARC reports and a steady
            drip from TikTok and Trustpilot against a handful of actual
            replies, and showing them as one list buried the only part
            that matters. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {(["reply", "sent", "bounced", "other"] as const).map((key) => {
            const n = key === "sent" ? sentShown.length : countIn(key);
            const here = folder === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFolder(key)}
                title={FOLDER_NOTE[key]}
                className={`rounded-lg border px-3.5 py-2 text-xs font-bold ${
                  here
                    ? "border-brand-pink bg-brand-pink/10 text-foreground"
                    : "border-border text-muted hover:text-foreground"
                }`}
              >
                {FOLDER_LABEL[key]}
                <span
                  className={`ml-2 tabular-nums ${
                    key === "reply" && n > 0 ? "text-brand-pink" : "text-muted"
                  }`}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-muted">{FOLDER_NOTE[folder]}</p>

        {folder === "sent" ? (
          <ul className="mt-4 flex flex-col gap-1.5">
            {!loading && sentShown.length === 0 && (
              <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                Nothing sent on this list yet.
              </li>
            )}
            {sentShown.map((mail) => (
              <SentRow key={mail.id} mail={mail} />
            ))}
          </ul>
        ) : data?.inbox === null ? (
          <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
            The mailbox did not answer, so this list is not showing. That is the same connection
            the follow-ups use to check for replies before sending — System check will say why.
          </p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-1.5">
              {!loading && shown.length === 0 && (
                <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                  Nothing in {FOLDER_LABEL[folder].toLowerCase()} for this list.
                </li>
              )}
              {shown.map((message) => (
                <li
                  key={message.uid}
                  className={`rounded-xl border bg-surface px-4 py-3 text-xs ${
                    message.folder === "bounced"
                      ? "border-amber-500/50"
                      : message.business
                        ? "border-sky-500/60"
                        : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {message.business ? (
                      <Link
                        href={`/admin/prospects/${message.prospectId}`}
                        className="font-bold text-foreground underline decoration-dotted"
                      >
                        {message.business}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {message.fromName || message.from}
                      </span>
                    )}
                    <span className="truncate text-muted">{message.from}</span>
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {message.subject}
                    </span>
                    {message.region && (
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted">
                        {REGION_INFO[message.region].label}
                      </span>
                    )}
                    <span className="shrink-0 tabular-nums text-muted">{when(message.at)}</span>
                  </div>

                  {/* What they said, which was the whole point of asking
                      who had written back. Only fetched for replies. */}
                  {message.said && (
                    <p className="mt-2 border-l-2 border-border pl-3 leading-relaxed text-foreground">
                      {message.said}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {/* Nothing vanishes without being accounted for. */}
            {unplaced > 0 && (
              <p className="mt-3 text-[11px] text-muted">
                {unplaced} message{unplaced === 1 ? "" : "s"} came from addresses that do not
                match a business on either list, so {unplaced === 1 ? "it is" : "they are"} only
                under <b className="text-foreground">Both</b>.
              </p>
            )}
          </>
        )}
      </section>

    </div>
  );
}

/**
 * One sent email, which opens to show exactly what went.
 *
 * The text is fetched when it is opened rather than with the list. A
 * hundred and twenty bodies is most of a megabyte to answer a question
 * nobody has asked yet, and a slow list is a list nobody scrolls.
 */
function SentRow({ mail }: { mail: SentEmail }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || body !== null) return;
    try {
      const res = await fetch(`/api/admin/emails?message=${encodeURIComponent(mail.id)}`);
      if (!res.ok) throw new Error("bad");
      const found = (await res.json()) as { body?: string };
      // A response without a body is a failure, not an empty email. The
      // first version set the text to undefined and rendered a blank
      // panel with no explanation, which looks exactly like an email
      // that said nothing.
      if (typeof found.body !== "string" || found.body.trim() === "") {
        throw new Error("empty");
      }
      setBody(found.body);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }

  return (
    <li
      className={`rounded-xl border bg-surface text-xs ${
        mail.failed
          ? "border-red-500/50"
          : mail.dead
            ? "border-amber-500/50"
            : mail.replied
              ? "border-sky-500/60"
              : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3 text-left"
      >
        <span className="font-bold text-foreground">{mail.to}</span>

        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
          {mail.kind === "audit" ? `audit ${mail.step}` : `${mail.step} of 3`}
        </span>

        <span className="min-w-0 flex-1 truncate text-muted">{mail.subject}</span>

        {mail.failed && <span className="shrink-0 font-semibold text-red-500">did not send</span>}
        {!mail.failed && mail.dead && (
          <span className="shrink-0 font-semibold text-amber-500">address bounces</span>
        )}
        {!mail.failed && !mail.dead && mail.replied && (
          <span className="shrink-0 font-semibold text-sky-500">replied</span>
        )}
        {!mail.failed && !mail.dead && !mail.replied && mail.ofThree >= 3 && (
          <span className="shrink-0 font-semibold text-brand-pink">all three gone — ring</span>
        )}

        {/* Which of the day's emails had a rebuilt site behind it, and
            whether the business has looked. The whole reason to open
            this page the afternoon after a send. */}
        {mail.preview && mail.preview.opens > 0 && (
          <span className="shrink-0 rounded-full border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500">
            opened their preview {mail.preview.opens}×
          </span>
        )}
        {mail.preview && mail.preview.opens === 0 && (
          <span className="shrink-0 rounded-full border border-sky-500/50 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
            site preview sent
          </span>
        )}

        {mail.region && (
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted">
            {REGION_INFO[mail.region].label}
          </span>
        )}
        <span className="shrink-0 text-muted" title={`from ${mail.from}`}>
          {mail.from.split("@")[0]}@
        </span>
        <span className="shrink-0 tabular-nums text-muted">{when(mail.sentAt)}</span>
        <span className={`shrink-0 text-muted transition ${open ? "rotate-90" : ""}`}>›</span>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3">
          <p className="text-[11px] text-muted">
            To {mail.recipient} · from {mail.from}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{mail.subject}</p>
          {failed ? (
            <p className="mt-2 text-muted">That email could not be read back.</p>
          ) : body === null ? (
            <p className="mt-2 text-muted">Opening…</p>
          ) : (
            // Whitespace preserved, because these are written as plain
            // text with deliberate line breaks and reflowing them makes
            // a careful email look like a paragraph of mush.
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-foreground">{body}</p>
          )}
        </div>
      )}

      {/* Links out of a button would be a button inside a button, so the
          way to the business sits under the summary instead. */}
      {open && mail.prospectId && (
        <div className="border-t border-border px-4 py-2">
          <Link
            href={`/admin/prospects/${mail.prospectId}`}
            className="text-[11px] font-semibold text-brand-pink underline decoration-dotted"
          >
            Open {mail.to} on the call list
          </Link>
        </div>
      )}
    </li>
  );
}

function sum(by: Record<string, number>): number {
  return Object.values(by).reduce((n, v) => n + v, 0);
}

function Tile({
  value,
  label,
  note,
  warn,
}: {
  value: number;
  label: string;
  note: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 ${
        warn ? "border-red-500/40" : "border-border"
      }`}
    >
      <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted">{note}</p>
    </div>
  );
}

/**
 * One country's next batch.
 *
 * The time comes first and it is their time, because that is the whole
 * change: the number on this card is not the clock on the wall of
 * whoever is reading it. A batch waiting on the scheduler says so rather
 * than naming an hour, since the hour has already passed and the only
 * honest answer is "the next time the cron runs".
 */
function QueueCard({ batch }: { batch: QueuedBatch }) {
  const info = REGION_INFO[batch.region];
  const when =
    batch.day === "now"
      ? "Waiting on the next run"
      : batch.day === "today"
        ? `Goes at ${batch.at} their time`
        : `Nothing more today — next at ${batch.at} their time`;

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground">{info.name}</h3>
        <span className="text-xs tabular-nums text-muted">{batch.theirTime} there</span>
      </div>

      <p
        className={`mt-1 text-xs font-bold ${
          batch.day === "now" ? "text-brand-pink" : "text-muted"
        }`}
      >
        {when}
      </p>

      {batch.businesses.length === 0 ? (
        <p className="mt-4 text-xs text-muted">
          Nobody is queued for this batch.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted">
            {batch.businesses.length} of a possible {batch.room} · {batch.links} with a rebuilt
            page
          </p>

          <ol className="mt-3 flex flex-col gap-1.5">
            {batch.businesses.map((b, i) => (
              <li key={b.id} className="flex items-baseline gap-2 text-xs">
                <span className="w-5 shrink-0 tabular-nums text-muted">{i + 1}</span>
                <Link
                  href={`/admin/prospects/${b.id}`}
                  className="min-w-0 flex-1 truncate font-bold text-foreground hover:text-brand-pink"
                >
                  {b.name}
                </Link>
                {b.town && <span className="shrink-0 text-muted">{b.town}</span>}
                {/* Said on the row rather than counted at the top, because
                    "which ones get a page" is the question Walid actually
                    asks, and a total does not answer it. */}
                {b.link && (
                  <span className="shrink-0 rounded-md bg-brand-pink/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-pink">
                    with link
                  </span>
                )}
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Why the rest of the list is not in the queue.
          "Nobody is queued" on its own is not an answer: twenty-nine
          businesses with no email address, twenty-nine nobody has
          scanned, and twenty-nine already written to are three
          different problems with three different fixes, and the page
          used to show the same sentence for all of them. */}
      {batch.blocked && batch.blocked.total > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[11px] font-bold text-muted">
            {batch.blocked.total} not written to yet
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {[
              { n: batch.blocked.ready, say: "ready to go, waiting their turn" },
              { n: batch.blocked.noEmail, say: "no email address found — these need a call" },
              { n: batch.blocked.notScanned, say: "not scanned yet, so there is nothing to say" },
              { n: batch.blocked.noFindings, say: "scanned, nothing wrong with their site" },
              { n: batch.blocked.deadEmail, say: "address bounced" },
            ]
              .filter((r) => r.n > 0)
              .map((r) => (
                <li key={r.say} className="flex gap-2 text-[11px] text-muted">
                  <span className="w-7 shrink-0 text-right font-bold tabular-nums text-foreground">
                    {r.n}
                  </span>
                  <span>{r.say}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
