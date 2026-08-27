import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="etrGrad" x1="2" y1="4" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--brand-purple)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--brand-pink)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-orange)" }} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#06090c" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="url(#etrGrad)" strokeWidth="1.5" />

      {/* Car silhouette */}
      <path
        d="M7 26.5c0-1.4 1-2.6 2.4-2.9l2.1-.4 2-4c.5-1 1.5-1.6 2.6-1.6h7.8c1.1 0 2.1.6 2.6 1.6l2 4 2.1.4c1.4.3 2.4 1.5 2.4 2.9v1.3c0 .7-.6 1.2-1.2 1.2h-1.6a2.6 2.6 0 0 1-5.1 0h-9.2a2.6 2.6 0 0 1-5.1 0H8.2c-.7 0-1.2-.5-1.2-1.2v-1.3Z"
        stroke="url(#etrGrad)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M13.5 21.5h13" stroke="url(#etrGrad)" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="14.5" cy="27" r="1.7" fill="url(#etrGrad)" />
      <circle cx="25.5" cy="27" r="1.7" fill="url(#etrGrad)" />

      {/* Polish shine */}
      <path
        d="M20 8.5c1.6 1 2.7 2.6 3 4.4"
        stroke="url(#etrGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 10.5c.9.7 1.6 1.7 1.9 2.8"
        stroke="url(#etrGrad)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <LogoMark />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">
            EXCLUSIVE <span className="brand-gradient-text">TINTS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            &amp; REPAIRS
          </span>
        </span>
      )}
    </Link>
  );
}
