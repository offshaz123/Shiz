// Drawn version of the PlatedUp badge: a gold plate with a car parked on
// its corner. To use the original artwork instead, drop it in
// /public/logo.png and swap this for <img src="/logo.png" alt="PlatedUp" />.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 230 116"
      role="img"
      aria-label="PlatedUp"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e48a" />
          <stop offset="0.45" stopColor="#d1b443" />
          <stop offset="0.55" stopColor="#b8962b" />
          <stop offset="1" stopColor="#e2c862" />
        </linearGradient>
        <linearGradient id="logo-car" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4a50" />
          <stop offset="1" stopColor="#0d0d10" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="212" height="82" rx="9" fill="#111" />
      <rect x="9" y="9" width="202" height="72" rx="6" fill="url(#logo-gold)" />
      <rect x="13" y="13" width="194" height="64" rx="4" fill="none" stroke="#111" strokeWidth="1.5" />
      <text
        x="110"
        y="61"
        textAnchor="middle"
        fontFamily="var(--font-heading), Arial Black, sans-serif"
        fontWeight="800"
        fontSize="42"
        letterSpacing="-0.5"
        fill="#111"
      >
        PLATEDUP
      </text>
      {/* car */}
      <g transform="translate(118 70)">
        <path
          d="M4 30 C2 24 6 20 14 19 L34 15 C44 6 58 2 74 3 C86 4 96 10 104 17 L108 21 C110 23 110 28 108 31 L104 34 L8 34 Z"
          fill="url(#logo-car)"
          stroke="#fff"
          strokeWidth="1.6"
        />
        <path d="M40 15 C48 9 58 7 70 7 L72 16 Z" fill="#9aa0a8" opacity="0.8" />
        <path d="M76 7 C86 8 93 12 98 17 L78 16 Z" fill="#9aa0a8" opacity="0.8" />
        <circle cx="26" cy="33" r="8.5" fill="#111" stroke="#fff" strokeWidth="1.6" />
        <circle cx="26" cy="33" r="3.5" fill="#bbb" />
        <circle cx="88" cy="33" r="8.5" fill="#111" stroke="#fff" strokeWidth="1.6" />
        <circle cx="88" cy="33" r="3.5" fill="#bbb" />
      </g>
    </svg>
  );
}
