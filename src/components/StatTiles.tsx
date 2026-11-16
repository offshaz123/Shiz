/**
 * The row of figures across the top of the overview.
 *
 * Stat tiles rather than a chart, because each of these is one number and a
 * one-bar bar chart is a worse way to show one number than the number is.
 *
 * Proportional figures, not tabular-nums: equal-width digits are for columns
 * that line up vertically, and at this size they make a number like 121 look
 * like it has been spaced out by hand.
 */
export function StatTiles({
  tiles,
}: {
  tiles: { label: string; value: string; note: string }[];
}) {
  if (tiles.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="rounded-2xl border border-border bg-surface p-4">
          <dt className="text-xs font-medium text-muted">{tile.label}</dt>
          <dd className="mt-1.5 text-2xl font-bold leading-none text-foreground">{tile.value}</dd>
          {tile.note && <p className="mt-1.5 text-[11px] leading-snug text-muted">{tile.note}</p>}
        </div>
      ))}
    </dl>
  );
}
