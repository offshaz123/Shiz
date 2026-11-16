"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * The two things on the overview that have to be live rather than rendered
 * once.
 *
 * A clock, because a time that is right is the plainest possible proof that
 * what you are looking at is now and not a screenshot. And a quiet refresh,
 * because this page gets left open on a laptop all day and a dashboard
 * showing yesterday's figures is worse than one that admits it is stale.
 *
 * Every sixty seconds, and only while the tab is actually being looked at.
 * A backgrounded tab asking the server for counts nobody is reading is just
 * somebody's battery.
 *
 * It used to print "ENGINE RUNNING" alongside the clock, which was the same
 * state the pill beside it already showed, in hardcoded slate that ignored
 * the theme. The pill kept the job; this kept the clock.
 */
export function EngineLive() {
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

  // Nothing until the clock has read the browser's time, so the server and
  // the first client render agree.
  if (!now) return null;

  return (
    <span className="text-[11px] tabular-nums text-muted">
      {now} London · refreshes on its own
    </span>
  );
}
