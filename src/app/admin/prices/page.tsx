import { AdminShell } from "@/components/AdminShell";
import { PriceEditor } from "@/components/PriceEditor";
import { requireAdmin } from "@/lib/admin";
import { futureChanges, loadPriceChanges } from "@/lib/prices";
import { basePrices, changeDay, money, styles } from "@/lib/plates";

export const metadata = { title: "Prices" };

export default async function PricesPage() {
  await requireAdmin();
  await loadPriceChanges(true);
  const future = futureChanges();
  const rows = styles.map((s) => {
    const upcoming = future.filter((c) => c.style === s.id);
    return {
      id: s.id,
      name: s.name,
      pair: s.pair,
      single: s.single,
      original: basePrices(s.id),
      upcoming: upcoming.map((c) => ({ id: c.id ?? 0, day: changeDay(c.startsAt), pair: money(c.pair), single: money(c.single), rise: c.pair > s.pair })),
    };
  });
  return (
    <AdminShell active="prices">
      <h2 className="font-display text-2xl font-bold">Plate prices</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted">
        Change a price straight away, or pick a date for it to change at midnight. When a price is going <strong>up</strong> on a date,
        the website shows customers &ldquo;Goes up to £X on that date&rdquo;, so only schedule a rise you&apos;ll keep. Extras (flags,
        borders, fixings, hex, premium acrylic) and delivery stay as they are.
      </p>
      <PriceEditor rows={rows} />
    </AdminShell>
  );
}
