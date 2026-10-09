function Chip({ children, className = "bg-white" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded border border-black/10 px-2 text-[11px] font-extrabold tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#1d4ed8]" fill="currentColor" aria-hidden>
          <path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z" />
        </svg>
        <span className="leading-tight">
          Secure
          <br />
          <span className="text-xs font-medium text-muted">SSL checkout</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#16a34a]" fill="currentColor" aria-hidden>
          <path d="M12 1.5 14.6 4l3.5-.4.9 3.4 3.1 1.7-1.3 3.3 1.3 3.3-3.1 1.7-.9 3.4-3.5-.4L12 22.5 9.4 20l-3.5.4-.9-3.4-3.1-1.7L3.2 12 1.9 8.7 5 7l.9-3.4 3.5.4L12 1.5Zm-1.1 14 6-6-1.4-1.4-4.6 4.6-2.1-2.1-1.4 1.4 3.5 3.5Z" />
        </svg>
        <span className="leading-tight">
          DVLA
          <br />
          <span className="text-xs font-medium text-muted">Registered</span>
        </span>
      </div>
      <div className="flex gap-1.5" aria-label="We accept Visa, Mastercard, American Express and Apple Pay">
        <Chip className="text-[#1a1f71]">VISA</Chip>
        <Chip>
          <span className="flex" aria-hidden>
            <span className="h-3.5 w-3.5 rounded-full bg-[#eb001b]" />
            <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b] mix-blend-multiply" />
          </span>
        </Chip>
        <Chip className="bg-[#2e77bc] text-white">AMEX</Chip>
        <Chip>Apple Pay</Chip>
      </div>
    </div>
  );
}
