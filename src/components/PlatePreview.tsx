import { useId } from "react";
import { site } from "@/lib/site";
import { type BadgeId, type PlateConfig, badges, formatReg, styles } from "@/lib/plates";

// Standard car plate, 520 × 111mm.
const w = 520;
const h = 111;

function Flag({ badge, w, h }: { badge: BadgeId; w: number; h: number }) {
  if (badge === "uk")
    return (
      <g>
        <rect width={w} height={h} fill="#012169" />
        <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#fff" strokeWidth={h * 0.2} />
        <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#C8102E" strokeWidth={h * 0.07} />
        <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#fff" strokeWidth={h * 0.32} />
        <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#C8102E" strokeWidth={h * 0.18} />
      </g>
    );
  if (badge === "eng")
    return (
      <g>
        <rect width={w} height={h} fill="#fff" />
        <path d={`M${w / 2} 0 V${h} M0 ${h / 2} H${w}`} stroke="#CE1124" strokeWidth={h * 0.22} />
      </g>
    );
  if (badge === "sco")
    return (
      <g>
        <rect width={w} height={h} fill="#005EB8" />
        <path d={`M0 0 L${w} ${h} M${w} 0 L0 ${h}`} stroke="#fff" strokeWidth={h * 0.2} />
      </g>
    );
  if (badge === "cym")
    return (
      <g>
        <rect width={w} height={h / 2} fill="#fff" />
        <rect y={h / 2} width={w} height={h / 2} fill="#00B140" />
        <path
          d={`M${w * 0.2} ${h * 0.7} Q${w * 0.35} ${h * 0.25} ${w * 0.55} ${h * 0.4} L${w * 0.8} ${h * 0.22} L${w * 0.7} ${h * 0.5} Q${w * 0.6} ${h * 0.8} ${w * 0.3} ${h * 0.78} Z`}
          fill="#D30731"
        />
      </g>
    );
  return null;
}

export function PlatePreview({
  config,
  side,
  label,
  className = "",
}: {
  config: PlateConfig;
  side: "front" | "rear";
  // Show this text exactly as given instead of the formatted registration.
  label?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reg = label ?? (formatReg(config.reg) || "YOUR REG");
  const style = styles.find((s) => s.id === config.style) ?? styles[0];
  const badge = badges.find((b) => b.id === config.badge) ?? badges[0];
  const evW = config.ev ? 14 : 0;
  const bandW = config.badge !== "none" ? 50 : 0;
  const left = evW + bandW;
  const cx = left + (w - left) / 2;
  const fontSize = 86;
  const baseline = h / 2 + fontSize * 0.36;

  const textFill = style.look === "gel" ? `url(#gel-${uid})` : "#111";
  const d = style.depth;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      role="img"
      aria-label={`${side === "front" ? "Front" : "Rear"} plate preview: ${reg}`}
    >
      <defs>
        <linearGradient id={`gel-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3b3b" />
          <stop offset="0.35" stopColor="#0a0a0a" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id={`sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {d > 0 && (
          <filter id={`raised-${uid}`} x="-5%" y="-5%" width="115%" height="140%">
            {style.look === "acrylic" && (
              <feDropShadow dx={d * 0.6} dy={d} stdDeviation="0" floodColor="#4a4a4a" floodOpacity="1" />
            )}
            <feDropShadow dx={d * 0.4} dy={d * 1.2} stdDeviation={0.6 + d * 0.5} floodOpacity="0.45" />
          </filter>
        )}
      </defs>

      <rect width={w} height={h} rx="7" fill={side === "front" ? "var(--plate-front)" : "var(--plate-rear)"} />
      <rect width={w} height={h} rx="7" fill={`url(#sheen-${uid})`} />

      {config.ev && <rect x="3" y="3" width={evW} height={h - 6} rx="4" fill="#00a651" />}

      {config.badge !== "none" && (
        <g>
          <rect x={3 + evW} y="3" width={bandW - 3} height={h - 6} rx="5" fill="#0b3c91" />
          <g transform={`translate(${evW + bandW / 2 - 15} ${h / 2 - 32})`}>
            <Flag badge={config.badge} w={30} h={20} />
          </g>
          <text
            x={evW + bandW / 2 + 1.5}
            y={h / 2 + 26}
            textAnchor="middle"
            fontFamily="var(--font-plate)"
            fontWeight="600"
            fontSize={badge.code.length > 2 ? 15 : 19}
            fill="#fff"
          >
            {badge.code}
          </text>
        </g>
      )}

      {config.border === "black" && (
        <rect x="5" y="5" width={w - 10} height={h - 10} rx="5" fill="none" stroke="#111" strokeWidth="3" />
      )}

      <text
        x={cx}
        y={baseline}
        textAnchor="middle"
        fontFamily="var(--font-plate)"
        fontWeight="600"
        fontSize={fontSize}
        letterSpacing="2"
        fill={textFill}
        filter={d > 0 ? `url(#raised-${uid})` : undefined}
      >
        {reg}
      </text>

      <text
        x={cx}
        y={h - 5}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="6"
        fill="#444"
      >
        {site.name.toUpperCase()} {site.postcode} · BS AU 145e
      </text>
    </svg>
  );
}
