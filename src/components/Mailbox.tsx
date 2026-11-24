"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { REGIONS, REGION_INFO, type Region } from "@/lib/regions";
import type { SentEmail, MailboxCounts } from "@/lib/mailbox-view";

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

type InboxMessage = {
  uid: number;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  at: string;
  seen: boolean;
  business: string;
  prospectId: number | null;
  region: Region | null;
};

type Payload = {
  sent: SentEmail[];
  counts: MailboxCounts | null;
  /** Null means the mailbox could not be read at all. */
  inbox: InboxMessage[] | null;
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

  // The inbox is not filtered by country on the server, because a message
  // that has arrived does not carry one. It is filtered here, by whose
  // business sent it, and anything unmatched is always shown: a reply
  // from an address we do not recognise is still a reply.
  const inbox = (data?.inbox ?? []).filter(
    (m) => pick === "both" || m.region === null || m.region === pick,
  );

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

      <section id="inbox" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Who has written back</h2>
        <p className="mt-1 text-xs text-muted">
          Read from the mailbox itself every time you open this, so it is whatever is in there
          now. A name in bold is a business we have emailed.
        </p>

        {data?.inbox === null ? (
          <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
            The mailbox did not answer, so this list is not showing. That is the same connection
            the follow-ups use to check for replies before sending — System check will say why.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-1.5">
            {!loading && inbox.length === 0 && (
              <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                Nothing in the inbox for this list.
              </li>
            )}
            {inbox.map((message) => (
              <li
                key={message.uid}
                className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border bg-surface px-4 py-2.5 text-xs ${
                  message.business ? "border-sky-500/50" : "border-border"
                }`}
              >
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
                <span className="text-muted">{message.from}</span>
                <span className="min-w-0 flex-1 truncate text-foreground">{message.subject}</span>
                {message.region && (
                  <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted">
                    {REGION_INFO[message.region].label}
                  </span>
                )}
                <span className="shrink-0 tabular-nums text-muted">{when(message.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="sent" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">What has been sent</h2>
        <p className="mt-1 text-xs text-muted">
          Newest first. The number against each one is where that business has got to in the three
          emails, so <b className="text-foreground">1 of 3</b> means two more are still to go.
        </p>

        <ul className="mt-4 flex flex-col gap-1.5">
          {!loading && (data?.sent.length ?? 0) === 0 && (
            <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              Nothing sent on this list yet.
            </li>
          )}
          {data?.sent.map((mail) => (
            <li
              key={mail.id}
              className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border bg-surface px-4 py-2.5 text-xs ${
                mail.failed
                  ? "border-red-500/50"
                  : mail.dead
                    ? "border-amber-500/50"
                    : mail.replied
                      ? "border-sky-500/50"
                      : "border-border"
              }`}
            >
              {mail.prospectId ? (
                <Link
                  href={`/admin/prospects/${mail.prospectId}`}
                  className="font-bold text-foreground underline decoration-dotted"
                >
                  {mail.to}
                </Link>
              ) : (
                <span className="font-bold text-foreground">{mail.to}</span>
              )}

              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted">
                {mail.kind === "audit" ? `audit ${mail.step}` : `${mail.step} of 3`}
              </span>

              <span className="min-w-0 flex-1 truncate text-muted">{mail.subject}</span>

              {mail.failed && (
                <span className="shrink-0 font-semibold text-red-500">did not send</span>
              )}
              {!mail.failed && mail.dead && (
                <span className="shrink-0 font-semibold text-amber-500">address bounces</span>
              )}
              {!mail.failed && !mail.dead && mail.replied && (
                <span className="shrink-0 font-semibold text-sky-500">replied</span>
              )}
              {!mail.failed && !mail.dead && !mail.replied && mail.ofThree >= 3 && (
                <span className="shrink-0 font-semibold text-brand-pink">all three gone — ring</span>
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
            </li>
          ))}
        </ul>
      </section>
    </div>
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
