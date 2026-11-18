"use client";

import { useState, type ReactNode } from "react";

export type Section = {
  id: string;
  /** Short enough that four of them fit across a phone. */
  label: string;
  content: ReactNode;
};

/**
 * One thing at a time on a phone, everything at once on a desktop.
 *
 * A dashboard that stacks five blocks is fine on a laptop and miserable on
 * a phone: the thing you opened the app for is four scrolls down, and you
 * have to scroll past the charts every single time to reach the list of
 * people who got in touch. The buttons are the fix — not a hamburger, not
 * a dropdown you have to open first. They are all on screen, so picking is
 * one tap and you can see where you are without opening anything.
 *
 * Above `lg` the buttons disappear and every panel shows at once, because
 * on a wide screen the comparison between the blocks is the point and
 * hiding three quarters of it behind tabs would be worse, not better.
 *
 * Buttons rather than ARIA tabs, because at desktop width there is no tab
 * list and every panel is visible — a screen reader told it was looking at
 * tab panels would be told something untrue half the time. `aria-pressed`
 * is accurate in both layouts, and a hidden panel is `display: none`, so
 * it is properly out of the way rather than merely invisible.
 */
export function PhoneSections({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(sections[0]?.id ?? "");

  return (
    <>
      <div
        role="group"
        aria-label="Choose what to look at"
        className="flex gap-1 rounded-2xl border border-border bg-surface p-1.5 lg:hidden"
      >
        {sections.map((section) => {
          const active = section.id === open;
          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={active}
              onClick={() => setOpen(section.id)}
              className={`flex-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      {sections.map((section) => (
        <div key={section.id} className={active(section.id, open)}>
          {section.content}
        </div>
      ))}
    </>
  );
}

/**
 * Hidden on a phone unless chosen; always shown from `lg` up. Written out
 * rather than built from a template string so Tailwind sees both classes.
 */
function active(id: string, open: string): string {
  return id === open ? "lg:block" : "hidden lg:block";
}
