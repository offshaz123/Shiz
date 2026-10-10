import Image from "next/image";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig } from "@/lib/plates";

// The customer's plate on the front of a car, shown in the basket before they
// pay. To change the photo, replace /public/mockup/car-front.jpg and update
// PLATE_BOX: where the front plate sits in it, as % of the photo.
const PLATE_BOX = { left: 41.0, top: 61.6, width: 17.9, height: 8.0 };

export function CarPreview({ config }: { config: PlateConfig }) {
  return (
    <figure className="relative w-full overflow-hidden rounded-3xl bg-[#e9e9e7]">
      <Image
        src="/mockup/car-front.jpg"
        alt={`Your ${config.reg} number plate on the front of a car`}
        width={800}
        height={400}
        sizes="(min-width: 1024px) 960px, 100vw"
        priority
        className="block h-auto w-full"
      />
      <div
        className="absolute flex items-center justify-center rounded-[2px] bg-[#f8f8f5]"
        style={{ left: `${PLATE_BOX.left}%`, top: `${PLATE_BOX.top}%`, width: `${PLATE_BOX.width}%`, height: `${PLATE_BOX.height}%` }}
      >
        <PlatePreview config={config} side="front" className="h-full w-full" />
      </div>
    </figure>
  );
}
