"use client";

export const THEME_KEY = "pu-theme";

// Switches between the white and black versions of the site and remembers
// the choice. The icons swap with CSS, so there's nothing to load first.
export function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const root = document.documentElement;
        const dark = root.dataset.theme !== "dark";
        if (dark) root.dataset.theme = "dark";
        else delete root.dataset.theme;
        try {
          localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
        } catch {}
      }}
      className={`flex h-11 w-11 items-center justify-center rounded-lg border border-line hover:bg-surface ${className}`}
      aria-label="Switch between light and dark mode"
      title="Light / dark mode"
    >
      <svg viewBox="0 0 24 24" className="theme-moon h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="theme-sun h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
