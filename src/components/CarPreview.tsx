import Image from "next/image";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig } from "@/lib/plates";

// The customer's plate fitted to the back of a car, so they can see how it
// will look. The photo is cropped from /public/gallery/porsche-taycan-platedup.jpg;
// the box below is where the plate sits in it (as % of the photo).
const PLATE_BOX = { left: 14.86, top: 69.17, width: 57.3, height: 12.08 };

export function CarPreview({ config, label }: { config: PlateConfig; label?: string }) {
  // The photo is a rear view, so show the rear plate unless only a front was ordered.
  const side = config.which === "front" ? "front" : "rear";
  return (
    <figure className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl bg-[#0b0906]">
      <Image
        src="/mockup/taycan-rear.jpg"
        alt="Your number plate fitted to the back of a black Porsche Taycan"
        width={370}
        height={480}
        sizes="(min-width: 1024px) 420px, 100vw"
        className="block h-auto w-full"
      />
      {/* Cover the plate in the photo with the customer's own. */}
      <div
        className={`absolute flex items-center justify-center rounded-[3px] ${side === "front" ? "bg-[#f8f8f5]" : "bg-[#f6c500]"}`}
        style={{
          left: `${PLATE_BOX.left}%`,
          top: `${PLATE_BOX.top}%`,
          width: `${PLATE_BOX.width}%`,
          height: `${PLATE_BOX.height}%`,
        }}
      >
        <PlatePreview config={config} side={side} label={label} className="w-full" />
      </div>
      <figcaption className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        How it looks on a car
      </figcaption>
    </figure>
  );
}
