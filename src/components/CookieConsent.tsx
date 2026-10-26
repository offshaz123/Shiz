"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

/**
 * Cookie consent, and the gate the tracking scripts sit behind.
 *
 * Nothing that writes to a visitor's device loads until they choose Accept.
 * That is what the law asks for, and it costs something real: people who
 * decline are invisible to the Meta Pixel, so audiences and reported
 * conversions are smaller than the traffic. Smaller and honest beats larger
 * and indefensible.
 *
 * Reject is the same size, colour and weight as Accept. A banner where
 * refusing is harder than agreeing is the specific pattern regulators go
 * after, and it is also just a rude thing to do to somebody.
 *
 * The choice lives in localStorage, which needs no consent of its own —
 * remembering that someone said no is doing what they asked. There is no
 * cookie here and nothing about the choice reaches our server.
 *
 * It is held in a module-level store read through useSyncExternalStore
 * rather than in state seeded from an effect. The value exists outside
 * React, and this way every component that cares sees the same answer the
 * moment it changes, with no flash of the wrong one on hydration.
 */

type Choice = "accepted" | "rejected";
const KEY = "sm_cookie_choice";

let listeners: (() => void)[] = [];
/** undefined means "not read yet"; null means "read, no choice made". */
let cached: Choice | null | undefined;

function readStorage(): Choice | null {
  // Storage throws in a private window or with site data blocked. A failure
  // means we never got consent, which is the safe reading.
  try {
    const stored = localStorage.getItem(KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function getSnapshot(): Choice | null {
  if (cached === undefined) cached = readStorage();
  return cached;
}

/** On the server nobody has consented, so nothing tracking-related renders. */
function getServerSnapshot(): Choice | null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  // Another tab answering the banner should settle it here too.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cached = readStorage();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setChoice(next: Choice | null): void {
  cached = next;
  try {
    if (next === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    // Their choice still holds for this visit; it just won't be remembered.
  }
  listeners.forEach((l) => l());
}

function useChoice(): Choice | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** False during server render and hydration, true once running in the browser. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** True once the visitor has actively accepted. Nothing else counts. */
export function useAnalyticsAllowed(): boolean {
  return useChoice() === "accepted";
}

export function CookieBanner() {
  const choice = useChoice();
  const hydrated = useHydrated();

  // Nothing until we're in the browser with the stored answer in hand, so a
  // returning visitor who already answered never sees the banner flash up.
  if (!hydrated || choice !== null) return null;

  const button =
    "flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-7";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-surface/95 p-4 backdrop-blur sm:p-5"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-muted">
          We&apos;d like to use analytics and advertising cookies to see how people find this
          site. We won&apos;t set any unless you say yes.{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setChoice("rejected")}
            className={`${button} border border-border text-foreground hover:bg-background`}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setChoice("accepted")}
            className={`${button} brand-gradient-bg text-white`}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link, so withdrawing consent is as easy as giving it. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => setChoice(null)} className={className}>
      Cookie settings
    </button>
  );
}
