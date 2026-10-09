"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatePreview } from "./PlatePreview";
import { DispatchCountdown } from "./DispatchCountdown";
import { useCart } from "@/lib/cart";
import {
  type PlateConfig,
  badges,
  borders,
  defaultConfig,
  extrasPrice,
  fixings,
  formatReg,
  isValidReg,
  money,
  plateSize,
  styles,
  unitPrice,
  whichPlates,
} from "@/lib/plates";

const tabs = ["Plates", "Style", "Extras"] as const;

const trust = [
  { title: "DVLA Compliant", text: "BS AU 145e certified", icon: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z" },
  { title: "FREE Delivery", text: "Order before 2pm for same day dispatch", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", highlight: true },
  { title: "Made in UK", text: "Made to order in-house", icon: "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" },
  { title: "Premium Materials", text: "High-impact acrylic, reflective", icon: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 5.5L12 15l3.5 5.5L12 19l-3.5 1.5Z" },
];

function Option({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={`option ${className}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 font-display text-xl font-bold first:mt-0">{children}</h3>;
}

export function Builder({ initial }: { initial: Partial<PlateConfig> }) {
  const router = useRouter();
  const { add } = useCart();
  const [c, setC] = useState<PlateConfig>({ ...defaultConfig, ...initial });
  const [tab, setTab] = useState(0);
  const [regError, setRegError] = useState("");

  const set = (patch: Partial<PlateConfig>) => setC((prev) => ({ ...prev, ...patch }));
  const style = styles.find((s) => s.id === c.style)!;
  const fixing = fixings.find((f) => f.id === c.fixing)!;
  const badge = badges.find((b) => b.id === c.badge)!;
  const showFront = c.which !== "rear";
  const showRear = c.which !== "front";

  const addToBasket = () => {
    if (!isValidReg(c.reg)) {
      setRegError("Please enter a valid UK registration, e.g. AB12 CDE");
      document.getElementById("reg")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("reg")?.focus({ preventScroll: true });
      return;
    }
    add({ ...c, reg: formatReg(c.reg) });
    router.push("/basket");
  };

  const summary: [string, string][] = [
    ["Registration", formatReg(c.reg) || "-"],
    ["Plate Type", "Road Legal"],
    ["Size", `${plateSize.name} (${plateSize.mm})`],
    ["Style", style.name],
    ["Quantity", whichPlates.find((w) => w.id === c.which)!.name],
    ["Border", c.border === "none" ? "None" : "Black"],
    ["Badge", c.badge === "none" ? "None" : `${badge.name} (${badge.code})`],
    ["EV Strip", c.ev ? "Yes" : "No"],
    ["Fixing Kit", fixing.name],
  ];

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gold">
          <span aria-hidden>←</span> Back to Home
        </Link>
        <h1 className="mt-4 text-center font-display text-4xl font-bold sm:text-5xl">Build Your Number Plates</h1>

        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {trust.map((t) => (
            <li
              key={t.title}
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                t.highlight ? "border-[#d9c37a] bg-[#fdf8e7]" : "border-line bg-white"
              }`}
            >
              <span className="gold-bg flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                  <path d={t.icon} />
                </svg>
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-bold">{t.title}</span>
                <span className="hidden text-muted sm:block">{t.text}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* Configure */}
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <h2 className="gold-deep px-6 py-5 font-display text-2xl font-bold">Configure Your Plate</h2>
            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-[#e8d89a] bg-[#fdf8e7] p-4">
                <label htmlFor="reg" className="mb-2 block text-sm font-semibold">
                  Registration Number
                </label>
                <input
                  id="reg"
                  className="field h-16 bg-[var(--plate-rear)] text-center font-[family-name:var(--font-plate)] text-4xl font-semibold uppercase tracking-widest placeholder:text-black/35"
                  value={c.reg}
                  onChange={(e) => {
                    set({ reg: e.target.value.toUpperCase() });
                    setRegError("");
                  }}
                  onBlur={() => c.reg && set({ reg: formatReg(c.reg) })}
                  placeholder="AB12 CDE"
                  maxLength={9}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={!!regError}
                  aria-describedby={regError ? "reg-err" : "reg-hint"}
                />
                {regError ? (
                  <p id="reg-err" className="mt-2 text-sm font-medium text-red-700">
                    {regError}
                  </p>
                ) : (
                  <p id="reg-hint" className="mt-2 text-center text-xs text-muted">
                    We&apos;ll set the legal spacing for you
                  </p>
                )}
              </div>

              <div role="tablist" aria-label="Plate options" className="mt-5 grid grid-cols-3 gap-2">
                {tabs.map((t, i) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    id={`tab-${i}`}
                    aria-selected={tab === i}
                    aria-controls={`panel-${i}`}
                    onClick={() => setTab(i)}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 font-semibold transition-colors ${
                      tab === i ? "gold-bg shadow-sm" : "bg-surface-2/70 text-muted hover:bg-surface-2"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                        tab === i ? "bg-ink text-white" : "bg-white"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {t}
                  </button>
                ))}
              </div>

              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-6">
                {tab === 0 && (
                  <>
                    <Heading>Select Your Plate</Heading>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {whichPlates.map((w) => (
                        <Option key={w.id} selected={c.which === w.id} onClick={() => set({ which: w.id })}>
                          <span className="font-semibold">{w.name}</span>
                        </Option>
                      ))}
                    </div>
                    <p className="mt-4 rounded-xl border border-[#cfe6d4] bg-[#f1faf3] p-3 text-sm text-[#1f5f33]">
                      ✓ Road legal plates, BS AU 145e certified, in the standard car size ({plateSize.mm}).
                      We check your documents after you order.
                    </p>
                  </>
                )}

                {tab === 1 && (
                  <>
                    <Heading>Plate Style</Heading>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {styles.map((s) => (
                        <Option key={s.id} selected={c.style === s.id} onClick={() => set({ style: s.id })} className="text-center">
                          <PlatePreview
                            config={{ ...defaultConfig, style: s.id }}
                            side="rear"
                            label={s.name.split(" ")[0]}
                            className="mx-auto w-full rounded"
                          />
                          <span className="mt-2 block font-semibold">{s.name}</span>
                          <span className="block text-xs text-muted">{money(s.pair)} pair</span>
                        </Option>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-muted">{style.blurb}</p>
                  </>
                )}

                {tab === 2 && (
                  <>
                    <Heading>Plate Border</Heading>
                    <div className="grid grid-cols-2 gap-3">
                      {borders.map((b) => (
                        <Option key={b.id} selected={c.border === b.id} onClick={() => set({ border: b.id })}>
                          <span className="block font-semibold">{b.name}</span>
                          <span className="block text-sm text-muted">{b.id === "none" ? "Free" : `+${money(extrasPrice.border)}`}</span>
                        </Option>
                      ))}
                    </div>

                    <Heading>Flag Badge</Heading>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {badges.map((b) => (
                        <Option key={b.id} selected={c.badge === b.id} onClick={() => set({ badge: b.id })}>
                          <span className="block font-semibold">{b.name}</span>
                          <span className="block text-sm text-muted">
                            {b.id === "none" ? "Free" : `${b.code} · +${money(extrasPrice.badge)}`}
                          </span>
                        </Option>
                      ))}
                    </div>

                    <Heading>Electric Vehicle Strip</Heading>
                    <div className="grid grid-cols-2 gap-3">
                      <Option selected={!c.ev} onClick={() => set({ ev: false })}>
                        <span className="font-semibold">No</span>
                      </Option>
                      <Option selected={c.ev} onClick={() => set({ ev: true })}>
                        <span className="block font-semibold">Yes</span>
                        <span className="block text-sm text-muted">+{money(extrasPrice.ev)} · EVs only</span>
                      </Option>
                    </div>

                    <Heading>Add a Fixing Kit</Heading>
                    <div className="grid grid-cols-2 gap-3">
                      {fixings.map((f) => (
                        <Option key={f.id} selected={c.fixing === f.id} onClick={() => set({ fixing: f.id })}>
                          <span className="block font-semibold">{f.name}</span>
                          <span className="block text-sm text-muted">{f.price ? `${f.note} · +${money(f.price)}` : "No fixings"}</span>
                        </Option>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {tab < tabs.length - 1 ? (
                <button type="button" className="btn btn-gold mt-6 w-full rounded-lg" onClick={() => setTab(tab + 1)}>
                  Next: {tab === 0 ? "Choose Style" : "Extras"} <span aria-hidden>›</span>
                </button>
              ) : (
                <button type="button" className="btn btn-gold mt-6 w-full rounded-lg" onClick={addToBasket}>
                  Add to Basket
                </button>
              )}
            </div>
          </section>

          {/* Preview & summary */}
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm lg:sticky lg:top-36">
            <h2 className="gold-bg px-6 py-5 font-display text-2xl font-bold">Preview &amp; Summary</h2>
            <div className="p-5 sm:p-6">
              <div className="grid gap-4">
                {showFront && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Front</p>
                    <PlatePreview config={c} side="front" className="w-full rounded-lg border border-line drop-shadow-md" />
                  </div>
                )}
                {showRear && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Rear</p>
                    <PlatePreview config={c} side="rear" className="w-full drop-shadow-md" />
                  </div>
                )}
              </div>

              <dl className="mt-6 space-y-2.5">
                {summary.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted">{k}:</dt>
                    <dd className={`text-right font-semibold ${k === "Plate Type" ? "text-[#1f7a3d]" : ""}`}>{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
                <span className="font-display text-2xl font-bold">Total:</span>
                <span className="gold-text font-display text-4xl font-bold">{money(unitPrice(c))}</span>
              </div>

              <div className="mt-5">
                <DispatchCountdown />
              </div>

              <button type="button" onClick={addToBasket} className="btn btn-dark mt-5 w-full rounded-lg">
                Add to Basket
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
