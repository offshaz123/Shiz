import Image from "next/image";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig } from "@/lib/plates";

// The customer's plate on the front of a car, shown in the basket before they
// pay. To change the photo, replace /public/mockup/car-front-studio.jpg and update
// PLATE_BOX: where the front plate sits in it, as % of the photo. The box is
// exactly the shape of a UK plate (520 × 111mm), so the plate drawn in it
// looks just like the one in the plate builder.
const PLATE_BOX = { left: 36.94, top: 63.96, width: 26.11, height: 8.85 };

export function CarPreview({ config }: { config: PlateConfig }) {
  return (
    <figure className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-[#e9e9e7]">
      <Image
        src="/mockup/car-front-studio.jpg"
        alt={`Your ${config.reg} number plate on the front of a car`}
        width={540}
        height={340}
        sizes="(min-width: 768px) 768px, 100vw"
        priority
        className="block h-auto w-full"
      />
      <PlatePreview
        config={config}
        side="front"
        className="absolute drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]"
        style={{ left: `${PLATE_BOX.left}%`, top: `${PLATE_BOX.top}%`, width: `${PLATE_BOX.width}%`, height: `${PLATE_BOX.height}%` }}
      />
    </figure>
  );
}
