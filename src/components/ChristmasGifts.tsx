import Link from "next/link";
import { PlatePreview } from "./PlatePreview";
import { defaultConfig, money, styles } from "@/lib/plates";

// Christmas gift idea on the homepage: show plates with any name, shown until
// the last day to order for delivery before Christmas.
const LAST_ORDER = Date.parse("2026-12-21T14:00:00Z");
const stillInTime = () => Date.now() <= LAST_ORDER;

export function ChristmasGifts() {
  if (!stillInTime()) return null;
  const from = Math.min(...styles.map((s) => s.single));
  return (
    <section className="border-b border-line bg-white py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">🎄 Christmas gift idea</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">A show plate with their name on it</h2>
          <p className="mt-3 text-muted">
            Any name, nickname or message, in 3D gel or 4D. For the garage wall, their bedroom or a car show. From{" "}
            <strong className="text-ink">{money(from)}</strong> for one plate.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm">
            <li>
              ✓ Order by <strong>Thursday 17 December</strong> for tracked delivery before Christmas
            </li>
            <li>
              ✓ Or by <strong>2pm Monday 21 December</strong> with Next Day Delivery
            </li>
            <li>✓ Show plates are for display only, not for the road, and need no documents</li>
          </ul>
          <Link href="/design?type=show" className="btn btn-gold mt-6">
            Design a Gift Plate <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="rounded-2xl bg-surface p-5" aria-hidden>
          <PlatePreview config={{ ...defaultConfig, type: "show", reg: "MERRY XMAS", style: "4d-5mm" }} side="rear" className="w-full drop-shadow-lg" />
          <PlatePreview config={{ ...defaultConfig, type: "show", reg: "DAD'S GARAGE", style: "3d-gel" }} side="front" className="mt-4 w-full drop-shadow-lg" />
        </div>
      </div>
    </section>
  );
}
