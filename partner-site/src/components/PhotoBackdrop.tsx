import Image from "next/image";

/**
 * A photograph behind a section, with our blue laid over it.
 *
 * The site is white apart from the hero, so a photograph dropped in raw would
 * read as a different website. The wash fixes that: the picture supplies the
 * texture and the blue supplies the brand, and the text on top gets a
 * predictable contrast ratio instead of depending on whatever happens to be
 * in that corner of the image.
 *
 * `strength` is how heavy the wash is. "full" is for sections whose copy sits
 * directly on the picture and has to stay legible over any part of it;
 * "soft" lets more of the photograph through, for sections where the text
 * has its own panel.
 *
 * Decorative by definition — the alt is empty and the whole thing is hidden
 * from assistive tech, because the section's own heading already says what
 * this is about.
 */
export function PhotoBackdrop({
  src,
  strength = "full",
  position = "center",
}: {
  src: string;
  strength?: "full" | "soft" | "heavy";
  position?: string;
}) {
  const wash =
    strength === "heavy"
      ? `linear-gradient(100deg,
           rgba(3, 22, 32, 0.97) 0%,
           rgba(4, 34, 48, 0.93) 42%,
           rgba(6, 74, 96, 0.82) 100%)`
      : strength === "full"
      ? `linear-gradient(105deg,
           rgba(4, 29, 41, 0.95) 0%,
           rgba(5, 46, 64, 0.88) 45%,
           rgba(6, 92, 116, 0.74) 100%)`
      : `linear-gradient(105deg,
           rgba(4, 29, 41, 0.82) 0%,
           rgba(5, 46, 64, 0.68) 50%,
           rgba(6, 92, 116, 0.52) 100%)`;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0" style={{ backgroundImage: wash }} />
      {/* A touch of grain-free vignette so the edges do not compete with the
          copy sitting over the middle. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(75% 60% at 50% 50%, transparent 0%, rgba(3, 20, 28, 0.45) 100%)",
        }}
      />
    </div>
  );
}
