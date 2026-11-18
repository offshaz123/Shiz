"use client";

import { useEffect, useState } from "react";

/**
 * How to put this on a phone's home screen.
 *
 * There is no App Store download and this page does not pretend there is.
 * What we have is a web app that installs to the home screen and then
 * behaves like any other app — its own icon, no address bar, opens on the
 * dashboard — and the honest version of that is a page of two short sets
 * of instructions rather than a pair of store badges that go nowhere.
 *
 * Android fires beforeinstallprompt, so there can be a button that does
 * it in one tap. iOS fires nothing and never will: the only route is
 * Share then Add to Home Screen, so the only useful thing there is to say
 * so in the right words and show which button.
 *
 * The phone being used is detected so its own steps come first, and both
 * sets stay on the page — half of these get read on a laptop and followed
 * on a phone afterwards.
 */

type InstallEvent = Event & { prompt: () => Promise<void> };

type Where = "ios" | "android" | "desktop";

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground">
        {n}
      </span>
      <span className="pt-0.5 text-sm leading-relaxed text-muted">{children}</span>
    </li>
  );
}

function Card({
  title,
  active,
  children,
}: {
  title: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border bg-surface p-5 sm:p-6 ${
        active ? "border-brand-pink/50" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {active && (
          <span className="rounded-full bg-brand-pink/15 px-2 py-0.5 text-[10px] font-bold text-brand-pink">
            YOU ARE ON THIS
          </span>
        )}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function AppInstructions() {
  const [where, setWhere] = useState<Where | null>(null);
  const [installed, setInstalled] = useState(false);
  const [event, setEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Deferred rather than set in the effect body: a synchronous setState
    // there makes React render twice before paint for nothing.
    void Promise.resolve().then(() => {
      if (cancelled) return;

      const ua = navigator.userAgent;
      // iPadOS reports itself as a Mac, so a touch screen is what tells
      // the two apart.
      const ios =
        /iPhone|iPad|iPod/.test(ua) ||
        (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
      const android = /Android/.test(ua);
      setWhere(ios ? "ios" : android ? "android" : "desktop");

      try {
        setInstalled(window.matchMedia("(display-mode: standalone)").matches);
      } catch {
        // Older browsers. Showing the instructions anyway costs nothing.
      }
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

  if (installed) {
    return (
      <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-5 py-4 text-sm leading-relaxed text-foreground">
        <b>It is already on your home screen.</b> You are reading this inside the app right now.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {event && (
        <section className="rounded-2xl border border-brand-pink/50 bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-foreground">One tap on this phone</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Your browser can do it for you. No steps to follow.
          </p>
          <button
            type="button"
            onClick={() => {
              void event.prompt();
              setEvent(null);
            }}
            className="brand-gradient-bg mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add it to my home screen
          </button>
        </section>
      )}

      <Card title="On an iPhone or iPad" active={where === "ios"}>
        <ol className="flex flex-col gap-3">
          <Step n={1}>
            Open this page in <b className="text-foreground">Safari</b>. It has to be Safari —
            Chrome on an iPhone cannot do this, which is Apple&rsquo;s rule rather than ours.
          </Step>
          <Step n={2}>
            Tap the <b className="text-foreground">Share</b> button — the square with an arrow
            coming out of the top, at the bottom of the screen.
          </Step>
          <Step n={3}>
            Scroll down the list and tap{" "}
            <b className="text-foreground">Add to Home Screen</b>.
          </Step>
          <Step n={4}>
            Tap <b className="text-foreground">Add</b>. It will be sat on your home screen with
            your own logo on it.
          </Step>
        </ol>
      </Card>

      <Card title="On an Android phone" active={where === "android"}>
        <ol className="flex flex-col gap-3">
          <Step n={1}>
            Open this page in <b className="text-foreground">Chrome</b>.
          </Step>
          <Step n={2}>
            Tap the <b className="text-foreground">three dots</b> in the top right corner.
          </Step>
          <Step n={3}>
            Tap <b className="text-foreground">Install app</b>, or{" "}
            <b className="text-foreground">Add to Home screen</b> if that is what yours says.
          </Step>
          <Step n={4}>
            Tap <b className="text-foreground">Install</b>.
          </Step>
        </ol>
      </Card>

      {where === "desktop" && (
        <p className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
          You are on a computer. Open{" "}
          <b className="text-foreground">shazmarketing.com/portal</b> on your phone and follow
          whichever set of steps above matches it — or send yourself the link.
        </p>
      )}
    </div>
  );
}
