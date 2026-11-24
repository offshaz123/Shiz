"use client";

import { useCallback, useEffect, useState } from "react";
import { CALL_LABEL, CALL_OUTCOMES, type CallOutcome } from "@/lib/prospect-types";

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
        // The newest unwritten call opens by itself. Anything older
        // stays in the count rather than being thrown at them one
        // after another.
        setOpen((current) => current ?? body.pending[0] ?? null);
      })
      .catch(() => {
        // A failed check is not worth saying anything about. The next
        // one is twenty seconds away.
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

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
  const [saving, setSaving] = useState(false);

  const minutes = Math.floor(call.seconds / 60);
  const seconds = call.seconds % 60;

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: call.id,
          outcome,
          notes,
          callbackAt,
          business: call.business,
        }),
      });
      onDone();
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
          <label className="mt-3 block text-xs text-muted">
            Ring them back on
            <input
              type="date"
              value={callbackAt}
              onChange={(e) => setCallbackAt(e.target.value)}
              className="mt-1.5 block rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
            />
          </label>
        )}

        <label className="mt-3 block text-xs text-muted">
          What did they say?
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Who you spoke to, what they said, anything the next person needs."
            className="mt-1.5 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
        </label>

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
            &ldquo;Not now&rdquo; keeps it in the red count until it is done.
          </span>
        </div>
      </div>
    </div>
  );
}
