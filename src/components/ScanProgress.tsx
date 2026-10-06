"use client";

import { useEffect, useState } from "react";

/**
 * The stages are the real ones the API works through. The scan itself usually
 * returns in a few seconds, so we pace the labels to be readable rather than
 * flashing past, and the bar never completes until the actual result lands.
 */
const STAGES = [
  "Loading your website",
  "Checking tracking and pixels",
  "Checking your advertising setup",
  "Checking how Google reads your pages",
  "Checking your headings and content",
  "Checking how easy you are to contact",
  "Looking for your social profiles",
  "Checking the technical basics",
  "Checking your sitemap and robots file",
  "Putting your report together",
];

/** Shown under the bar so a longer scan doesn't feel like it has stalled. */
const NOTES = [
  "Hang tight, we're going through this properly rather than guessing.",
  "Checking it from A to Z. Won't be long.",
  "Still going. There's a lot to look at on a website.",
  "Nearly there, just writing up what we found.",
];

export function ScanProgress({ done }: { done: boolean }) {
  const [stage, setStage] = useState(0);
  const [pct, setPct] = useState(4);

  // Derived rather than stored, so finishing doesn't mean writing state from
  // inside an effect.
  const shownStage = done ? STAGES.length - 1 : stage;
  const shownPct = done ? 100 : pct;

  useEffect(() => {
    if (done) return;
    const tick = setInterval(() => {
      // Creeps towards 92 and waits there, so the bar never claims to have
      // finished something that hasn't.
      setPct((p) => (p >= 94 ? 94 : p + Math.max(0.18, (94 - p) / 70)));
    }, 110);
    const steps = setInterval(() => {
      setStage((s) => (s >= STAGES.length - 2 ? s : s + 1));
    }, 1700);
    return () => {
      clearInterval(tick);
      clearInterval(steps);
    };
  }, [done]);

  const note = NOTES[Math.min(NOTES.length - 1, Math.floor(shownStage / 3))];

  return (
    <div className="rounded-3xl border border-border bg-surface p-7 sm:p-9">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-semibold text-foreground">
          {done ? "Report ready" : STAGES[shownStage]}
          {!done && <span className="animate-pulse">…</span>}
        </p>
        <span className="text-sm tabular-nums text-muted">{Math.round(shownPct)}%</span>
      </div>

      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-background">
        <div
          className="brand-gradient-bg h-full rounded-full transition-[width] duration-200 ease-out"
          style={{ width: `${shownPct}%` }}
        />
      </div>

      {!done && (
        <p className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
          {note}
        </p>
      )}

      <ul className="mt-6 space-y-2.5">
        {STAGES.map((label, i) => {
          const state = done || i < shownStage ? "done" : i === shownStage ? "active" : "waiting";
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  state === "done"
                    ? "border-transparent bg-emerald-500"
                    : state === "active"
                      ? "border-brand-pink"
                      : "border-border"
                }`}
              >
                {state === "done" && (
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#fff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {state === "active" && (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
                )}
              </span>
              <span className={state === "waiting" ? "text-muted/60" : "text-muted"}>{label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
