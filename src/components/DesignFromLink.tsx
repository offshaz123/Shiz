"use client";

import { useSearchParams } from "next/navigation";
import { Builder } from "./Builder";
import { type SizeId, type StyleId, cleanShowText, formatReg, isValidReg, sizes, styles } from "@/lib/plates";

// The builder, started from a link such as /design?reg=AB12CDE&style=4d.
// Read in the browser so the page itself can be cached and load instantly.
export function DesignFromLink() {
  const params = useSearchParams();
  const style = params.get("style");
  const size = params.get("size");
  const text = params.get("reg") ?? "";
  const initialStyle = styles.find((s) => s.id === style)?.id as StyleId | undefined;
  const initialSize = sizes.find((s) => s.id === size)?.id as SizeId | undefined;
  // A real UK registration starts as road legal; anything else (a name, a
  // word) starts as a show plate, and the builder explains why.
  const legal = !text || isValidReg(text);
  return (
    <Builder
      showPlateNotice={!legal}
      initial={{
        type: legal ? "legal" : "show",
        reg: legal ? formatReg(text) : cleanShowText(text).trim(),
        ...(initialStyle && { style: initialStyle }),
        ...(initialSize && { size: initialSize }),
      }}
    />
  );
}
