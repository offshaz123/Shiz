import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: "PlatedUp makes premium, road-legal number plates in the UK.",
};

const values = [
  { title: "Made in-house", text: "We print, press and finish every plate ourselves on our own equipment." },
  { title: "Road legal, always", text: "Every plate is made to BS AU 145e by a DVLA registered supplier." },
  { title: "Fast turnaround", text: `Order before ${site.dispatchCutoff} and we dispatch the same working day.` },
  { title: "Real people", text: "Questions? Message us on WhatsApp and a real person will help." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our story" title="About PlatedUp">
        Premium number plates without the premium hassle.
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="prose-plate mx-auto max-w-3xl">
          <p>
            PlatedUp was started with one simple idea: getting great-looking number plates should be
            quick, easy and fully legal. Whether you want a straight replacement or a bold set of 4D
            plates, we make them to order on our own equipment and get them to you fast.
          </p>
          <p>
            We&apos;re a DVLA registered number plate supplier, so every plate we sell is made to
            the latest British Standard, BS AU 145e, and can go straight on your car.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-line bg-surface p-6">
              <h2 className="font-display text-2xl font-bold">{v.title}</h2>
              <p className="mt-2 text-muted">{v.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/design" className="btn btn-gold">
            Design Your Plate
          </Link>
        </div>
      </div>
    </>
  );
}
