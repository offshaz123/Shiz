import Image from "next/image";
import Link from "next/link";
import { RegForm } from "@/components/RegForm";
import { TrustBadges } from "@/components/TrustBadges";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig, defaultConfig } from "@/lib/plates";
import { products } from "@/lib/content";
import { site } from "@/lib/site";

const features = [
  {
    title: "Free Delivery Over £70",
    text: `Tracked UK delivery · same day dispatch before ${site.dispatchCutoff}`,
    icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  {
    title: "Premium & Road Legal",
    text: "Made to BS AU 145e by a DVLA registered supplier",
    icon: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z",
  },
  {
    title: "Handcrafted In-House",
    text: "Made and checked by hand in our Hornchurch workshop",
    icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
];

// Lifestyle photos (AI-generated). Captions describe the plates only: these
// aren't customers, so no names or quotes.
const gallery = [
  {
    src: "/gallery/porsche-taycan-platedup.jpg",
    alt: "Man holding a PlatedUp sign in front of a black Porsche Taycan with a UK flag number plate",
    caption: "Porsche Taycan · UK flag plate",
  },
  {
    src: "/gallery/porsche-taycan-charged.jpg",
    alt: "Woman holding a PlatedUp sign beside a silver Porsche Taycan with a Green Strip UK show plate on a London rooftop",
    caption: "Porsche Taycan · Green Strip UK show plate",
  },
  {
    src: "/gallery/range-rover-green-strip.jpg",
    alt: "Man holding a PlatedUp sign in front of a black Range Rover with a Green Strip UK show plate",
    caption: "Range Rover · Green Strip UK show plate",
  },
  {
    src: "/gallery/bmw-m4-hit-it.jpg",
    alt: "Woman holding a PlatedUp sign beside a white BMW M4 with a show plate",
    caption: "BMW M4 · Custom show plate",
  },
];

const showcase: (Partial<PlateConfig> & { caption: string })[] = [
  { reg: "PL24 TED", style: "4d-5mm", badge: "uk", caption: "4D 5MM with UK Flag" },
  { reg: "G0 LDY", style: "7mm-gel", border: "black", caption: "7MM Gel with black border" },
  { reg: "EV24 VLT", style: "4d-3mm", badge: "green-uk", caption: "4D 3MM with Green Strip UK" },
  { reg: "SC07 UPS", style: "3d-gel", badge: "sco", caption: "3D Gel with Scotland flag" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b0906] text-white">
        <Image
          src="/hero/supercar.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Darken the photo so the writing stays easy to read, with a warm gold glow. */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#f2dc93] opacity-15 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold">
            ✦ Premium handcrafted plates · Free delivery over £70
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] sm:text-7xl">
            UK Number Plates
            <br />
            <span className="text-[#f6e6ae]">Built to Perfection</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90 sm:text-xl">
            Premium road-legal 3D gel &amp; 4D number plates, handcrafted and finished by hand.
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/25 bg-white/10 p-5 text-white backdrop-blur sm:p-6">
            <RegForm inline />
          </div>

          {/* Three small badges on phones, full cards on bigger screens. */}
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-2 sm:mt-12 sm:gap-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-white/20 bg-white/10 p-3 sm:rounded-2xl sm:p-6">
                <span className="gold-bg mx-auto flex h-9 w-9 items-center justify-center rounded-lg sm:h-12 sm:w-12 sm:rounded-xl">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                    <path d={f.icon} />
                  </svg>
                </span>
                <h2 className="mt-2 font-display text-sm font-bold leading-tight sm:mt-4 sm:text-xl">{f.title}</h2>
                <p className="mt-1 hidden text-sm text-white/80 sm:block">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-line bg-white py-5">
        <TrustBadges />
      </div>

      {/* Gallery */}
      <section className="bg-surface py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">
              Get Plated Up
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Plates That Turn Heads</h2>
            <p className="mt-2 text-muted">From everyday cars to supercars, built your way.</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {gallery.map((g, i) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <Image
                  src={g.src}
                  alt={g.alt}
                  width={900}
                  height={900}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  priority={i < 2}
                  className="aspect-square w-full object-cover"
                />
                <figcaption className="p-3 text-sm font-semibold sm:p-4">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/design" className="btn btn-gold rounded-lg">
              Design Your Plate
            </Link>
            {products.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`} className="btn btn-white rounded-lg">
                {p.heading}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">
              Customer Showcase
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Plates That Stand Out</h2>
            <p className="mt-2 text-muted">A few of the combinations our customers love.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 lg:grid-cols-4">
            {showcase.map(({ caption, ...c }) => (
              <div key={c.reg} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <div className="bg-surface p-3 sm:p-5">
                  <PlatePreview config={{ ...defaultConfig, ...c }} side="rear" className="w-full drop-shadow-md" />
                </div>
                <p className="p-3 text-xs font-semibold sm:p-4 sm:text-sm">{caption}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-muted">
            Tag us{" "}
            <a href={site.instagram} className="font-semibold text-gold">
              {site.instagramHandle}
            </a>{" "}
            to be featured!
          </p>
        </div>
      </section>
    </>
  );
}
