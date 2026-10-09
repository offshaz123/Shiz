"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const CUTOFF_HOUR = 14;

// Seconds left until the same-day cutoff in UK time, or null when today's
// cutoff has passed or it's the weekend.
function secondsLeft(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  if (get("weekday") === "Sat" || get("weekday") === "Sun") return null;
  const elapsed = Number(get("hour")) * 3600 + Number(get("minute")) * 60 + Number(get("second"));
  const left = CUTOFF_HOUR * 3600 - elapsed;
  return left > 0 ? left : null;
}

function Box({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-[#f6e6ae] px-2 py-0.5 font-mono font-bold text-[#14110b]">{children}</span>;
}

export function DispatchCountdown() {
  const [left, setLeft] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setLeft(secondsLeft(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e8d89a] bg-[#fdf8e7] p-4" aria-live="off">
      <span className="gold-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
      <div className="text-sm">
        {left ? (
          <p className="flex flex-wrap items-center gap-1.5 font-semibold text-gold">
            Order in <Box>{pad(Math.floor(left / 3600))}</Box>:<Box>{pad(Math.floor((left % 3600) / 60))}</Box>:
            <Box>{pad(left % 60)}</Box> for same day dispatch
          </p>
        ) : (
          <p className="font-semibold text-gold">
            Order now for dispatch next working day (same day before {site.dispatchCutoff})
          </p>
        )}
        <p className="mt-1 text-muted">FREE tracked delivery · Next day upgrade available at checkout</p>
      </div>
    </div>
  );
}
