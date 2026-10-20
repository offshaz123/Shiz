"use client";

import { useState } from "react";
import { PlatePreview } from "@/components/PlatePreview";
import { useCart } from "@/lib/cart";
import { type CartItem, KEEPSAKE_PRICE, money } from "@/lib/plates";
import { whatsappHref } from "@/lib/site";

// Slides in on the basket: a show plate copy of their road-legal plate, to put
// up at home, for a fixed price. One plate, white or yellow.
export function ShowPlateOffer() {
  const { items, add } = useCart();
  const [colour, setColour] = useState<"front" | "rear">("rear");
  const [dismissed, setDismissed] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  // The first road-legal plate that doesn't have a copy yet.
  const copied = new Set(items.filter((i) => i.keepsake).map((i) => i.reg));
  const plate: CartItem | undefined = items.find((i) => i.type === "legal" && !copied.has(i.reg));

  if (added)
    return (
      <div className="mt-6 rounded-3xl border border-[#cfe6d4] bg-[#f1faf3] p-4 text-sm font-semibold">
        ✓ Added: 1 {added} show plate for {money(KEEPSAKE_PRICE)}. It&apos;s in your basket below.
      </div>
    );
  if (!plate || dismissed) return null;

  const copy = { ...plate, type: "show" as const, which: colour, material: "standard" as const, fixing: "none" as const, keepsake: true };

  return (
    <aside className="slide-in-left mt-6 overflow-hidden rounded-3xl border border-[#e8d89a] bg-[#fdf8e7]">
      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_260px] sm:items-center">
        <div>
          <p className="font-display text-2xl font-bold uppercase">🏠 Want one for your wall?</p>
          <p className="mt-1 text-sm text-muted">
            Get a show plate exactly like <strong className="whitespace-pre text-ink">{plate.reg}</strong> to hang in your garage, bedroom or man
            cave. Makes a great gift too.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Show plate colour">
            {(
              [
                ["front", "White"],
                ["rear", "Yellow"],
              ] as const
            ).map(([id, name]) => (
              <button
                key={id}
                type="button"
                aria-pressed={colour === id}
                className="option px-4 py-2 text-sm font-semibold"
                onClick={() => setColour(id)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-gold px-5 py-2.5"
              onClick={() => {
                add(copy);
                setAdded(colour === "front" ? "white" : "yellow");
              }}
            >
              Add for {money(KEEPSAKE_PRICE)}
            </button>
            <button type="button" className="text-sm text-muted underline" onClick={() => setDismissed(true)}>
              No thanks
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            One plate, not road legal. Want a pair, or one in black?{" "}
            <a href={whatsappHref} className="font-semibold underline">
              Message us on WhatsApp
            </a>
            .
          </p>
        </div>
        <div className="flex h-28 items-center sm:h-40 justify-center rounded-2xl bg-white/70 p-3">
          <PlatePreview config={copy} side={colour} className="h-full max-h-full w-full drop-shadow-md" style={{ maxWidth: "none" }} />
        </div>
      </div>
    </aside>
  );
}
