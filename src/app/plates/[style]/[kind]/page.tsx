import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/ListingPage";
import { KINDS, isKind, listing } from "@/lib/listings";
import { loadPriceChanges } from "@/lib/prices";
import { type StyleId, styles } from "@/lib/plates";

// The other products of a plate style for Google Shopping (lib/listings), e.g.
// /plates/3d-gel/motorbike or /plates/4d-5mm/show.

export const dynamicParams = false;
// Rebuilt hourly so launch prices switch over on the day they rise.
export const revalidate = 3600;

export function generateStaticParams() {
  return styles.flatMap((s) => Object.keys(KINDS).filter((k) => k !== "pair").map((kind) => ({ style: s.id, kind })));
}

const find = ({ style, kind }: { style: string; kind: string }) =>
  styles.some((s) => s.id === style) && isKind(kind) && kind !== "pair" ? listing(style as StyleId, kind) : null;

export async function generateMetadata(props: PageProps<"/plates/[style]/[kind]">): Promise<Metadata> {
  const l = find(await props.params);
  if (!l) return {};
  return { title: l.title, description: `${l.description.split(". ")[0]}. Design yours with a live preview.`, alternates: { canonical: l.path } };
}

export default async function KindPage(props: PageProps<"/plates/[style]/[kind]">) {
  await loadPriceChanges();
  const l = find(await props.params);
  if (!l) notFound();
  return <ListingPage listing={l} />;
}
