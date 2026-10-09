"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

export function ClearBasket() {
  const { ready, clear } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
