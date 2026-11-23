"use client";

import { useSearchParams } from "next/navigation";
import { Builder } from "./Builder";
import {
  type PlateConfig,
  badges,
  borders,
  cleanShowText,
  fixings,
  formatReg,
  isValidReg,
  materials,
  sizes,
  styles,
  whichPlates,
} from "@/lib/plates";

// The builder, started from a link such as /design?reg=AB12CDE&style=4d
// (or /design?type=show to start on a show plate). A saved design
// (SaveDesign) also carries which, material, badge, border and fixing.
// Read in the browser so the page itself can be cached and load instantly.
export function DesignFromLink() {
  const params = useSearchParams();
  const text = params.get("reg") ?? "";
  // Only values the builder knows are used; anything else is ignored.
  const pick = <K extends keyof PlateConfig>(key: K, list: { id: string }[]) => {
    const v = params.get(key);
    return list.some((x) => x.id === v) ? { [key]: v as PlateConfig[K] } : {};
  };
  // A real UK registration starts as road legal; anything else (a name, a
  // word) starts as a show plate, and the builder explains why.
  const legal = !text || isValidReg(text);
  const show = !legal || params.get("type") === "show";
  return (
    <Builder
      showPlateNotice={!legal}
      initial={{
        type: show ? "show" : "legal",
        reg: show ? cleanShowText(text).trim() : formatReg(text),
        ...pick("style", styles),
        ...pick("size", sizes),
        ...pick("which", whichPlates),
        ...pick("material", materials),
        ...pick("badge", badges),
        ...pick("border", borders),
        ...pick("fixing", fixings),
      }}
    />
  );
}
