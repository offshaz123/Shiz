"use client";

import { useEffect, useState } from "react";

export type Account = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

/**
 * Who is signed in, for client components.
 *
 * `undefined` means "not known yet" and `null` means "nobody". Keeping those
 * apart matters: almost every visitor is signed out, so anything that renders
 * an account must show nothing at all until the answer is in, rather than
 * flashing a signed-out state and then correcting itself.
 */
export function useAccount() {
  const [account, setAccount] = useState<Account | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setAccount(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return account;
}

/** Local hours, so the greeting matches the clock the reader is looking at. */
export function greetingFor(date: Date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
