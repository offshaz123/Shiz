import Image from "next/image";

/**
 * A photograph used as the surface a section's words sit on.
 *
 * A photograph dropped behind text is almost always worse than no photograph:
 * the type fights the detail and both lose. What makes it work is the stack
 * on top of it, which is why this is a component and not an inline
 * background-image.
 *
 * Four layers, bottom to top:
 *
 *  1. The photograph, cropped to the band and darkened at source.
 *  2. A horizontal scrim, opaque on the side the text sits and clearing
 *     towards the other, so the words always have something solid behind
 *     them while the picture still reads as a picture.
 *  3. A vertical fade into the page colour at top and bottom, so the band
 *     joins the sections around it rather than being a photograph in a box.
 *  4. A low-opacity brand wash, which is what stops a set of photographs
 *     from several different scenes looking like a set of photographs from
 *     several different scenes.
 *
 * `focus` says which side the text is on, so the scrim knows which way to
 * fall. `priority` only for a band above the fold.
 */
export function PhotoBand({
  src,
  alt = "",
  focus = "left",
  priority = false,
  className = "",
  id,
  children,
}: {
  src: string;
  /** Empty by default: decorative, and the section's own words carry it. */
  alt?: string;
  focus?: "left" | "right" | "centre";
  priority?: boolean;
  className?: string;
  /** For anchor links, since this often replaces a <section id="…">. */
  id?: string;
  children: React.ReactNode;
}) {
  const scrim =
    focus === "right"
      ? "bg-gradient-to-l from-background via-background/85 to-background/25"
      : focus === "centre"
        ? "bg-gradient-to-t from-background via-background/80 to-background/55"
        : "bg-gradient-to-r from-background via-background/85 to-background/25";

  return (
    <section id={id} className={`relative isolate overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        priority={priority}
        className="-z-30 object-cover"
      />

      {/* Reads over the photograph, whichever side the words are on. */}
      <div aria-hidden className={`absolute inset-0 -z-20 ${scrim}`} />

      {/* Joins the band to the sections above and below it. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-20 h-28 bg-gradient-to-b from-background to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-20 h-28 bg-gradient-to-t from-background to-transparent"
      />

      {/* The brand wash. Faint on purpose — it should tie the photographs
          together without anyone noticing it is there. */}
      <div
        aria-hidden
        className="brand-gradient-bg absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay"
      />

      {children}
    </section>
  );
}
