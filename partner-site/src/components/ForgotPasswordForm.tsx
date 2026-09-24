"use client";

import { useState } from "react";
import Link from "next/link";

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow focus:border-accent focus:shadow-[var(--ring)]";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setBusy(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    // Same screen either way — see the route. Whether the address has an
    // account is not something this page will tell anyone.
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <rect x="2.75" y="5.25" width="18.5" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          If that address has an account, a reset link is on its way. It is good for one
          hour, and once it has been used it will not work again.
        </p>
        <Link href="/login" className="btn btn-ghost mt-7 w-full">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Forgotten password</h1>
      <p className="mt-2 text-sm text-muted">
        Give us the address on the account and we will send a link to set a new password.
      </p>

      <label className="mb-1.5 mt-8 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input id="email" name="email" type="email" autoComplete="email" required className={field} />

      <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Sending…" : "Send the link"}
      </button>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-accent-2 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
