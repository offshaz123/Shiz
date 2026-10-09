"use client";

import { useEffect, useId, useRef, useState } from "react";

type Address = { address1: string; address2: string; town: string; postcode: string };
type Suggestion = { id: string; main: string; secondary: string };

function newSession() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random()).slice(2);
}

// Address inputs with Google suggestions under "Address line 1" (when the
// shop has a Google key set up) and the town filled in from the postcode.
export function AddressFields({
  initial,
  required = true,
}: {
  initial?: Partial<Address>;
  required?: boolean;
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const [addr, setAddr] = useState<Address>({
    address1: initial?.address1 ?? "",
    address2: initial?.address2 ?? "",
    town: initial?.town ?? "",
    postcode: initial?.postcode ?? "",
  });
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [enabled, setEnabled] = useState(true);
  const session = useRef(newSession());
  const typed = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Saved details (e.g. from the customer's account) can arrive after the first render.
  useEffect(() => {
    if (!initial) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fill in details loaded after mount
    setAddr((a) => ({
      address1: a.address1 || initial.address1 || "",
      address2: a.address2 || initial.address2 || "",
      town: a.town || initial.town || "",
      postcode: a.postcode || initial.postcode || "",
    }));
  }, [initial]);

  // Ask for suggestions a moment after the customer stops typing.
  useEffect(() => {
    if (!enabled || !typed.current) return;
    const q = addr.address1.trim();
    if (q.length < 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the list for short input
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/address/suggest?q=${encodeURIComponent(q)}&session=${session.current}`, { signal: ctrl.signal });
        const data = await res.json();
        if (data.enabled === false) {
          setEnabled(false);
          return;
        }
        setItems(data.suggestions ?? []);
        setActive(-1);
        setOpen(true);
      } catch {}
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [addr.address1, enabled]);

  // Close the list when clicking elsewhere.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function pick(s: Suggestion) {
    setOpen(false);
    setItems([]);
    typed.current = false;
    setAddr((a) => ({ ...a, address1: s.main }));
    try {
      const res = await fetch(`/api/address/details?id=${encodeURIComponent(s.id)}&session=${session.current}`);
      const data = await res.json();
      if (data.address) {
        setAddr((a) => ({
          address1: data.address.address1 || s.main,
          address2: data.address.address2 || a.address2,
          town: data.address.town || a.town,
          postcode: data.address.postcode || a.postcode,
        }));
      }
    } catch {}
    session.current = newSession();
  }

  async function lookupPostcode() {
    const pc = addr.postcode.trim();
    if (pc.length < 5) return;
    try {
      const res = await fetch(`/api/address/postcode?pc=${encodeURIComponent(pc)}`);
      const { result } = await res.json();
      if (result) setAddr((a) => ({ ...a, postcode: result.postcode, town: a.town || result.town }));
    } catch {}
  }

  const label = (text: string, optional = false) => (
    <span className="mb-1.5 block text-sm font-semibold">
      {text}
      {optional && <span className="font-normal text-muted"> (optional)</span>}
    </span>
  );
  const showList = open && items.length > 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="relative sm:col-span-2" ref={boxRef}>
        <label htmlFor={`${uid}-a1`}>{label("Address line 1", !required)}</label>
        <input
          id={`${uid}-a1`}
          className="field"
          name="address1"
          autoComplete="address-line1"
          required={required}
          value={addr.address1}
          placeholder={enabled ? "Start typing your address" : undefined}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => {
            typed.current = true;
            setAddr((a) => ({ ...a, address1: e.target.value }));
          }}
          onFocus={() => items.length && setOpen(true)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(items.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              pick(items[active]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-xl"
          >
            {items.map((s, i) => (
              <li
                key={s.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-gold-soft" : "hover:bg-surface"}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(s);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="block text-sm font-semibold">{s.main}</span>
                {s.secondary && <span className="block text-xs text-muted">{s.secondary}</span>}
              </li>
            ))}
            <li className="px-4 pb-1 pt-2 text-right text-[10px] text-muted" aria-hidden>
              Powered by Google
            </li>
          </ul>
        )}
      </div>
      <label className="block sm:col-span-2">
        {label("Address line 2", true)}
        <input
          className="field"
          name="address2"
          autoComplete="address-line2"
          value={addr.address2}
          onChange={(e) => setAddr((a) => ({ ...a, address2: e.target.value }))}
        />
      </label>
      <label className="block">
        {label("Town / City", !required)}
        <input
          className="field"
          name="town"
          autoComplete="address-level2"
          required={required}
          value={addr.town}
          onChange={(e) => setAddr((a) => ({ ...a, town: e.target.value }))}
        />
      </label>
      <label className="block">
        {label("Postcode", !required)}
        <input
          className="field uppercase"
          name="postcode"
          autoComplete="postal-code"
          required={required}
          value={addr.postcode}
          onChange={(e) => setAddr((a) => ({ ...a, postcode: e.target.value.toUpperCase() }))}
          onBlur={lookupPostcode}
        />
      </label>
    </div>
  );
}
