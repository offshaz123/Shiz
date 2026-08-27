"use client";

import { useEffect, useState } from "react";
import { accents, ACCENT_STORAGE_KEY } from "@/lib/accents";

export function AccentPicker() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a value only available client-side after mount
      setActive(localStorage.getItem(ACCENT_STORAGE_KEY));
    } catch {
      // localStorage unavailable — accent picker still works, just won't persist.
    }
  }, []);

  function choose(hex: string) {
    document.documentElement.style.setProperty("--brand", hex);
    setActive(hex);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    } catch {
      // ignore — nothing to persist to
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose accent colour"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand/60"
      >
        <span
          className="h-4 w-4 rounded-full border border-white/30"
          style={{ backgroundColor: "var(--brand)" }}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3 shadow-xl">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Accent colour
            </p>
            <div className="grid grid-cols-3 gap-2">
              {accents.map((accent) => (
                <button
                  key={accent.id}
                  type="button"
                  title={accent.label}
                  aria-label={accent.label}
                  onClick={() => choose(accent.hex)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: accent.hex,
                    borderColor: active === accent.hex ? "var(--foreground)" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
