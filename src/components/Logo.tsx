import Link from "next/link";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="38" height="38" rx="9" fill="#0a0a0b" />
      <rect x="1" y="1" width="38" height="38" rx="9" stroke="var(--brand)" strokeWidth="1.4" />
      <path
        d="M20 6.5 30.5 12v8.2c0 6.4-4.4 11.6-10.5 13.3-6.1-1.7-10.5-6.9-10.5-13.3V12L20 6.5Z"
        stroke="var(--brand)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.5 20.2 18 23.7l7.5-7.9"
        stroke="var(--brand)"
        strokeWidth="2.1"
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
            EXCLUSIVE <span style={{ color: "var(--brand)" }}>TINTS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            &amp; REPAIRS
          </span>
        </span>
      )}
    </Link>
  );
}
