import { money } from "@/lib/plates";

// Klarna "Pay in 3", offered through Stripe checkout. Klarna is switched on in
// the Stripe dashboard (Settings → Payment methods); these are just the notices.

// Orders below this don't show the "3 payments of" line (Klarna may not offer
// Pay in 3 on very small orders). The badge still shows.
const KLARNA_FROM = 3000;

export const klarnaSmallPrint = "18+, UK residents only. Credit subject to status. T&Cs apply. Late payments may affect your credit score.";

export function KlarnaBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md bg-[#ffb3c7] px-2 text-[13px] font-extrabold tracking-tight text-[#17120f] ${className}`}
    >
      Klarna.
    </span>
  );
}

// "Or 3 interest-free payments of £X with Klarna" under a price.
export function KlarnaNote({ amount, className = "" }: { amount?: number; className?: string }) {
  const showSplit = amount !== undefined && amount >= KLARNA_FROM;
  return (
    <div className={`flex items-start gap-2 text-sm ${className}`}>
      <KlarnaBadge className="mt-0.5 shrink-0" />
      <p className="leading-snug">
        {showSplit ? (
          <>
            Or <strong>3 interest-free payments of {money(Math.ceil(amount / 3))}</strong> with Klarna
          </>
        ) : (
          <>
            <strong>Pay in 3 interest-free instalments</strong> with Klarna
          </>
        )}
        <span className="block text-[11px] text-muted">{klarnaSmallPrint}</span>
      </p>
    </div>
  );
}
