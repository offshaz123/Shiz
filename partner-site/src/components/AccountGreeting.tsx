"use client";

import { useEffect, useState } from "react";

/**
 * "Good morning, Walid Shah" above the hero, once somebody is signed in.
 *
 * A client component on purpose. Reading the session cookie in the page
 * would opt the whole home page into dynamic rendering and lose its static
 * caching for the sake of one line of text, so the page ships static and
 * this fills in after hydration.
 *
 * It renders nothing at all until it knows, rather than flashing a skeleton:
 * for a signed-out visitor — almost everyone — there must be no trace of it.
 */

type Account = { firstName: string; lastName: string };

/** Local hours, so the greeting matches the clock the reader is looking at. */
function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function AccountGreeting() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) setAccount(data.user);
      })
      .catch(() => {
        // Signed out, offline, or accounts not switched on. Show nothing.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!account) return null;

  return (
    <p className="mb-5 text-sm font-semibold text-on-ink/75">
      {greetingFor(new Date())},{" "}
      <span className="text-[#5eead4]">
        {account.firstName} {account.lastName}
      </span>
    </p>
  );
}
