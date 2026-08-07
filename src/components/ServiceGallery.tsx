"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { GalleryImage } from "@/content/services";

function Slideshow({ images, label }: { images: GalleryImage[]; label: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  function go(next: number) {
    setIndex((next + images.length) % images.length);
  }

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border bg-surface-2 sm:aspect-16/9">
        {images.map((image, i) => (
          <Image
            key={image.src}
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 1000px"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label={`Previous ${label} photo`}
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={`Next ${label} photo`}
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-brand-pink" : "w-2 bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

  return <Slideshow images={images} label={label} />;
}
