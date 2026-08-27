"use client";

import { useEffect, useState } from "react";
import { accentThemes, ACCENT_STORAGE_KEY, type AccentTheme } from "@/lib/accents";

export function AccentPicker() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a value only available client-side after mount
      setActiveId(localStorage.getItem(ACCENT_STORAGE_KEY));
    } catch {
      // localStorage unavailable — theme picker still works, just won't persist.
    }
  }, []);

  function choose(theme: AccentTheme) {
    const root = document.documentElement.style;
    root.setProperty("--brand-purple", theme.purple);
    root.setProperty("--brand-pink", theme.pink);
    root.setProperty("--brand-orange", theme.orange);
    setActiveId(theme.id);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, theme.id);
    } catch {
      // ignore — nothing to persist to
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose colour theme"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-brand/60"
      >
        <span className="brand-gradient-bg h-4 w-4 rounded-full border border-white/30" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3 shadow-xl">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Colour theme
            </p>
            <div className="grid grid-cols-3 gap-2">
              {accentThemes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  title={theme.label}
                  aria-label={theme.label}
                  onClick={() => choose(theme)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${theme.purple}, ${theme.pink} 55%, ${theme.orange})`,
                    borderColor: activeId === theme.id ? "var(--foreground)" : "transparent",
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
