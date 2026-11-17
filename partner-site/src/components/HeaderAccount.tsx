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
 *
 * It renders in BOTH headers. The first version was sm:block only, which left
 * a phone with no account chip, no way to reach the account and no way to log
 * out at all — on the device most people will actually use.
 */
export function HeaderAccount({
  onNavigate,
  variant = "bar",
}: {
  onNavigate?: () => void;
  /**
   * "bar" is the compact chip in the desktop header. "menu" is the stacked
   * version for inside the mobile menu, where there is no room for a
   * dropdown and no hover to open it with.
   */
  variant?: "bar" | "menu";
}) {
  const account = useAccount();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Not known yet. Render the same width as the link so the header does not
  // jump when the answer arrives.
  if (account === undefined) {
    // Reserve the width so the header does not jump when the answer lands.
    return variant === "menu" ? null : (
      <span className="hidden w-[4.5rem] sm:inline-block" aria-hidden="true" />
    );
  }

  // /login is ours and carries our branding; it is the page that hands over
  // to the banking portal. Going straight to the portal from here meant the
  // last thing somebody saw of this site was a nav bar.
  if (!account) {
    return variant === "menu" ? (
      <Link href="/login" onClick={onNavigate} className="btn btn-ghost mt-3">
        Log in
      </Link>
    ) : (
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

  if (variant === "menu") {
    return (
      <div className="mt-3 rounded-2xl border border-border bg-surface p-3">
        <div className="flex items-center gap-3 px-1 pb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {account.firstName} {account.lastName}
            </span>
            <span className="block truncate text-xs text-muted">{account.email}</span>
          </span>
        </div>
        <Link href="/dashboard" onClick={onNavigate} className="btn btn-ghost mt-1 w-full">
          Your account
        </Link>
        <Link href="/account" onClick={onNavigate} className="btn btn-ghost mt-2 w-full">
          Account settings
        </Link>
        <button
          type="button"
          onClick={logOut}
          disabled={leaving}
          className="btn btn-ghost mt-2 w-full disabled:opacity-60"
        >
          {leaving ? "Logging out…" : "Log out"}
        </button>
      </div>
    );
  }

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
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Your account
          </Link>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-surface"
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
