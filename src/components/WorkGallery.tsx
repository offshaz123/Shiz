import Image from "next/image";
import { workPhotos } from "@/content/work";

// Layout is deliberately asymmetric rather than a plain four-up grid: the
// portrait fitting shot carries the full height of the right column, which
// stops the section reading like a stock photo strip.
const placement = [
  "lg:col-span-2",                    // BMW, wide, top left
  "lg:col-start-3 lg:row-start-1 lg:row-span-2", // fitting shot, tall, right
  "lg:col-start-1 lg:row-start-2",    // Golf
  "lg:col-start-2 lg:row-start-2",    // Range Rover
];

export function WorkGallery() {
  if (workPhotos.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Our Work
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Cars we&apos;ve finished
          </h2>
          <p className="mt-4 text-muted">
            Real jobs from the unit in Walthamstow — no stock photos.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-[250px_250px]">
          {workPhotos.map((photo, i) => (
            <figure
              key={photo.src}
              className={`group relative overflow-hidden rounded-3xl border border-border bg-background ${placement[i] ?? ""}`}
            >
              <div className="relative h-60 sm:h-64 lg:h-full">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={photo.position ? { objectPosition: photo.position } : undefined}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12 text-sm font-medium text-white">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
