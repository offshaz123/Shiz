"use client";

import { useEffect, useState } from "react";

/**
 * Telling a client they can keep this on their home screen.
 *
 * Two platforms, two completely different stories, which is why this is a
 * component rather than one line of text.
 *
 * Android fires beforeinstallprompt, so there can be a button that does it.
 * iOS fires nothing and never will: the only route is Share then Add to
 * Home Screen, so the only useful thing to do there is say so in words.
 *
 * Dismissed once, it stays dismissed. A banner that returns every visit is
 * an irritation, and this is a page people open several times a day.
 */

type InstallEvent = Event & { prompt: () => Promise<void> };

const DISMISSED = "sm_install_dismissed";

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  // Starts hidden and unknown. Everything this needs to decide — storage,
  // display mode, the user agent — only exists in the browser, so the
  // server and the first client render must agree on showing nothing.
  const [platform, setPlatform] = useState<{ ios: boolean; hidden: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Deferred rather than set in the effect body: a synchronous setState
    // there makes React render twice before paint, which the lint rule
    // flags and which is avoidable here for nothing.
    void Promise.resolve().then(() => {
      if (cancelled) return;

      let dismissed = false;
      try {
        dismissed = localStorage.getItem(DISMISSED) === "1";
      } catch {
        // Private window, or storage blocked. Treat as not dismissed.
      }
      // Already installed: standalone means it is on the home screen, so
      // there is nothing to suggest.
      const installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true;

      setPlatform({
        ios: /iphone|ipad|ipod/i.test(window.navigator.userAgent),
        hidden: dismissed || installed,
      });
    });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => {
      cancelled = true;
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  function dismiss() {
    setPlatform((p) => (p ? { ...p, hidden: true } : p));
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      // Nothing to do; it will offer again next time, which is survivable.
    }
  }

  // Nothing until the browser has been read, and nothing on a desktop
  // browser that offered no install event.
  if (!platform || platform.hidden || (!event && !platform.ios)) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Keep this on your home screen</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {platform.ios
            ? "Tap the Share button, then Add to Home Screen. It opens like an app, without the address bar."
            : "It opens like an app, without the address bar, and your diary is one tap away."}
        </p>
      </div>
      {event && (
        <button
          type="button"
          onClick={() => {
            void event.prompt();
            dismiss();
          }}
          className="brand-gradient-bg rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="text-xs font-semibold text-muted hover:text-foreground"
      >
        No thanks
      </button>
    </div>
  );
}
