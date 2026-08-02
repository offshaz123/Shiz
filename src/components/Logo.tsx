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
        <linearGradient id="shazGrad" x1="2" y1="4" x2="38" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7b2ff7" />
          <stop offset="0.55" stopColor="#e0218a" />
          <stop offset="1" stopColor="#f7941e" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0a0a0c" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="url(#shazGrad)" strokeWidth="1.5" />
      <path
        d="M12 26c2.5 2.4 5.7 3.6 9 3.2 4-0.5 6.6-3 6.6-5.9 0-3.3-3-4.4-6.9-5.2-4.4-0.9-6-1.7-6-3.4 0-1.8 2-3 4.6-3 2.4 0 4.6 0.8 6.6 2.5"
        stroke="url(#shazGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M27 10.5l3.6 0 0 3.6"
        stroke="url(#shazGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M30.5 10.6L21.8 19.3"
        stroke="url(#shazGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
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
            SHAZ <span className="brand-gradient-text">MARKETING</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            GROUP
          </span>
        </span>
      )}
    </Link>
  );
}
