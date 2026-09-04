import Link from "next/link";

// The compact mark: a gold "E" inside a hairline square. Used wherever the full
// wordmark would be illegible — favicons, avatars, anything under ~48px.
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="etrGold" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--gold-text-1)" }} />
          <stop offset="0.32" style={{ stopColor: "var(--gold-text-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--gold-text-3)" }} />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="52" height="52" stroke="url(#etrGold)" strokeWidth="2.6" />
      <text
        x="32.4"
        y="45.5"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontWeight="600"
        fontSize="38"
        fill="url(#etrGold)"
      >
        E
      </text>
    </svg>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  if (!withWordmark) {
    return (
      <Link href="/" className="shrink-0" aria-label="Executive Tints &amp; Repairs">
        <LogoMark />
      </Link>
    );
  }

  return (
    <Link href="/" className="flex shrink-0 flex-col leading-none">
      <span className="brand-gradient-text font-serif text-[19px] font-semibold tracking-[0.30em] sm:text-[22px]">
        EXECUTIVE
      </span>
      <span className="mt-[3px] text-[8px] font-semibold tracking-[0.34em] text-muted sm:text-[9px]">
        TINTS &amp; REPAIRS
      </span>
    </Link>
  );
}
