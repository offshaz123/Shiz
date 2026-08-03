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
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#06090c" />
      <rect x="1" y="1" width="38" height="38" rx="11" stroke="#0ea5c4" strokeWidth="1.5" />
      <path
        d="M9 27 20 10l11 17"
        stroke="#0ea5c4"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13.5 27h13"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M20 10v6.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <LogoMark />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight">
            <span className="text-foreground">S</span>
            <span className="text-brand-pink">M</span>
            <span className="text-foreground">G</span>{" "}
            <span className="brand-gradient-text">DETAILS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            SHAZ MOTOR GROUP
          </span>
        </span>
      )}
    </Link>
  );
}
