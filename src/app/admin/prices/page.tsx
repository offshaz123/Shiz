import { AdminShell } from "@/components/AdminShell";
import { PriceEditor } from "@/components/PriceEditor";
import { requireAdmin } from "@/lib/admin";
import { futureChanges, loadPriceChanges } from "@/lib/prices";
import { SMALL_SIZE_SAVING, basePrices, changeDay, money, sizePrice, sizes, styles } from "@/lib/plates";

export const metadata = { title: "Prices" };

export default async function PricesPage() {
  await requireAdmin();
  await loadPriceChanges(true);
  const future = futureChanges();
  const bike = sizes.find((z) => z.id === "motorbike")!;
  const square = sizes.find((z) => z.id === "square")!;
  const rows = styles.map((s) => {
    const upcoming = future.filter((c) => c.style === s.id);
    return {
      id: s.id,
      name: s.name,
      pair: s.pair,
      single: s.single,
      original: basePrices(s.id),
      // Motorbike and 4x4 / import follow the car price automatically.
      sizes: `Motorbike ${money(sizePrice(s, bike, "rear"))} · 4x4 / Import ${money(sizePrice(s, square, "pair"))} a pair, ${money(sizePrice(s, square, "rear"))} single`,
      upcoming: upcoming.map((c) => ({ id: c.id ?? 0, day: changeDay(c.startsAt), pair: money(c.pair), single: money(c.single), rise: c.pair > s.pair })),
    };
  });
  return (
    <AdminShell active="prices">
      <h2 className="font-display text-2xl font-bold">Plate prices</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Change a price straight away, or pick a date for it to change at midnight. When a price is going <strong>up</strong> on a date,
        the website shows customers &ldquo;Goes up to £X on that date&rdquo;, so only schedule a rise you&apos;ll keep. Extras (flags,
        borders, fixings, hex, premium acrylic) and delivery stay as they are. Motorbike and 4x4 / Import plates are always{" "}
        {money(-SMALL_SIZE_SAVING)} less than the car price (a motorbike plate is the pair price less {money(-SMALL_SIZE_SAVING)}), so they change with it.
      </p>
      <PriceEditor rows={rows} />
    </AdminShell>
  );
}
