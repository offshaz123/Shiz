import type { Metadata } from "next";
import { Builder } from "@/components/Builder";
import { type StyleId, formatReg, styles } from "@/lib/plates";

export const metadata: Metadata = {
  title: "Design Your Plate",
  description: "Build your road-legal 2D, 3D gel or 4D number plates with a live preview.",
};

export default async function DesignPage(props: PageProps<"/design">) {
  const { reg, style } = await props.searchParams;
  const initialStyle = styles.find((s) => s.id === style)?.id as StyleId | undefined;
  return (
    <Builder
      initial={{
        reg: typeof reg === "string" ? formatReg(reg) : "",
        ...(initialStyle && { style: initialStyle }),
      }}
    />
  );
}
