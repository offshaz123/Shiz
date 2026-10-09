"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlatePreview } from "./PlatePreview";
import { DispatchCountdown } from "./DispatchCountdown";
import { useCart } from "@/lib/cart";
import {
  type PlateConfig,
  type PlateType,
  badges,
  borders,
  defaultConfig,
  extrasPrice,
  fixings,
  SHOW_MAX,
  cleanShowText,
  formatReg,
  isValidPlateText,
  plateText,
  money,
  plateSize,
  styles,
  unitPrice,
  whichPlates,
} from "@/lib/plates";

const tabs = ["Size", "Style", "Additions"] as const;

const trust = [
  { title: "DVLA Compliant", text: "BS AU 145e certified", icon: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z" },
  { title: "FREE Delivery", text: "Order before 2pm for same day dispatch", icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", highlight: true },
  { title: "Made in UK", text: "Made to order in-house", icon: "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" },
  { title: "Premium Materials", text: "High-impact acrylic, reflective", icon: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 5.5L12 15l3.5 5.5L12 19l-3.5 1.5Z" },
];

const plateTypes: { id: PlateType; name: string; note: string; icon: string }[] = [
  { id: "legal", name: "Road Legal", note: "DVLA compliant, BS AU 145e", icon: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Zm-1 13-3.5-3.5 1.4-1.4 2.1 2.1 4.6-4.6 1.4 1.4L11 15Z" },
  { id: "show", name: "Show Plate", note: "Display / off-road use only", icon: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 5.5L12 15l3.5 5.5L12 19l-3.5 1.5Z" },
];

function Heading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-baseline justify-between gap-3 first:mt-0">
      <h3 className="font-display text-xl font-bold">{children}</h3>
      {aside && <span className="text-xs text-muted">{aside}</span>}
    </div>
  );
}

// A row with a round radio button, label and price, like a classic order form.
function Radio({
  name,
  checked,
  onChange,
  label,
  price,
  boxed = false,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  price?: number;
  boxed?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 ${
        boxed
          ? `rounded-lg border px-3 py-2.5 text-sm ${checked ? "border-[#b8901f] bg-gold-soft" : "border-line bg-white hover:border-[#c9c6b8]"}`
          : "py-1.5"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-5 w-5 shrink-0 accent-[#8a6812]" />
      <span className="flex-1">{label}</span>
      {price ? <span className={boxed ? "font-semibold text-gold" : ""}>+{money(price)}</span> : null}
    </label>
  );
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
  const platesPrice = c.which === "pair" ? style.pair : style.single;

  // "Tick if not required" for one side switches to the other side only.
  // Unticking brings it back. Both can't be unticked at once.
  const toggleNotRequired = (side: "front" | "rear", notRequired: boolean) => {
    if (!notRequired) set({ which: "pair" });
    else set({ which: side === "front" ? "rear" : "front" });
  };

  const addToBasket = () => {
    if (!isValidPlateText(c)) {
      setRegError(
        c.type === "show"
          ? "Please type the text you want on your show plate"
          : "Please enter a valid UK registration, e.g. AB12 CDE",
      );
      document.getElementById("reg")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("reg")?.focus({ preventScroll: true });
      return;
    }
    add({ ...c, reg: plateText(c) });
    router.push("/basket");
  };

  const sizeLabel = `${plateSize.name.replace(" Car", "")} (520mm x 111mm)`;
  const summary: [string, string][] = [
    [c.type === "show" ? "Plate Text" : "Registration", plateText(c) || "-"],
    ["Plate Type", c.type === "show" ? "Show Plate" : "Road Legal"],
    ["Front Size", showFront ? sizeLabel : "Not required"],
    ["Rear Size", showRear ? sizeLabel : "Not required"],
    ["Style", style.name],
    ["Quantity", c.which === "pair" ? "Front and Rear" : whichPlates.find((w) => w.id === c.which)!.name],
  ];
  const addOns: [string, number][] = [
    ...(c.border !== "none" ? [["Black Border", extrasPrice.border] as [string, number]] : []),
    ...(c.badge !== "none" ? [[badge.name, extrasPrice.badge] as [string, number]] : []),
    ...(c.fixing !== "none" ? [[fixing.name, fixing.price] as [string, number]] : []),
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
                  {c.type === "show" ? "Show Plate Text" : "Registration Number"}
                </label>
                <input
                  id="reg"
                  className="field h-14 text-center text-xl font-bold uppercase tracking-[0.15em] placeholder:font-semibold placeholder:tracking-wider placeholder:text-black/35"
                  value={c.reg}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    set({ reg: c.type === "show" ? cleanShowText(v) : v });
                    setRegError("");
                  }}
                  // Road-legal plates get the legal spacing; show plates keep it exactly as typed.
                  onBlur={() => c.reg && c.type === "legal" && set({ reg: formatReg(c.reg) })}
                  placeholder={c.type === "show" ? "Type anything" : "Enter registration"}
                  maxLength={c.type === "show" ? SHOW_MAX : 9}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  aria-invalid={!!regError}
                  aria-describedby={regError ? "reg-err" : "reg-hint"}
                />
                {regError ? (
                  <p id="reg-err" className="mt-2 text-center text-sm font-medium text-red-700">
                    {regError}
                  </p>
                ) : (
                  <p id="reg-hint" className="mt-2 text-center text-xs text-muted">
                    {c.type === "show"
                      ? `Show plate: any text, spaces wherever you like (up to ${SHOW_MAX} characters)`
                      : "Max 7 characters for selected plate size"}
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
                    className={`flex items-center justify-center gap-2 rounded-lg py-3 font-semibold transition-colors ${
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

              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-7">
                {tab === 0 && (
                  <>
                    <Heading>Select Plate Type</Heading>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {plateTypes.map((t) => (
                        <label
                          key={t.id}
                          className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors ${
                            c.type === t.id ? "border-[#b8901f] bg-gold-soft" : "border-line bg-white hover:border-[#c9c6b8]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="plate-type"
                            checked={c.type === t.id}
                            onChange={() => {
                              // Back to road legal: snap the text to the legal spacing.
                              set(t.id === "legal" ? { type: t.id, reg: formatReg(c.reg) } : { type: t.id });
                              setRegError("");
                            }}
                            className="absolute right-3 top-3 h-5 w-5 accent-[#8a6812]"
                          />
                          <span className="flex items-center gap-2 font-display text-xl font-bold">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                              <path d={t.icon} />
                            </svg>
                            {t.name}
                          </span>
                          <span className="mt-1 text-sm text-muted">{t.note}</span>
                        </label>
                      ))}
                    </div>

                    {c.type === "legal" ? (
                      <p className="mt-4 rounded-xl border border-[#cfe6d4] bg-[#f1faf3] p-3 text-sm text-[#1f5f33]">
                        ✅ Road legal plates are BS AU 145e certified and DVLA compliant. We will ensure correct
                        spacing before production. Document verification is required after purchase.{" "}
                        <Link href="/legal#documents" className="font-semibold underline">
                          Learn more
                        </Link>
                      </p>
                    ) : (
                      <p className="mt-4 rounded-xl border border-[#f1c9a5] bg-[#fff5ec] p-3 text-sm text-[#8a4a12]">
                        ⚠️ Show plates are for display and off-road use only (car shows, private land, photos).
                        They are <strong>not road legal</strong> and must not be fitted to a vehicle used on the
                        road. You can type any text and put spaces wherever you like. No documents are needed.{" "}
                        <Link href="/legal" className="font-semibold underline">
                          Learn more
                        </Link>
                      </p>
                    )}

                    <Heading>Select Plate Sizes</Heading>
                    {(["front", "rear"] as const).map((side) => {
                      const notRequired = side === "front" ? !showFront : !showRear;
                      return (
                        <div key={side} className="mb-4">
                          <div className="mb-1.5 flex items-center justify-between">
                            <label htmlFor={`size-${side}`} className="text-sm font-semibold capitalize">
                              {side} Plate
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                              <input
                                type="checkbox"
                                checked={notRequired}
                                onChange={(e) => toggleNotRequired(side, e.target.checked)}
                                className="h-4 w-4 accent-[#8a6812]"
                              />
                              Tick if not required
                            </label>
                          </div>
                          <select id={`size-${side}`} className="field" disabled={notRequired} defaultValue="standard">
                            <option value="standard">{sizeLabel}</option>
                          </select>
                        </div>
                      );
                    })}
                  </>
                )}

                {tab === 1 && (
                  <>
                    <Heading>Select Plate Style</Heading>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {styles.map((s) => (
                        <label
                          key={s.id}
                          className={`relative cursor-pointer rounded-xl border-2 p-3 text-center transition-colors ${
                            c.style === s.id ? "border-[#b8901f] bg-gold-soft" : "border-line bg-white hover:border-[#c9c6b8]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="plate-style"
                            checked={c.style === s.id}
                            onChange={() => set({ style: s.id })}
                            className="absolute right-2 top-2 z-10 h-5 w-5 accent-[#8a6812]"
                          />
                          <span className="block rounded-lg bg-surface-2 p-2">
                            <PlatePreview
                              config={{ ...defaultConfig, style: s.id }}
                              side="rear"
                              label={s.name.split(" ")[0]}
                              className="w-full"
                            />
                          </span>
                          <span className="mt-2 block font-semibold">{s.name}</span>
                          <span className="block text-xs text-muted">{money(s.pair)} pair</span>
                        </label>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-muted">{style.blurb}</p>
                  </>
                )}

                {tab === 2 && (
                  <>
                    <Heading>Plate Border</Heading>
                    {borders.map((b) => (
                      <Radio
                        key={b.id}
                        name="border"
                        checked={c.border === b.id}
                        onChange={() => set({ border: b.id })}
                        label={b.id === "none" ? "None" : "Black"}
                        price={b.id === "none" ? undefined : extrasPrice.border}
                      />
                    ))}

                    <Heading aside="Only one badge per plate">Badge / Flag Options</Heading>
                    <Radio
                      name="badge"
                      boxed
                      checked={c.badge === "none"}
                      onChange={() => set({ badge: "none" })}
                      label="No Badge"
                    />
                    <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">Printed badges</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {badges
                        .filter((b) => b.id !== "none")
                        .map((b) => (
                          <Radio
                            key={b.id}
                            name="badge"
                            boxed
                            checked={c.badge === b.id}
                            onChange={() => set({ badge: b.id })}
                            label={b.name}
                            price={extrasPrice.badge}
                          />
                        ))}
                    </div>
                    {badge.green && (
                      <p className="mt-2 text-xs text-muted">The green strip is for zero-emission (fully electric) vehicles only.</p>
                    )}

                    <Heading>Plate Fixings</Heading>
                    {fixings.map((f) => (
                      <Radio
                        key={f.id}
                        name="fixing"
                        checked={c.fixing === f.id}
                        onChange={() => set({ fixing: f.id })}
                        label={f.name}
                        price={f.price || undefined}
                      />
                    ))}
                  </>
                )}
              </div>

              {tab < tabs.length - 1 ? (
                <button type="button" className="btn btn-gold mt-7 w-full rounded-lg" onClick={() => setTab(tab + 1)}>
                  Next: {tab === 0 ? "Choose Style" : "Add Extras"} <span aria-hidden>›</span>
                </button>
              ) : (
                <button type="button" className="btn btn-gold mt-7 w-full rounded-lg" onClick={addToBasket}>
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
                    <dd
                      className={`text-right font-semibold ${
                        k === "Plate Type" ? (c.type === "show" ? "text-[#b4580f]" : "text-[#1f7a3d]") : ""
                      }`}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 border-t border-line pt-4">
                <p className="text-muted">Add-ons:</p>
                {addOns.length === 0 ? (
                  <p className="mt-1 text-sm text-muted">None</p>
                ) : (
                  <ul className="mt-1 space-y-1 text-sm">
                    {addOns.map(([name, price]) => (
                      <li key={name} className="flex justify-between">
                        <span>{name}</span>
                        <span className="font-semibold">+{money(price)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <dl className="mt-4 space-y-1 border-t border-line pt-4">
                <div className="flex justify-between">
                  <dt className="text-muted">Plates Total:</dt>
                  <dd className="font-semibold">{money(platesPrice)}</dd>
                </div>
                {addOns.length > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Add-ons:</dt>
                    <dd className="font-semibold">{money(unitPrice(c) - platesPrice)}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="font-display text-2xl font-bold">Total:</span>
                <span className="gold-text font-display text-4xl font-bold">{money(unitPrice(c))}</span>
              </div>

              <div className="mt-5">
                <DispatchCountdown />
              </div>

              <button type="button" onClick={addToBasket} className="btn btn-dark mt-5 w-full rounded-lg">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
                </svg>
                Add to Basket
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
