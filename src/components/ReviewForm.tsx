"use client";

import { useState } from "react";

// "Write a review" on the homepage. Reviews wait for the shop to approve them.
export function ReviewForm() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done)
    return (
      <div role="status" className="mx-auto max-w-xl rounded-2xl border border-[#9fd3ae] bg-[#f1faf3] p-6 text-center">
        <p className="font-display text-2xl font-bold">Thank you!</p>
        <p className="mt-1 text-muted">We&apos;ll check your review and add it to the website shortly.</p>
      </div>
    );

  if (!open)
    return (
      <div className="text-center">
        <button type="button" className="btn btn-gold" onClick={() => setOpen(true)}>
          Write a review
        </button>
      </div>
    );

  return (
    <form
      className="mx-auto max-w-xl space-y-4 rounded-2xl border border-line bg-white p-5 text-left sm:p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        if (!rating) return setError("Please choose a star rating.");
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setSending(true);
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, rating }),
        }).catch(() => null);
        setSending(false);
        if (res?.ok) setDone(true);
        else setError((await res?.json().catch(() => ({})))?.error ?? "Something went wrong. Please try again.");
      }}
    >
      <p className="font-display text-2xl font-bold">How were your plates?</p>
      <div>
        <span className="text-sm font-semibold">Your rating</span>
        <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <svg viewBox="0 0 20 20" className="h-8 w-8" fill={n <= rating ? "#c9a227" : "#e5dcc4"} aria-hidden>
                <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Your name (shown with your review)</span>
        <input name="name" className="field mt-1" maxLength={80} autoComplete="name" required />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Email (never shown)</span>
        <input name="email" type="email" className="field mt-1" maxLength={190} autoComplete="email" required />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Your review</span>
        <textarea name="body" className="field mt-1 min-h-28" maxLength={1500} placeholder="Which plates did you get, and how do they look?" required />
      </label>
      {/* Left empty by people; bots fill it in. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-gold w-full" disabled={sending}>
        {sending ? "Sending…" : "Submit review"}
      </button>
      <p className="text-xs text-muted">Reviews are checked before they appear. We publish all genuine reviews, good or bad.</p>
    </form>
  );
}
