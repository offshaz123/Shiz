import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { RegForm } from "@/components/RegForm";
import { cities } from "@/lib/cities";

// Every city page (lib/cities) in one place, linked from the footer.
export const metadata: Metadata = {
  title: "Number Plates Delivered Across the UK",
  description:
    "Road-legal 3D gel, 4D and standard number plates handcrafted in London and delivered across the UK, with Next Day Delivery available.",
  alternates: { canonical: "/number-plates" },
};

export default function AreasPage() {
  return (
    <>
      <PageHero eyebrow="UK delivery" title="Number Plates Delivered Across the UK">
        Every plate is handcrafted in our London workshop from premium high-impact acrylic and sent by tracked delivery wherever you are, with Next Day Delivery available.
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
          <p className="mb-3 font-display text-2xl font-bold">Build your plates in seconds</p>
          <RegForm buttonLabel="Build Now" />
        </div>
        <h2 className="mt-14 text-center font-display text-3xl font-bold">Areas we deliver to</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/number-plates-essex" className="rounded-2xl border border-line bg-white p-5 hover:border-[#c9c6b8]">
            <p className="font-display text-xl font-bold">Barking, Ilford, Romford & Essex</p>
            <p className="mt-1 text-sm text-muted">Where our workshop is</p>
          </Link>
          {cities.map((c) => (
            <Link key={c.slug} href={`/number-plates/${c.slug}`} className="rounded-2xl border border-line bg-white p-5 hover:border-[#c9c6b8]">
              <p className="font-display text-xl font-bold">Number plates in {c.name}</p>
              <p className="mt-1 text-sm text-muted">{c.areas.slice(0, 4).join(", ")} and more</p>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-muted">
          Not listed? We deliver to addresses across the UK mainland. See our{" "}
          <Link href="/delivery" className="font-semibold text-[#8a6a12] underline">delivery policy</Link> for the Highlands, islands and Northern Ireland.
        </p>
      </div>
    </>
  );
}
