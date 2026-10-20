import Image from "next/image";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig } from "@/lib/plates";

// The customer's plate on the front of a car, shown in the basket before they
// pay. To change the photo, replace /public/mockup/car-front-studio.jpg and update
// PLATE_BOX: where the front plate sits in it, as % of the photo. The box is
// exactly the shape of a UK plate (520 × 111mm), so the plate drawn in it
// looks just like the one in the plate builder.
const PLATE_BOX = { left: 36.94, top: 63.96, width: 26.11, height: 8.85 };

// The photo is the front of a car: motorbike and 4x4 / import plates don't go there.
export const fitsCar = (c: PlateConfig) => c.size !== "motorbike" && c.size !== "square";

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

// How the plate will look: on the car photo for car plates, or the plate on
// its own, large, for motorbike and 4x4 / import plates.
export function LookPreview({ config }: { config: PlateConfig }) {
  if (fitsCar(config)) return <CarPreview config={config} />;
  return (
    <figure className="mx-auto flex h-72 w-full max-w-3xl items-center justify-center rounded-3xl bg-[#e9e9e7] p-6 sm:h-96">
      <PlatePreview
        config={config}
        side={config.which === "front" ? "front" : "rear"}
        className="h-full max-h-full w-full drop-shadow-lg"
        style={{ maxWidth: "none" }}
      />
    </figure>
  );
}

export const lookCaption = (c: PlateConfig) =>
  fitsCar(c) ? "Here's how your plate will look on the front of a car." : "Here's how your plate will look.";

