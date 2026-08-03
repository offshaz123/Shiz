import Image from "next/image";
import type { GalleryImage } from "@/content/services";

export function ServiceGallery({ images, label }: { images?: GalleryImage[]; label: string }) {
  if (!images || images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-background p-10 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="mx-auto h-8 w-8 text-muted">
          <path
            d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <p className="mt-4 text-sm text-muted">Real photos of our {label.toLowerCase()} work — coming soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image) => (
        <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-surface-2">
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
