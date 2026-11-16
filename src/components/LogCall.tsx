"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CALL_LABEL,
  CALL_OUTCOMES,
  type CallOutcome,
  type ProspectStatus,
} from "@/lib/prospect-types";

/**
 * Writing down what happened on the call, from the page you rang them from.
 *
 * This already existed inside the call list, but not here, which meant the
 * page with the script on it was the one page you could not record the call
 * from: ring, then go and find them again somewhere else. People do not do
 * that, and a call that is not written down may as well not have happened.
 *
 * It posts to the same two endpoints the call list uses rather than new
 * ones. The outcome already drives the status on the server — "not
 * interested" marks them so, and anything where a human answered counts as
 * called — so the status buttons below are for the one thing the outcome
 * cannot say: a good call where they want to hear more.
 *
 * Opens closed. A form sitting open on every profile makes the page about
 * data entry, when most visits are to read the script and dial.
 */

const FRIENDLY: Record<ProspectStatus, string> = {
  new: "Not spoken yet",
  called: "Called, no decision",
  interested: "Interested",
  "not-interested": "Not interested",
  "no-answer": "No answer",
  customer: "Now a customer",
};

export function LogCall({ id, status }: { id: number; status: ProspectStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>("spoke");
  const [notes, setNotes] = useState("");
  const [callbackAt, setCallbackAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/prospects/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, outcome, notes, callbackAt }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setNotes("");
      setCallbackAt("");
      setOpen(false);
      router.refresh();
    } catch {
      // Said plainly rather than swallowed: the whole value of this is that
      // what they said is written down, so silently losing it is the one
      // failure that must never look like success.
      setError("That did not save. Copy your notes somewhere before trying again.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(next: ProspectStatus) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/prospects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
    } catch {
      setError("That did not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background"
        >
          I called them
        </button>
        <span className="text-xs text-muted">Where they are now: {FRIENDLY[status]}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">What happened on the call?</h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {CALL_OUTCOMES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setOutcome(option)}
            aria-pressed={outcome === option}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              outcome === option
                ? "border-brand-pink bg-brand-pink text-white"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {CALL_LABEL[option]}
          </button>
        ))}
      </div>

      {outcome === "call-back" && (
        <label className="mt-4 block">
          <span className="text-xs font-medium text-muted">What day did you promise?</span>
          <input
            type="date"
            value={callbackAt}
            onChange={(e) => setCallbackAt(e.target.value)}
            className="mt-1 block rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <span className="mt-1 block text-[11px] text-muted">
            It turns up in Today on the morning it is due.
          </span>
        </label>
      )}

      <label className="mt-4 block">
        <span className="text-xs font-medium text-muted">What did they say?</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Their words, not a summary. What they already spend, who does it now, what they complained about."
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted/60"
        />
        <span className="mt-1 block text-[11px] leading-relaxed text-muted">
          Kept as its own entry, so the third call can still read what was said on the first.
        </span>
      </label>

      {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save the call"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs font-semibold text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-medium text-muted">
          Or set where they stand, if the call changed it:
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["interested", "not-interested", "customer"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setStatus(option)}
              disabled={saving || status === option}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
                status === option
                  ? "border-brand-pink text-brand-pink"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {FRIENDLY[option]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Marking them interested or not interested takes them out of the automatic emails for
          good. Nothing scripted should follow a real conversation.
        </p>
      </div>
    </div>
  );
}
