import Image from "next/image";

/**
 * A photograph framed inside a section, beside the copy.
 *
 * Distinct from PhotoBackdrop, which stretches a picture behind a whole
 * section and washes it in brand blue. That treatment needs a large source:
 * a small file blown across the viewport goes soft, and the wash hides the
 * damage on a backdrop but not on a figure the reader is meant to look at.
 *
 * So this one never scales past the file's own width. `width` and `height`
 * are the intrinsic pixel size of the asset, Next uses them to reserve the
 * space, and the CSS caps the rendered width so the image is only ever shown
 * at or below 1:1. The frame — rounded corners, a hairline border, a soft
 * shadow — is what makes a modest photograph look deliberate rather than
 * dropped in.
 *
 * `alt` is required and must describe the picture: these sit inside the
 * reading order next to the text they illustrate, so unlike the backdrops
 * they are not decorative.
 */
export function PhotoFigure({
  src,
  alt,
  width,
  height,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={className}>
      <div
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_40px_-24px_rgba(4,34,43,0.45)]"
        style={{ maxWidth: width }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={`(max-width: 1024px) 100vw, ${width}px`}
          className="h-auto w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-muted" style={{ maxWidth: width }}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
