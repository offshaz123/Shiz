"use client";

import { useActionState } from "react";
import { importReviews } from "@/app/admin/actions";

/**
 * Pasting in reviews that already exist somewhere else.
 *
 * Walid has real reviews on Google, in emails and on his phone, and
 * typing them into the public form one at a time is the kind of job
 * that never gets done. This takes the lot in one go.
 *
 * Two things it is careful about. It shows exactly which lines it
 * could not read, with their numbers, so nothing is lost quietly — a
 * real customer's words going missing because a rating was written
 * "brilliant" is worse than being told about it. And these go in
 * already approved, unlike the public form, because the public form is
 * open to anybody on the internet and this is Walid typing.
 */
export function ImportReviews() {
  const [state, action, pending] = useActionState(importReviews, {});

  return (
    <details className="rounded-2xl border border-border">
      <summary className="cursor-pointer list-none px-5 py-4 text-sm font-bold">
        <span className="text-brand-pink">+</span> Paste in reviews you already have
      </summary>

      <form action={action} className="flex flex-col gap-3 border-t border-border px-5 py-4">
        <p className="text-xs leading-relaxed text-muted">
          One review a line: <strong className="text-foreground">name, rating, what they said</strong>,
          separated by a pipe. A business name in brackets is picked up too. Stars work as well as
          numbers, and a copy straight out of a spreadsheet works because tabs count as separators.
        </p>

        <pre className="overflow-x-auto rounded-lg border border-border bg-black/20 p-3 text-[11px] leading-relaxed text-muted">
{`Dave Smith | 5 | Rebuilt our site in a week and the phone started going.
Jo Patel (Patel Tiling) | 4 | Good work, a bit slow to get started.
Sam Lee | ★★★★★ | Did exactly what they said they would do.`}
        </pre>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-muted">Your reviews</span>
          <textarea
            id="pasted-reviews"
            name="pasted"
            rows={8}
            required
            placeholder="Paste them here, one a line."
            className="w-full rounded-xl border border-border bg-transparent px-3.5 py-3 text-sm"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-pink px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add them"}
          </button>
          <span className="text-[11px] text-muted">
            They go straight on the website. You can hide any of them below.
          </span>
        </div>

        {state.error && (
          <p className="text-sm font-bold text-red-400">{state.error}</p>
        )}

        {typeof state.added === "number" && state.added > 0 && (
          <p className="text-sm font-bold text-green-400">
            {state.added} review{state.added === 1 ? "" : "s"} added and live on the website.
          </p>
        )}

        {/* The lines that could not be read, so they can be fixed and
            pasted again rather than silently lost. */}
        {state.problems && state.problems.length > 0 && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3">
            <p className="text-xs font-bold text-amber-300">
              {state.problems.length} line{state.problems.length === 1 ? "" : "s"} could not be read,
              so {state.problems.length === 1 ? "it was" : "they were"} left out:
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {state.problems.map((p) => (
                <li key={p.line} className="text-[11px] leading-relaxed text-muted">
                  <span className="font-bold text-foreground">Line {p.line}</span> — {p.why}
                  <br />
                  <span className="italic opacity-70">{p.text.slice(0, 110)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </details>
  );
}
