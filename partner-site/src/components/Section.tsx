import type { ReactNode } from "react";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";

/**
 * The page rhythm: one max width, one gutter, one vertical spacing scale.
 * Everything on the site lays out through this so the sections line up.
 */
export function Section({
  children,
  className = "",
  tone = "default",
  id,
  backdrop,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "ink";
  id?: string;
  /**
   * A photograph behind the whole band. It has to hang off the <section>
   * rather than the inner container, or it would be clipped to the 6xl
   * measure and stop short of the edges. Only use it with tone="ink": the
   * wash is dark, and dark copy on it would be unreadable.
   */
  backdrop?: { src: string; strength?: "full" | "soft"; position?: string };
}) {
  const tones = {
    default: "",
    surface: "surface-tint",
    ink: "ink-tint text-on-ink",
  } as const;

  return (
    <section
      id={id}
      className={`${tones[tone]} ${backdrop ? "relative overflow-hidden" : ""} ${className}`}
    >
      {backdrop && <PhotoBackdrop {...backdrop} />}
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-20">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow-rule text-xs font-semibold uppercase tracking-[0.18em] text-accent">
      {children}
    </p>
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
      <h2 className="font-display text-balance mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
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
    <div className={`card reveal p-6 ${className}`}>
      {children}
    </div>
  );
}
