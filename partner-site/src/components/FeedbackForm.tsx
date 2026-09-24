"use client";

import { useState } from "react";
import { brand } from "@/lib/brand";
import { SecurityCheck } from "@/components/SecurityCheck";
import { useAccount } from "@/lib/useAccount";

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted/70 focus:border-accent focus:shadow-[var(--ring)]";
const label = "mb-1.5 block text-sm font-medium";

const ratings = [
  { value: "Good", emoji: "😀" },
  { value: "Fine", emoji: "🙂" },
  { value: "Poor", emoji: "😕" },
];

const topics = [
  "The website itself",
  "Something I could not find",
  "Opening an account",
  "The software for MSBs",
  "Something else",
];

/**
 * Feedback, deliberately short.
 *
 * One rating, one topic, one box. Name and email are optional — insisting on
 * them is how you stop getting the feedback that is worth having. If the
 * person is signed in their details come along anyway, which is the one real
 * advantage of having an account here today.
 */
export function FeedbackForm({ source = "Feedback page" }: { source?: string }) {
  const account = useAccount();
  const [rating, setRating] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkPassed, setCheckPassed] = useState(false);
  const [checkFailed, setCheckFailed] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!checkPassed) {
      setCheckFailed(true);
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          topic: form.get("topic"),
          message: form.get("message"),
          name: form.get("name"),
          email: form.get("email"),
          _honey: form.get("_honey"),
          source,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error ?? `That did not send. Please email ${brand.email} instead.`);
        setBusy(false);
        return;
      }
      setSent(true);
    } catch {
      setError(`We could not reach the server. Please email ${brand.email} instead.`);
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0e9f6e]/12 text-[#0e9f6e]">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="m6 12.5 4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="font-display mt-5 text-xl font-semibold">Thank you — that is with us</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A person reads every one of these. If you left an address and it needs an
          answer, you will get one.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8">
      {/* Honeypot. Hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="_honey">Leave this empty</label>
        <input id="_honey" name="_honey" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend className={label}>How are we doing?</legend>
        <div className="mt-2 flex gap-2.5">
          {ratings.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRating(option.value)}
              aria-pressed={rating === option.value}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-sm font-semibold transition-colors ${
                rating === option.value
                  ? "border-accent bg-accent-soft text-accent-2"
                  : "border-border hover:border-accent/60"
              }`}
            >
              <span className="text-2xl leading-none">{option.emoji}</span>
              {option.value}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label className={label} htmlFor="topic">What is it about?</label>
        <select id="topic" name="topic" className={field} defaultValue={topics[0]}>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className={label} htmlFor="message">Your feedback</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="What worked, what did not, or what you expected to find and could not."
          className={field}
        />
      </div>

      {!account && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">Name <span className="font-normal text-muted">(optional)</span></label>
            <input id="name" name="name" autoComplete="name" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="email">Email <span className="font-normal text-muted">(optional)</span></label>
            <input id="email" name="email" type="email" autoComplete="email" className={field} />
          </div>
        </div>
      )}

      {account && (
        <p className="mt-5 text-xs leading-relaxed text-muted">
          Sending as <span className="font-semibold text-foreground">{account.email}</span>, so we can
          reply. Log out first if you would rather it were anonymous.
        </p>
      )}

      <div className="mt-6">
        <SecurityCheck
          onChange={(valid) => {
            setCheckPassed(valid);
            if (valid) setCheckFailed(false);
          }}
          showError={checkFailed}
        />
      </div>

      {error && (
        <p role="status" className="mt-5 rounded-xl border border-[#e0537a]/30 bg-[#e0537a]/10 px-4 py-3 text-sm text-[#b03357]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
