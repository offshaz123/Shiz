import type { Metadata } from "next";
import { Builder } from "@/components/Builder";
import { type SizeId, type StyleId, cleanShowText, formatReg, isValidReg, sizes, styles } from "@/lib/plates";

export const metadata: Metadata = {
  title: "Number Plate Builder: Design Your Plates Online",
  description:
    "Design road-legal 2D, 3D gel and 4D number plates or show plates with a live preview. Made in Barking, dispatched same day before 2pm.",
  alternates: { canonical: "/design" },
};

export default async function DesignPage(props: PageProps<"/design">) {
  const { reg, style, size } = await props.searchParams;
  const initialStyle = styles.find((s) => s.id === style)?.id as StyleId | undefined;
  const initialSize = sizes.find((s) => s.id === size)?.id as SizeId | undefined;
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
        ...(initialSize && { size: initialSize }),
      }}
    />
  );
}
