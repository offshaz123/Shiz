import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/ListingPage";
import { listing } from "@/lib/listings";
import { loadPriceChanges } from "@/lib/prices";
import { type StyleId, styles } from "@/lib/plates";

// One page per plate style as a road-legal pair (e.g. /plates/3d-gel): the
// builder already on that style, with its price, and product details Google
// can read. The other products of a style are at /plates/<style>/<kind>.

export const dynamicParams = false;
// Rebuilt hourly so launch prices switch over on the day they rise.
export const revalidate = 3600;

export function generateStaticParams() {
  return styles.map((s) => ({ style: s.id }));
}

const find = (id: string) => (styles.some((s) => s.id === id) ? listing(id as StyleId, "pair") : null);

export async function generateMetadata(props: PageProps<"/plates/[style]">): Promise<Metadata> {
  const l = find((await props.params).style);
  if (!l) return {};
  return { title: l.title, description: `${l.description.split(". ")[0]}. Design yours with a live preview.`, alternates: { canonical: l.path } };
}

export default async function StylePage(props: PageProps<"/plates/[style]">) {
  await loadPriceChanges();
  const l = find((await props.params).style);
  if (!l) notFound();
  return <ListingPage listing={l} />;
}
