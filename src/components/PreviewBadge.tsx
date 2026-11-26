"use client";

import { useState } from "react";
import type { Prospect } from "@/lib/prospect-types";

/**
 * Whether a page was built for this business, and whether they looked.
 *
 * On the row rather than on a screen of its own, because it has to be
 * read by the person about to dial, in the second before they dial. The
 * same component serves the owner and everybody else: there is nothing
 * here one of them should see and the other should not, and two
 * versions of it would drift within a month.
 *
 * Quiet when nothing has happened. Loud, in red, the moment somebody
 * opens their page, because that is the single best call on the list
 * that morning and it is worth interrupting for.
 */

/** "3 days ago", "yesterday", "today". */
function ago(value: string): string {
  const when = new Date(value.replace(" ", "T")).getTime();
  if (Number.isNaN(when)) return "";
  const days = Math.floor((Date.now() - when) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** How long is left on it, or that it has gone. */
function leftOn(expiresAt: string): { words: string; dead: boolean } {
  const when = new Date(expiresAt.replace(" ", "T")).getTime();
  if (Number.isNaN(when)) return { words: "", dead: false };
  const days = Math.ceil((when - Date.now()) / 86_400_000);
  if (days < 0) return { words: "expired", dead: true };
  if (days === 0) return { words: "expires today", dead: false };
  if (days === 1) return { words: "1 day left", dead: false };
  return { words: `${days} days left`, dead: false };
}

export function PreviewBadge({ prospect }: { prospect: Prospect }) {
  const [copied, setCopied] = useState(false);
  const preview = prospect.preview;
  if (!preview) return null;

  const left = leftOn(preview.expiresAt);
  const opened = preview.opens > 0;

  async function copy() {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // A browser that will not give us the clipboard is not worth a
      // message about. The link is one click away in the next button.
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {/* The fact it went, and how long it has left. */}
      <span
        className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
          left.dead
            ? "border-border text-muted"
            : "border-sky-500/50 text-sky-600 dark:text-sky-400"
        }`}
        title={`Their site rebuilt, sent ${preview.sentAt.slice(0, 10)} · ${left.words}`}
      >
        site preview sent {preview.sentAt.slice(8, 10)}/{preview.sentAt.slice(5, 7)}
        {left.words ? ` · ${left.words}` : ""}
      </span>

      {/* The part worth interrupting for. */}
      {opened && (
        <span
          className="rounded-lg border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-500"
          title={
            preview.lastOpenedAt
              ? `Last opened ${preview.lastOpenedAt.slice(0, 16).replace("T", " ")}`
              : undefined
          }
        >
          opened {preview.opens} time{preview.opens === 1 ? "" : "s"}
          {preview.lastOpenedAt ? ` · ${ago(preview.lastOpenedAt)}` : ""} — ring them
        </span>
      )}

      <a
        href={preview.url}
        target="_blank"
        rel="noreferrer noopener"
        className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold text-muted hover:border-brand-pink hover:text-foreground"
        title="Open the page they were sent"
      >
        see it ↗
      </a>
      <button
        type="button"
        onClick={copy}
        className="rounded-lg border border-border px-2 py-0.5 text-[11px] font-semibold text-muted hover:border-brand-pink hover:text-foreground"
        title="Copy the link, to send on WhatsApp"
      >
        {copied ? "copied" : "copy link"}
      </button>
    </span>
  );
}
