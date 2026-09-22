import type { ReactNode } from "react";

/**
 * The page rhythm: one max width, one gutter, one vertical spacing scale.
 * Everything on the site lays out through this so the sections line up.
 */
export function Section({
  children,
  className = "",
  tone = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "ink";
  id?: string;
}) {
  const tones = {
    default: "",
    surface: "bg-surface",
    ink: "bg-ink text-on-ink",
  } as const;

  return (
    <section id={id} className={`${tones[tone]} ${className}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {lede && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lede}</p>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-background p-6 transition-colors hover:border-accent/60 ${className}`}
    >
      {children}
    </div>
  );
}
