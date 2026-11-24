"use client";

import { useState } from "react";
import { workDay, type Moment, type Stretch } from "@/lib/work-day";
import type { Sitting } from "@/lib/staff";

/**
 * One person's day, read top to bottom.
 *
 * The team page had the facts already, as two long lists on the same
 * screen — every sitting, and every action by everybody. That answers
 * "what happened"; it does not answer "what did Ali do today", which
 * is the question actually being asked, and the only way to get at it
 * was to read both lists and hold them in your head at once.
 *
 * The quiet stretches are the part worth being careful about. A gap is
 * not proof of anything: somebody on a long call with a difficult
 * business is doing the most valuable work of the day and touching
 * nothing. So it says how long and when, in plain grey, and stops
 * there. No scores, no totals, nothing in red.
 */

const WORDS: Record<string, string> = {
  "signed-in": "signed in",
  "signed-out": "signed out",
  "logged-call": "logged a call",
  "wrote-up-call": "wrote up a call",
  dialled: "rang a business",
  "set-status": "set the status",
  "wrote-note": "wrote a note",
  "fixed-email": "corrected an email address",
  "sent-email": "sent an email",
  "changed-client": "changed a client account",
  "added-client": "added a client",
  "deleted-business": "moved a business to Deleted",
  "restored-business": "put a business back on the list",
};

function hhmm(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, "0")}m`;
}

function Line({ step }: { step: Stretch }) {
  if (step.kind === "signed-in") {
    return (
      <li className="flex gap-3">
        <span className="w-11 shrink-0 tabular-nums font-semibold text-emerald-500">{step.at}</span>
        <span className="font-semibold text-emerald-500">signed in</span>
      </li>
    );
  }
  if (step.kind === "signed-out") {
    return (
      <li className="flex gap-3">
        <span className="w-11 shrink-0 tabular-nums font-semibold text-muted">{step.at}</span>
        <span className="text-muted">
          signed out{step.reason === "left" ? " (closed the tab)" : ""}
        </span>
      </li>
    );
  }
  if (step.kind === "still-in") {
    return (
      <li className="flex gap-3">
        <span className="w-11 shrink-0 tabular-nums font-semibold text-emerald-500">{step.at}</span>
        <span className="font-semibold text-emerald-500">still signed in</span>
      </li>
    );
  }
  if (step.kind === "quiet") {
    return (
      <li className="flex gap-3 text-muted">
        <span className="w-11 shrink-0 tabular-nums">{step.from}</span>
        <span className="italic">
          nothing recorded until {step.to} — {hhmm(step.minutes)}
        </span>
      </li>
    );
  }
  return (
    <li className="flex gap-3">
      <span className="w-11 shrink-0 tabular-nums text-muted">{step.at}</span>
      <span className="text-foreground">
        {WORDS[step.action] ?? step.action}
        {step.subject ? <span className="text-muted"> — {step.subject}</span> : null}
        {step.detail ? <span className="text-muted">: {step.detail}</span> : null}
      </span>
    </li>
  );
}

export function WorkDayLine({
  sittings,
  moments,
  dates,
}: {
  sittings: Sitting[];
  moments: Moment[];
  /** The days this person has anything on, newest first. */
  dates: string[];
}) {
  const [picked, setPicked] = useState(dates[0] ?? "");
  if (dates.length === 0) {
    return <p className="text-[11px] text-muted">Nothing recorded for them yet.</p>;
  }

  const day = workDay(picked, sittings, moments);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {dates.slice(0, 14).map((date) => (
          <button
            key={date}
            type="button"
            onClick={() => setPicked(date)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
              date === picked
                ? "border-brand-pink text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {date.slice(8, 10)}/{date.slice(5, 7)}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-foreground">
        {day.from ? (
          <>
            <span className="font-semibold">
              {day.from} to {day.to}
            </span>
            <span className="text-muted">
              {" "}
              · {hhmm(day.span)} between the two · {day.actions}{" "}
              {day.actions === 1 ? "thing done" : "things done"}
              {day.quiet.length > 0 && (
                <>
                  {" "}
                  · {day.quiet.length} quiet{" "}
                  {day.quiet.length === 1 ? "stretch" : "stretches"}, longest{" "}
                  {hhmm(day.quiet[0].minutes)}
                </>
              )}
            </span>
          </>
        ) : (
          <span className="text-muted">Not signed in that day.</span>
        )}
      </p>

      <ul className="mt-3 flex flex-col gap-1 text-[11px] leading-relaxed">
        {day.line.map((step, i) => (
          <Line key={`${step.kind}-${i}`} step={step} />
        ))}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        A quiet stretch is time with nothing written down against it. It is not proof of anything
        — a long call with a difficult business looks exactly like this — but it is the thing
        worth asking about.
      </p>
    </div>
  );
}
