"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const signup = mode === "signup";
  // Keep "where to go next" (e.g. back to checkout) when switching between log in and sign up.
  const [next, setNext] = useState("");
  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the return address after hydration
    setNext(n.startsWith("/") && !n.startsWith("//") ? n : "");
  }, []);
  const withNext = (path: string) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

  return (
    // POST so typed details never end up in the address bar if the page's
    // JavaScript hasn't loaded yet.
    <form
      method="post"
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSending(true);
        setError("");
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
          const res = await fetch(`/api/auth/${mode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
          // Full page load so the header picks up the new login.
          window.location.href = json.redirect === "/account" && next ? next : json.redirect;
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          setSending(false);
        }
      }}
    >
      {signup && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Full name</span>
          <input className="field" name="name" autoComplete="name" required />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Email</span>
        <input className="field" name="email" type="email" autoComplete="email" required />
      </label>
      {signup && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Mobile number</span>
          <input className="field" name="phone" type="tel" autoComplete="tel" required minLength={10} placeholder="07123 456789" />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Password</span>
        <input
          className="field"
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 8 : undefined}
          required
        />
        {signup && <span className="mt-1 block text-xs text-muted">At least 8 characters</span>}
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-gold w-full rounded-lg" disabled={sending}>
        {sending ? "Please wait…" : signup ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        {signup ? (
          <>
            Already have an account?{" "}
            <Link href={withNext("/login")} className="font-semibold text-gold underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to PlatedUp?{" "}
            <Link href={withNext("/signup")} className="font-semibold text-gold underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
