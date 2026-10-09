"use client";

import { useState } from "react";

// A form that posts its fields (including files) to an API route and swaps
// itself for a thank-you message when it goes through.
export function PostForm({
  action,
  submitLabel,
  success,
  children,
}: {
  action: string;
  submitLabel: string;
  success: React.ReactNode;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done")
    return (
      <div role="status" className="rounded-3xl border border-line bg-surface p-8 text-center">
        {success}
      </div>
    );

  return (
    // POST so typed details never end up in the address bar if the page's
    // JavaScript hasn't loaded yet.
    <form
      method="post"
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        try {
          const res = await fetch(action, { method: "POST", body: new FormData(e.currentTarget) });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
          setState("done");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          setState("idle");
        }
      }}
    >
      {children}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-gold w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
