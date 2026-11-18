"use client";

import { useEffect, useState } from "react";
import type { ClientLead } from "@/lib/clients";
import { LeadBoard } from "./LeadBoard";
import { LeadList } from "./LeadList";

/**
 * Two ways of looking at the same enquiries, and a switch between them.
 *
 * They answer different questions. The list answers "what did this person
 * say and how do I reach them", so it carries the message and the email.
 * The board answers "where is everything up to", which is a shape rather
 * than a set of details, so the cards hold a name, a source and how long
 * they have waited and nothing else.
 *
 * The choice is remembered per browser, because somebody who prefers one
 * prefers it every morning and being handed the other is a small daily
 * annoyance. It is stored rather than put in the URL so a bookmark or a
 * shared link does not carry one person's preference to somebody else.
 */

const KEY = "sm_lead_view";

export function LeadViews({ leads, readOnly = false }: { leads: ClientLead[]; readOnly?: boolean }) {
  const [view, setView] = useState<"list" | "board">("list");

  useEffect(() => {
    let cancelled = false;
    // Deferred, so the server and the first client render agree before
    // anything stored changes it.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        if (localStorage.getItem(KEY) === "board") setView("board");
      } catch {
        // Private window or blocked storage: the default is fine.
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function choose(next: "list" | "board") {
    setView(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Not remembering the choice is survivable; failing to switch is not.
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-border px-5 py-3">
        {(["list", "board"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-pressed={view === option}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              view === option
                ? "bg-brand-pink text-white"
                : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {option === "list" ? "List" : "Board"}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-muted">
          {view === "list" ? "Details and messages" : "Where everything is up to"}
        </span>
      </div>

      {view === "list" ? (
        <LeadList leads={leads} readOnly={readOnly} />
      ) : (
        <div className="p-5">
          <LeadBoard leads={leads} readOnly={readOnly} />
        </div>
      )}
    </>
  );
}
