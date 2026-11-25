"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { DiaryItem } from "@/lib/calendar";
import { callsLeftWords } from "@/lib/calendar";
import { CALL_LABEL, CALL_OUTCOMES, type CallOutcome } from "@/lib/prospect-types";
import { noteProblem } from "@/lib/call-notes";
import { callbackProblem } from "@/lib/callback";

/**
 * The line across the top of the admin for somebody working a shift.
 *
 * Two jobs, and they belong together.
 *
 * The first is to say plainly that the session is being recorded. Walid
 * wanted the agent to know he is tracked; the honest way to do that is
 * to tell him on every screen rather than to have him find out from a
 * report he never sees. A tracking system somebody discovers is a
 * tracking system that costs you their trust.
 *
 * The second is to collect the half of a call that a phone system cannot
 * know. It writes down the length and whether it connected within
 * seconds of a call ending; what was actually said is only in the head
 * of the person who made it, and five minutes later it is already
 * vaguer. So they are asked while it is fresh, and until they answer the
 * count sits where they cannot miss it.
 */

type Pending = {
  id: number;
  prospectId: number;
  business: string;
  phone: string;
  seconds: number;
  outcome: string;
  at: string;
  confirmed: boolean;
};

/** How often to ask whether a call has finished. */
const EVERY = 20_000;

function since(iso: string): string {
  const started = new Date(iso.replace(" ", "T")).getTime();
  if (Number.isNaN(started)) return "";
  const mins = Math.max(0, Math.round((Date.now() - started) / 60000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${String(mins % 60).padStart(2, "0")}m`;
}

export function ShiftBar({
  name,
  signedInAt,
}: {
  name: string;
  /** When this sitting began, so the bar can say how long it has run. */
  signedInAt: string;
}) {
  const [pending, setPending] = useState<Pending[]>([]);
  const [open, setOpen] = useState<Pending | null>(null);
  const [tick, setTick] = useState(0);
  // The diary half: what has fallen due, and how much of the day is
  // left. Asked for on the same twenty-second beat as the calls.
  const [due, setDue] = useState<DiaryItem[]>([]);
  const [left, setLeft] = useState(0);
  // Reminders pushed away for this sitting. Kept in the browser rather
  // than written down, because "I have seen it" is not a fact about the
  // business — the promise is still owed and the calendar still says so.
  const [pushedAway, setPushedAway] = useState<string[]>([]);

  const look = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), EVERY);
    return () => clearInterval(timer);
  }, []);

  // Nothing is set on the way in — only once the answer comes back.
  // Setting state synchronously inside an effect is a render inside a
  // render, and this one runs every twenty seconds for a whole shift.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/calls")
      .then(async (res) => {
        if (!res.ok) throw new Error("no");
        return (await res.json()) as { pending: Pending[] };
      })
      .then((body) => {
        if (cancelled) return;
        setPending(body.pending);
        // Only a call the phone system has confirmed is over opens by
        // itself. A row written when Call was pressed might be a call
        // still in progress, and a box over the screen mid-sentence is
        // worse than no box — those wait in the count until the person
        // presses it. Anything older than the newest stays in the
        // count too rather than being thrown at them one after another.
        setOpen((current) => current ?? body.pending.find((c) => c.confirmed) ?? null);
      })
      .catch(() => {
        // A failed check is not worth saying anything about. The next
        // one is twenty seconds away.
      });

    fetch("/api/admin/diary")
      .then(async (res) => {
        if (!res.ok) throw new Error("no");
        return (await res.json()) as { due: DiaryItem[]; left: number };
      })
      .then((body) => {
        if (cancelled) return;
        setDue(body.due);
        setLeft(body.left);
      })
      .catch(() => {
        // Same as above: the next look is twenty seconds away.
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  const owed = due.filter((item) => !pushedAway.includes(item.id));
  const next = owed[0];

  return (
    <>
      <div
        className={`border-b px-5 py-2 text-xs sm:px-8 ${
          pending.length > 0
            ? "border-red-500/50 bg-red-500/10"
            : "border-border bg-surface"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-2 font-semibold text-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {name} — on shift {since(signedInAt)}
          </span>

          {/* Said out loud rather than buried in a policy. */}
          <span className="text-muted">
            Your calls, notes and time on here are recorded.
          </span>

          {/* How much of the day is still booked. Quiet, because it is
              not a problem — it is the answer to "what have I got
              left", which is otherwise a page you have to go and open. */}
          <Link
            href="/admin/calendar"
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            {callsLeftWords(left)}
          </Link>

          {pending.length > 0 && (
            <button
              type="button"
              onClick={() => setOpen(pending[0])}
              className="ml-auto rounded-lg border border-red-500/60 px-3 py-1 font-bold text-foreground"
            >
              {pending.length} call{pending.length === 1 ? "" : "s"} not written up — tell us what
              they said
            </button>
          )}
        </div>
      </div>

      {/* The reminder. A band under the bar rather than a box over the
          page: it has to be seen on every screen, and a modal that
          covers what somebody is reading mid-call is a modal they learn
          to close without looking. */}
      {next && (
        <div className="border-b border-brand-pink/50 bg-brand-pink/10 px-5 py-2 text-xs sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-bold text-foreground">
              Ring {next.title} now
            </span>
            <span className="text-muted">
              {next.time
                ? `You said ${next.time}${next.day ? ` on ${next.day.slice(8, 10)}/${next.day.slice(5, 7)}` : ""}`
                : "You said you would ring them back"}
            </span>
            {next.detail && <span className="truncate text-muted">{next.detail}</span>}
            <Link
              href={next.href}
              className="ml-auto rounded-lg border border-brand-pink px-3 py-1 font-bold text-foreground"
            >
              Open it
            </Link>
            <button
              type="button"
              onClick={() => setPushedAway((all) => [...all, next.id])}
              className="rounded-lg border border-border px-2.5 py-1 font-semibold text-muted hover:text-foreground"
              title="It stays on the calendar and comes back next time you sign in"
            >
              Not now
            </button>
            {owed.length > 1 && (
              <span className="text-[11px] text-muted">+{owed.length - 1} more owed</span>
            )}
          </div>
        </div>
      )}

      {open && (
        <CallPrompt
          call={open}
          outstanding={pending.length}
          onDone={() => {
            setPending((all) => all.filter((c) => c.id !== open.id));
            setOpen(null);
            void look();
          }}
          onLater={() => setOpen(null)}
        />
      )}
    </>
  );
}

/**
 * The question asked after a call.
 *
 * Deliberately short. Somebody who has just put the phone down is about
 * to dial the next one, and a form with eight fields is a form they
 * learn to dismiss — at which point the record is back to being
 * self-reported, which is what this replaced.
 */
function CallPrompt({
  call,
  outstanding,
  onDone,
  onLater,
}: {
  call: Pending;
  outstanding: number;
  onDone: () => void;
  onLater: () => void;
}) {
  const [outcome, setOutcome] = useState<CallOutcome>(
    call.outcome === "spoke" ? "spoke" : "no-answer",
  );
  const [notes, setNotes] = useState("");
  const [callbackAt, setCallbackAt] = useState("");
  const [callbackTime, setCallbackTime] = useState("09:30");
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);
  const [failed, setFailed] = useState("");

  // Shown once they have had a go at saving, not while they are still
  // typing the first word. A box that turns red before anybody has done
  // anything wrong is a box people learn to ignore.
  const problem =
    noteProblem(notes) ?? callbackProblem(outcome, { date: callbackAt, time: callbackTime });

  const minutes = Math.floor(call.seconds / 60);
  const seconds = call.seconds % 60;

  async function save() {
    setTried(true);
    if (problem) return;

    setSaving(true);
    setFailed("");
    try {
      const res = await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: call.id,
          outcome,
          notes,
          callbackDate: callbackAt,
          callbackTime,
          business: call.business,
        }),
      });

      // It used to call onDone whatever came back, so a refusal or a
      // database that was down looked exactly like a save: the box
      // closed, the count went down, and nothing had been written.
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        setFailed(body?.message ?? "That did not save. Try again in a moment.");
        return;
      }
      onDone();
    } catch {
      setFailed("Could not reach the server. Nothing has been saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-2xl">
        <p className="text-xs text-muted">
          Call ended {minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`}
          {outstanding > 1 && ` · ${outstanding - 1} more waiting`}
        </p>
        <h2 className="mt-1 text-lg font-bold text-foreground">{call.business}</h2>
        <p className="text-xs text-muted">{call.phone}</p>

        <p className="mt-4 text-sm font-semibold text-foreground">What happened?</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CALL_OUTCOMES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setOutcome(value)}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                outcome === value
                  ? "border-brand-pink bg-brand-pink/10 text-foreground"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {CALL_LABEL[value]}
            </button>
          ))}
        </div>

        {/* Shown for the outcome that needs it, because "ring me back
            Thursday" is the single most common thing said on these
            calls and the one most often forgotten. */}
        {outcome === "call-back" && (
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="block text-xs text-muted">
              Ring them back on
              <input
                type="date"
                value={callbackAt}
                onChange={(e) => setCallbackAt(e.target.value)}
                className="mt-1.5 block rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </label>
            {/* The time as well, and it is not optional. A day on its
                own turns "ring me at half nine before we open" into
                "some time on Thursday", and a callback kept on the
                wrong side of lunch is a callback missed. */}
            <label className="block text-xs text-muted">
              At
              <input
                type="time"
                value={callbackTime}
                onChange={(e) => setCallbackTime(e.target.value)}
                className="mt-1.5 block rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
        )}

        <label className="mt-3 block text-xs text-muted">
          What did they say?
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            autoFocus
            placeholder={
              outcome === "bad-number"
                ? "What the line did. Dead, unobtainable, rang out as a fax."
                : "Who you spoke to, what they said, anything the next person needs."
            }
            className={`mt-1.5 block w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground ${
              tried && problem ? "border-red-500" : "border-border"
            }`}
          />
        </label>
        {tried && problem && <p className="mt-1.5 text-xs text-red-400">{problem}</p>}
        {failed && <p className="mt-1.5 text-xs text-red-400">{failed}</p>}

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="brand-gradient-bg rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save and carry on"}
          </button>
          <button
            type="button"
            onClick={onLater}
            className="rounded-lg border border-border px-3 py-2.5 text-xs font-semibold text-muted"
          >
            Not now
          </button>
          <span className="text-[11px] text-muted">
            Every call needs a line about it. &ldquo;Not now&rdquo; keeps it in the red count
            until it is done.
          </span>
        </div>
      </div>
    </div>
  );
}
