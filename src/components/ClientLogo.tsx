import type { ClientResult } from "@/content/case-studies";

/**
 * The client's own mark. Where we don't have one, falls back to a monogram
 * tile so the row still lines up rather than collapsing.
 */
export function ClientLogo({
  result,
  size = 44,
  onDark = false,
}: {
  result: Pick<ClientResult, "client" | "logo">;
  size?: number;
  onDark?: boolean;
}) {
  const box = onDark
    ? "border-white/15 bg-white/10"
    : "border-border bg-background";

  if (!result.logo) {
    const initials = result.client
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("");
    return (
      <span
        aria-hidden
        style={{ width: size, height: size }}
        className={`inline-flex shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${box} ${
          onDark ? "text-white/80" : "text-muted"
        }`}
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1.5 ${box}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- client marks are
          small fixed-size assets, several of them SVG; next/image adds nothing here */}
      <img
        src={result.logo}
        alt={`${result.client} logo`}
        width={size}
        height={size}
        className="h-full w-full object-contain"
        loading="lazy"
      />
    </span>
  );
}
