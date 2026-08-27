const promos = [
  "10% OFF ceramic tint",
  "Lifetime warranty on every ceramic tint",
  "15% OFF with a valid Blue NHS card",
  "Premium window tints, fitted to an executive standard",
  "Chameleon tint now available in blue & red",
  "Free quotes on brakes & servicing",
];

export function PromoBanner() {
  const items = [...promos, ...promos];

  return (
    <div className="brand-gradient-bg overflow-hidden">
      <div className="marquee-viewport">
        <div className="marquee-track py-2">
          {items.map((promo, i) => (
            <span
              key={i}
              className="flex items-center gap-2 whitespace-nowrap px-6 text-xs font-semibold uppercase tracking-wider text-white"
            >
              {promo}
              <span aria-hidden className="text-white/60">
                •
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
