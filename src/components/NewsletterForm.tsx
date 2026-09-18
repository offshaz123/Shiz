"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "done" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, _honey: honey }),
      });
      if (!res.ok) throw new Error("subscribe failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
        You&apos;re on the list. We only send something when it&apos;s worth reading.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Your email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none"
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          className="hidden"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="brand-gradient-bg shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {status === "error"
          ? "That didn't send. Email us directly and we'll add you."
          : "No spam. Unsubscribe anytime."}
      </p>
    </form>
  );
}
