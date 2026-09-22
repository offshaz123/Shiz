import { Icon } from "@/components/Icon";

/**
 * The little coloured tile that sits at the top of a card.
 *
 * Six tones, cycled by position, so a grid of cards has some life in it
 * without any one card shouting. They are the only place on the site where a
 * colour other than the brand blue appears, and they are deliberately soft:
 * the tint carries them, not saturation.
 */
export function IconTile({
  name,
  tone = 1,
  className = "",
}: {
  name: string;
  /** 1-6. Anything else wraps round. */
  tone?: number;
  className?: string;
}) {
  const index = ((tone - 1) % 6) + 1;

  return (
    <span
      className={`icon-tile icon-tile-${index} flex h-11 w-11 items-center justify-center rounded-xl ${className}`}
    >
      <Icon name={name} className="h-5 w-5" />
    </span>
  );
}
