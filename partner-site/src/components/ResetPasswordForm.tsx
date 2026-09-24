"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { passwordRules } from "@/lib/passwordRules";

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow focus:border-accent focus:shadow-[var(--ring)]";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">That link is incomplete</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Open the link from the email exactly as it arrived, or ask for a new one.
        </p>
        <Link href="/forgot-password" className="btn btn-primary mt-7 w-full">
          Ask for a new link
        </Link>
      </div>
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "We could not set that password.");
        setBusy(false);
        return;
      }
      // The route signs them in, so go straight to the site.
      window.location.assign("/dashboard");
    } catch {
      setError("We could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-sm text-muted">Then we will sign you straight in.</p>

      <label className="mb-1.5 mt-8 block text-sm font-medium" htmlFor="password">New password</label>
      <input
        id="password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={field}
      />
      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {passwordRules.map((rule) => {
          const met = rule.test(password);
          return (
            <li key={rule.label} className={`text-xs ${met ? "text-[#0e9f6e]" : "text-muted"}`}>
              {met ? "✓" : "○"} {rule.label}
            </li>
          );
        })}
      </ul>

      <label className="mb-1.5 mt-5 block text-sm font-medium" htmlFor="confirm">Confirm new password</label>
      <input
        id="confirm"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className={field}
      />

      {error && (
        <p role="status" className="mt-5 rounded-xl border border-[#e0537a]/30 bg-[#e0537a]/10 px-4 py-3 text-sm text-[#b03357]">
          {error}
        </p>
      )}

      <button type="submit" disabled={busy} className="btn btn-primary mt-6 w-full disabled:opacity-60">
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
