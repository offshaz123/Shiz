"use client";

import { useState } from "react";
import type { CallScript } from "@/lib/call-script";

/**
 * What to say, on the row you ring from.
 *
 * The script already existed and was good — an opener built on
 * something true about that business, what to ask for, and an answer
 * to each of the five things people actually say. It was on the
 * business's own page, one click away from the call list.
 *
 * One click away is the same as not there. Somebody working down a
 * list of two hundred does not open a second page before each call,
 * so every call got made off the top of their head, and the thinking
 * behind the script may as well not have been done.
 *
 * So it opens here, next to the Call button, and opens by itself when
 * the call is placed — because that is the one moment it is needed and
 * the one moment nobody has a spare hand to go looking for it.
 */
export function CallScriptPanel({
  script,
  open,
  onToggle,
}: {
  script: CallScript;
  open: boolean;
  onToggle: () => void;
}) {
  const [showObjections, setShowObjections] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="rounded-lg border border-border px-2.5 py-1 font-semibold hover:border-brand-pink hover:text-foreground"
      >
        What to say
      </button>
    );
  }

  return (
    <div className="mt-3 w-full rounded-xl border border-brand-pink/40 bg-background px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-bold text-foreground">What to say</p>
        <button
          type="button"
          onClick={onToggle}
          className="text-[11px] font-semibold text-muted hover:text-foreground"
        >
          Close
        </button>
      </div>

      {/* Why they are on the list at all. Read this before dialling. */}
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{script.reason}</p>

      <div className="mt-3 flex flex-col gap-3">
        {script.sections.map((section) => (
          <div key={section.heading}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
              {section.heading}
            </p>
            {section.say && (
              <p className="mt-1 rounded-lg border-l-2 border-brand-pink bg-surface px-3 py-2 text-xs leading-relaxed text-foreground">
                {section.say}
              </p>
            )}
            {section.note && (
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{section.note}</p>
            )}
          </div>
        ))}
      </div>

      {/* Folded away until it is needed, which is mid-call and in a
          hurry. Open, it is a wall of text above the thing you were
          reading. */}
      <button
        type="button"
        onClick={() => setShowObjections((was) => !was)}
        className="mt-3 text-[11px] font-bold uppercase tracking-wide text-brand-pink"
      >
        {showObjections ? "Hide" : "If they say no"} ({script.objections.length})
      </button>

      {showObjections && (
        <dl className="mt-2 flex flex-col gap-2">
          {script.objections.map((objection) => (
            <div key={objection.they} className="rounded-lg border border-border bg-surface px-3 py-2">
              <dt className="text-[11px] font-semibold text-muted">
                They say: {objection.they}
              </dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-foreground">{objection.you}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
