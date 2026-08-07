import type { SwatchVisual } from "@/content/services";

function swatchStyle(swatch?: SwatchVisual): React.CSSProperties {
  if (!swatch) return { background: "var(--surface-2)" };
  if (swatch.kind === "solid") return { background: swatch.hex };
  if (swatch.kind === "gradient") return { background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})` };
  return {};
}

function CarTintPreview({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 240 130" className="h-28 w-full">
      <rect width="240" height="130" rx="14" fill="var(--surface-2)" />
      <line x1="14" y1="102" x2="226" y2="102" stroke="var(--border)" strokeWidth="2" />
      <path
        d="M22,98 L22,78 L50,78 L67,46 L153,46 L170,78 L218,78 L218,98 Z"
        fill="#9aa4ab"
        stroke="#6b747b"
        strokeWidth="1.5"
      />
      <path d="M71,49 L149,49 L162,75 L58,75 Z" fill="#cfeaf3" />
      <path d="M71,49 L149,49 L162,75 L58,75 Z" fill="#000" fillOpacity={opacity} />
      <path d="M71,49 L149,49 L162,75 L58,75 Z" fill="none" stroke="#6b747b" strokeWidth="1" />
      <circle cx="58" cy="98" r="12" fill="#2b3136" />
      <circle cx="58" cy="98" r="4.5" fill="#5a6167" />
      <circle cx="185" cy="98" r="12" fill="#2b3136" />
      <circle cx="185" cy="98" r="4.5" fill="#5a6167" />
    </svg>
  );
}

export function VariantSwatch({ swatch }: { swatch?: SwatchVisual }) {
  if (swatch?.kind === "tint") {
    return <CarTintPreview opacity={swatch.opacity} />;
  }

  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100/20 to-sky-300/10">
      <div className="absolute inset-0" style={swatchStyle(swatch)} />
    </div>
  );
}
