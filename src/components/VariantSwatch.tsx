import Image from "next/image";
import type { SwatchVisual } from "@/content/services";

function swatchStyle(swatch?: SwatchVisual): React.CSSProperties {
  if (!swatch) return { background: "var(--surface-2)" };
  if (swatch.kind === "solid") return { background: swatch.hex };
  if (swatch.kind === "gradient") return { background: `linear-gradient(135deg, ${swatch.from}, ${swatch.to})` };
  return {};
}

// Traces the window band (front quarter glass through to the rear screen) on
// /tint-preview/bmw-m8-gran-coupe.png, a 630x201 side-profile reference photo
// (cropped tight to the car), following the roofline and beltline closely.
const WINDOW_POLYGON =
  "215,76 238,24 320,12 420,12 474,30 474,50 431,63 354,63 347,69 238,69";

function CarTintPreview({ opacity }: { opacity: number }) {
  return (
    <div className="relative h-28 w-full overflow-hidden rounded-xl border border-border bg-surface-2">
      <Image
        src="/tint-preview/bmw-m8-gran-coupe.png"
        alt="Side profile of a car showing the window area"
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className="object-contain"
      />
      <svg viewBox="0 0 630 201" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        {/* Reset the photo's own glass to a neutral, even base before applying the shade,
            so every card starts clear and the shade reads as true black, not blue-grey. */}
        <polygon points={WINDOW_POLYGON} fill="#e8e8e8" fillOpacity={0.94} />
        <polygon points={WINDOW_POLYGON} fill="#000" fillOpacity={opacity} />
      </svg>
    </div>
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
