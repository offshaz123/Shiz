import { trustPoints } from "@/lib/brand";
import { IconTile } from "@/components/IconTile";

/**
 * The badge row directly under the hero: four cards, each with its own tile.
 *
 * It replaces a line of ticks. The point of the row is the same — the first
 * thing a wholesaler who has been offboarded twice wants to see — but a card
 * with an icon and a second line carries more than a tick and a label.
 */
export function TrustBar() {
  return (
    <div className="border-y border-border surface-tint">
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((point, index) => (
          <div
            key={point.label}
            className="card flex flex-col items-center p-6 text-center"
          >
            <IconTile name={point.icon} tone={index + 1} />
            <p className="mt-4 text-sm font-semibold">{point.label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{point.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
