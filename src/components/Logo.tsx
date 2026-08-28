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

      {/* Hexagonal crest */}
      <path
        d="M20 1.5 36 10.5v18L20 38.5 4 28.5v-18L20 1.5Z"
        fill="#06090c"
        stroke="url(#etrGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Wing flourishes */}
      <path
        d="M15 24c-3.4-.4-6.2-2-8.2-4.6"
        stroke="url(#etrGrad)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M15 21.3c-2.6-.4-4.8-1.6-6.4-3.6"
        stroke="url(#etrGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      <path
        d="M25 24c3.4-.4 6.2-2 8.2-4.6"
        stroke="url(#etrGrad)"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M25 21.3c2.6-.4 4.8-1.6 6.4-3.6"
        stroke="url(#etrGrad)"
        strokeWidth="0.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />

      {/* Low, custom coupe silhouette */}
      <path
        d="M11.5 24.8c0-1 .8-1.9 1.8-2.1l2.3-.5 2.4-3.4c.6-.9 1.7-1.4 2.8-1.4h.4c1.1 0 2.2.5 2.8 1.4l2.4 3.4 2.3.5c1 .2 1.8 1.1 1.8 2.1v.9c0 .6-.5 1-1 1h-1.1a2.2 2.2 0 0 1-4.3 0h-6.2a2.2 2.2 0 0 1-4.3 0h-1.1c-.6 0-1-.4-1-1v-.9Z"
        stroke="url(#etrGrad)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M15.5 20.8h9" stroke="url(#etrGrad)" strokeWidth="1.3" strokeLinecap="round" />
      {/* Custom alloy wheels */}
      <circle cx="16" cy="25.6" r="1.5" stroke="url(#etrGrad)" strokeWidth="0.9" />
      <circle cx="24" cy="25.6" r="1.5" stroke="url(#etrGrad)" strokeWidth="0.9" />
      <path d="M16 24.2v2.8M14.7 25.6h2.6M15 24.9l2 1.4M17 24.9l-2 1.4" stroke="url(#etrGrad)" strokeWidth="0.5" />
      <path d="M24 24.2v2.8M22.7 25.6h2.6M23 24.9l2 1.4M25 24.9l-2 1.4" stroke="url(#etrGrad)" strokeWidth="0.5" />

      {/* Executive star */}
      <path
        d="M20 6.2 20.9 8l2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L16.6 8.3l2-.3.4-1.8Z"
        fill="url(#etrGrad)"
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
            EXECUTIVE <span className="brand-gradient-text">TINTS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            &amp; REPAIRS
          </span>
        </span>
      )}
    </Link>
  );
}
