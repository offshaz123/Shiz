"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

/**
 * The link and account name to send a client, ready to paste.
 *
 * It exists because the alternative was typing it out from memory every
 * time, and the account name is the half that gets typed wrong: it was
 * generated from their business name, so "Plated Up" is plated-up and
 * nobody guesses the hyphen.
 *
 * Copies a whole message rather than a URL. What is actually needed at that
 * moment is something to paste into WhatsApp, and a bare link leaves the
 * person on the other end looking at a login box with no idea what to type.
 *
 * The password is not here and cannot be: it is stored hashed, so there is
 * nothing to copy. The message says to ask for it rather than leaving a
 * gap, because a message sent with a blank where the password should be is
 * a message that gets sent anyway.
 */
export function ClientLoginLink({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState("");
  const url = `${siteConfig.url.replace(/\/$/, "")}/portal`;

  const message = [
    `Hi — here's your ${name} dashboard.`,
    ``,
    url,
    ``,
    `Account name: ${slug}`,
    `Password: the one we sent you separately.`,
    ``,
    `You can see every enquiry, what it cost, your diary and your invoices in there.`,
  ].join("\n");

  async function copy(what: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(""), 2500);
    } catch {
      // Clipboard access is refused in some browsers and over plain http.
      // The text is on screen either way, so this is a convenience that
      // failed rather than a thing that is now broken.
      setCopied("failed");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">Send them their login</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-muted">
        Paste this into a message. The password is not in it — it is stored hashed and cannot be
        read back, so send that separately or reset it below.
      </p>

      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-3 text-[11px] leading-relaxed text-muted">
        {message}
      </pre>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => copy("message", message)}
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
        >
          Copy the message
        </button>
        <button
          type="button"
          onClick={() => copy("link", url)}
          className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
        >
          Copy just the link
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-brand-pink hover:underline"
        >
          Open the sign-in page
        </a>

        {copied && (
          <span
            className={`text-xs font-medium ${
              copied === "failed"
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {copied === "failed" ? "Could not copy — select it by hand." : "Copied."}
          </span>
        )}
      </div>
    </div>
  );
}
