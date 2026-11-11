"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The two things on the board that have to be live rather than drawn.
 *
 * A clock, because a time that is right is the plainest possible proof that
 * what you are looking at is now and not a screenshot. And a quiet refresh,
 * because this page gets left open on a laptop all day and a dashboard
 * showing yesterday's figures is worse than one that admits it is stale.
 *
 * Every sixty seconds, and only while the tab is actually being looked at —
 * a backgrounded tab asking the server for counts nobody is reading is just
 * someone's battery.
 */
export function EngineLive({ running }: { running: boolean }) {
  const router = useRouter();
  const [now, setNow] = useState("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/London",
        }).format(new Date()),
      );
    tick();
    const clock = setInterval(tick, 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => clearInterval(refresh);
  }, [router]);

  return (
    <div className="mt-4 flex items-center justify-between text-[11px] font-semibold tracking-wide text-slate-500">
      <span className="flex items-center gap-2">
        <span
          className={`engine-dot h-1.5 w-1.5 rounded-full ${
            running ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        {running ? "ENGINE RUNNING" : "ENGINE HELD"}
      </span>
      <span className="tabular-nums">{now ? `${now} London` : ""}</span>
    </div>
  );
}
