"use client";

import Link from "next/link";
import { greetingFor, useAccount } from "@/lib/useAccount";

/**
 * "Good afternoon, Walid Shah" above the hero, once somebody is signed in.
 *
 * A client component on purpose: reading the session cookie in the page
 * would opt the whole home page into dynamic rendering and lose its static
 * caching for the sake of one line of text.
 */
export function AccountGreeting() {
  const account = useAccount();
  if (!account) return null;

  return (
    <p className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-on-ink/75">
      <span>
        {greetingFor()},{" "}
        <span className="text-[#5eead4]">
          {account.firstName} {account.lastName}
        </span>
      </span>
      <Link
        href="/dashboard"
        className="text-[#7dd3fc] underline-offset-4 hover:underline"
      >
        Your account &rarr;
      </Link>
    </p>
  );
}
