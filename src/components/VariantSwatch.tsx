import type { SwatchVisual } from "@/content/services";

function swatchStyle(swatch?: SwatchVisual): React.CSSProperties {
  if (!swatch) return { background: "var(--surface-2)" };
  if (swatch.kind === "solid") return { background: swatch.hex };
  if (swatch.kind === "gradient") return { background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})` };
  return {};
}

export function VariantSwatch({ swatch }: { swatch?: SwatchVisual }) {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-100/20 to-sky-300/10">
      {swatch?.kind === "tint" ? (
        <div className="absolute inset-0 bg-black" style={{ opacity: swatch.opacity }} />
      ) : (
        <div className="absolute inset-0" style={swatchStyle(swatch)} />
      )}
    </div>
  );
}
