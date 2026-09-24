"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "@/lib/useAccount";

/**
 * The header's account control: "Log in" for a visitor, the person's name
 * and a way out for somebody signed in.
 *
 * Without this there was no sign anywhere that logging in had worked, apart
 * from one line on the home page, and no way to log out at all — so the only
 * way to tell was to go back to /login, which still showed the form. That is
 * what "it doesn't actually log in" looked like from outside.
 */
export function HeaderAccount({ onNavigate }: { onNavigate?: () => void }) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Not known yet. Render the same width as the link so the header does not
  // jump when the answer arrives.
  if (account === undefined) {
    return <span className="hidden w-[4.5rem] sm:inline-block" aria-hidden="true" />;
  }

  if (!account) {
    return (
      <Link
        href="/login"
        onClick={onNavigate}
        className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:inline-flex"
      >
        Log in
      </Link>
    );
  }

  async function logOut() {
    setLeaving(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // A full load, not a router push: the session is gone and every cached
    // client view of it has to go with it.
    window.location.assign("/");
  }

  const initials = `${account.firstName[0] ?? ""}${account.lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm font-semibold transition-colors hover:border-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs text-on-accent">
          {initials}
        </span>
        <span className="max-w-[8rem] truncate">{account.firstName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border bg-card p-2 shadow-xl"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">
              {account.firstName} {account.lastName}
            </p>
            <p className="truncate text-xs text-muted">{account.email}</p>
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Account settings
          </Link>
          <button
            type="button"
            onClick={logOut}
            disabled={leaving}
            className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-60"
          >
            {leaving ? "Logging out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
