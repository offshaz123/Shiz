"use client";

import { useState } from "react";

const field =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none";

export function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating === 0) return setError("Pick a rating first.");
    if (!name.trim()) return setError("We need a name to put to it.");
    if (body.trim().length < 10) return setError("A line or two more would help.");

    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, business, email, body, rating, company }),
      });
      if (!res.ok) throw new Error("failed");
      setState("done");
    } catch {
      setState("idle");
      setError("That didn't send. Try again, or email info@shazmarketing.com.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Thank you</h2>
        <p className="mt-3 leading-relaxed text-muted">
          That&apos;s come through. We read every one before it goes on the site, so it may be a
          day or two before it appears.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <span className="mb-2 block text-sm text-muted">How did we do?</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              className="p-1"
            >
              <svg
                viewBox="0 0 20 20"
                className={`h-8 w-8 transition-colors ${
                  n <= rating ? "text-amber-400" : "text-border hover:text-amber-400/50"
                }`}
                fill="currentColor"
                aria-hidden
              >
                <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rev-name" className="mb-1.5 block text-sm text-muted">
            Your name
          </label>
          <input id="rev-name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="rev-business" className="mb-1.5 block text-sm text-muted">
            Business (optional)
          </label>
          <input
            id="rev-business"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="rev-email" className="mb-1.5 block text-sm text-muted">
          Email (optional, never published)
        </label>
        <input
          id="rev-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="rev-body" className="mb-1.5 block text-sm text-muted">
          What did we do for you?
        </label>
        <textarea
          id="rev-body"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What you needed, what we did, and how it went."
          className={`${field} resize-y`}
        />
      </div>

      {/* Honeypot — hidden from people, catches the simpler bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className="hidden"
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className="brand-gradient-bg mt-1 rounded-xl px-7 py-4 text-base font-semibold text-white disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Send Review"}
      </button>

      <p className="text-xs leading-relaxed text-muted">
        We read every review before it goes on the site. Your email is never published.
      </p>

      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}
    </form>
  );
}
