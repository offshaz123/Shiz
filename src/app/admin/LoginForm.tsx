"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin</h1>
      <p className="mt-2 text-sm text-muted">
        Staff: your sign-in name and your own password. Walid: leave the name blank.
      </p>

      <form action={action} className="mt-6 flex flex-col gap-3">
        {/* Optional on purpose. Walid has typed one password into this
            screen for months and should not have to learn a second field
            because other people now have accounts. */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          placeholder="Sign-in name (staff only)"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          autoFocus
          placeholder="Password"
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="brand-gradient-bg rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Checking…" : "Log in"}
        </button>

        {state.error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
