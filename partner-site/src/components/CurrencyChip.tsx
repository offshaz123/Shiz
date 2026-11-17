import { currencyFlags } from "@/lib/brand";
import { Flag } from "@/components/Flag";

/**
 * A currency, with the flag of the country it belongs to.
 *
 * One component for every currency chip on the site, so a code is never
 * written without its flag in one place and with it in another.
 */
export function CurrencyChip({
  code,
  name,
  tone = "outline",
  className = "",
}: {
  code: string;
  /** The currency's full name, where there is room for it. */
  name?: string;
  tone?: "outline" | "soft";
  className?: string;
}) {
  const tones = {
    outline: "border border-border bg-card",
    soft: "bg-accent-soft text-accent-2",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${tones[tone]} ${className}`}
    >
      <Flag code={currencyFlags[code] ?? ""} className="h-3 w-[18px]" />
      <span className="font-mono text-xs font-semibold">{code}</span>
      {name && <span className="text-xs text-muted">{name}</span>}
    </span>
  );
}
