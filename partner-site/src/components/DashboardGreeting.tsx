"use client";

import { greetingFor } from "@/lib/useAccount";

/**
 * The greeting has to be a client component even though the page knows the
 * name: "good morning" depends on the READER's clock, and the server's clock
 * is in whatever timezone the host happens to run in.
 */
export function DashboardGreeting({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  return (
    <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
      {greetingFor()},{" "}
      <span className="text-accent-2">
        {firstName} {lastName}
      </span>
    </h1>
  );
}
