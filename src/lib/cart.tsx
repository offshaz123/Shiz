"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type CartItem, sanitiseItem, unitPrice } from "./plates";

type Cart = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "id" | "qty">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const KEY = "platedup-basket";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      // Re-check saved items so anything from an older version of the site
      // (an option we no longer sell) is dropped instead of breaking the page.
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      const valid = Array.isArray(parsed)
        ? parsed.map(sanitiseItem).filter((i): i is CartItem => i !== null && i.id !== "")
        : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring the saved basket after hydration
      setItems(valid);
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "id" | "qty">) => {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID(), qty: 1 }]);
  }, []);
  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i)),
    );
  }, []);
  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + unitPrice(i) * i.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, ready, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
