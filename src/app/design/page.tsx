import type { Metadata } from "next";
import { Builder } from "@/components/Builder";
import { type StyleId, cleanShowText, formatReg, isValidReg, styles } from "@/lib/plates";

export const metadata: Metadata = {
  title: "Design Your Plate",
  description: "Build your road-legal 2D, 3D gel or 4D number plates with a live preview.",
};

export default async function DesignPage(props: PageProps<"/design">) {
  const { reg, style } = await props.searchParams;
  const initialStyle = styles.find((s) => s.id === style)?.id as StyleId | undefined;
  const text = typeof reg === "string" ? reg : "";
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
      }}
    />
  );
}
