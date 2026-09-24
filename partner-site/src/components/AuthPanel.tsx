"use client";

import { useState } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { greetingFor, useAccount } from "@/lib/useAccount";

/**
 * The log in / sign up panel.
 *
 * The layout follows the shape people expect from a payments platform: a
 * segmented control at the top, email, password, and on sign-up a confirm
 * field with the rules ticking green as they are met, so nobody submits and
 * then gets told what they should have typed.
 *
 * It posts to /api/auth/*, which hashes with scrypt and sets an httpOnly
 * session cookie. There is NO bank account behind any of it — this is an
 * identity, not a balance — and the copy here is careful never to imply
 * otherwise.
 *
 * The rules below are duplicated in the signup route. That is on purpose:
 * this copy is for the person typing, the server copy is the one that
 * decides, and a form that validates only in the browser is not validated.
 */

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "At least one uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "At least one lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "At least one number", test: (v: string) => /\d/.test(v) },
  { label: "At least one symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted/70 focus:border-accent focus:shadow-[var(--ring)]";

function Eye({ shown }: { shown: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2.5 12S6 5.75 12 5.75 21.5 12 21.5 12 18 18.25 12 18.25 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      {!shown && <path d="m4 20 16-16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

function Tick({ met }: { met: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" opacity={met ? 1 : 0.45} />
      {met && (
        <path d="m8.5 12 2.4 2.4 4.6-4.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function AuthPanel() {
  // Somebody who is already signed in should not be looking at a login form.
  // Before this, returning to /login showed the form again no matter what,
  // which made a working session look like a broken one.
  const existing = useAccount();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const matches = confirm.length > 0 && confirm === password;

  function switchTo(next: "login" | "signup") {
    setMode(next);
    setNotice(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    if (isSignup && password !== confirm) {
      setNotice("The two passwords do not match.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setNotice(
          data?.error ??
            `Something went wrong. Please try again, or email ${brand.email}.`
        );
        setSubmitting(false);
        return;
      }

      // A FULL page load, not router.push().
      //
      // push() followed by refresh() raced: refresh invalidates the router
      // cache for the route you are currently on, and firing it in the same
      // tick as a navigation could leave the browser sitting on /login with
      // the button stuck on "Logging in…", because nothing clears submitting
      // on the success path. From outside that looks exactly like the login
      // silently failing — which is what it was reported as.
      //
      // A hard load also guarantees the new session cookie is on the request
      // that renders the next page, with no client cache in the way.
      window.location.assign("/");
    } catch {
      setNotice(`We could not reach the server. Please try again, or email ${brand.email}.`);
      setSubmitting(false);
    }
  }

  if (existing) {
    return (
      <div className="mx-auto w-full max-w-sm text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {greetingFor()}, {existing.firstName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          You are already signed in as {existing.email}.
        </p>
        <Link href="/" className="btn btn-primary mt-7 w-full">
          Go to the site
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {isSignup ? "Create an account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignup ? "Use your work email to get started." : "Sign in to your account."}
      </p>

      {/* Segmented control. */}
      <div
        role="tablist"
        aria-label="Log in or sign up"
        className="mt-8 grid grid-cols-2 gap-1 rounded-2xl border border-border bg-surface p-1"
      >
        {(["login", "signup"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={mode === value}
            onClick={() => switchTo(value)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              mode === value ? "bg-ink text-on-ink" : "text-muted hover:text-foreground"
            }`}
          >
            {value === "login" ? "Log in" : "Sign up"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        {isSignup && (
          // Collected at sign-up because the greeting needs them. Asking
          // later would mean an account that cannot say hello to anyone.
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-first">
                First name
              </label>
              <input
                id="auth-first"
                name="firstName"
                autoComplete="given-name"
                required
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-last">
                Last name
              </label>
              <input
                id="auth-last"
                name="lastName"
                autoComplete="family-name"
                required
                className={fieldClass}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@yourcompany.co.uk"
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-password">
            Password
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${fieldClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:text-foreground"
            >
              <Eye shown={showPassword} />
            </button>
          </div>

          {isSignup && (
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {rules.map((rule) => {
                const met = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${met ? "text-[#0e9f6e]" : "text-muted"}`}
                  >
                    <Tick met={met} />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {isSignup && (
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="auth-confirm">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="auth-confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className={`${fieldClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition-colors hover:text-foreground"
              >
                <Eye shown={showConfirm} />
              </button>
            </div>
            {confirm.length > 0 && (
              <p
                className={`mt-2 flex items-center gap-1.5 text-xs ${
                  matches ? "text-[#0e9f6e]" : "text-[#e0537a]"
                }`}
              >
                <Tick met={matches} />
                {matches ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm leading-relaxed text-accent-2"
          >
            {notice}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          {submitting
            ? isSignup
              ? "Creating account…"
              : "Logging in…"
            : isSignup
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? "Already have an account? " : "No account yet? "}
        <button
          type="button"
          onClick={() => switchTo(isSignup ? "login" : "signup")}
          className="font-semibold text-accent-2 hover:underline"
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>

      <p className="mt-8 text-center text-xs text-muted">
        Not a customer yet?{" "}
        <Link href="/contact" className="font-semibold text-accent-2 hover:underline">
          Talk to us about an account
        </Link>
      </p>
    </div>
  );
}
