import { loadPriceChanges } from "@/lib/prices";
import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { RegForm } from "@/components/RegForm";
import { TrustBadges } from "@/components/TrustBadges";
import { ReviewsSection } from "@/components/ReviewsSection";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig, changeDay, defaultConfig, lastDayBefore, money, styles, upcomingPrice } from "@/lib/plates";
import { products } from "@/lib/content";
import { site } from "@/lib/site";

const features = [
  {
    title: "Free Delivery From £100",
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
    text: "Made and checked by hand in our Barking workshop",
    icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
];

// Lifestyle photos (AI-generated). Captions describe the plates only: these
// aren't customers, so no names or quotes.
const gallery = [
  {
    src: "/gallery/porsche-taycan-platedup.jpg",
    alt: "Man holding a PlatedUp sign in front of a black Porsche Taycan with a UK flag number plate",
    caption: "Porsche Taycan · 3D Gel plates",
  },
  {
    src: "/gallery/porsche-taycan-charged.jpg",
    alt: "Woman holding a PlatedUp sign beside a silver Porsche Taycan with a Green Strip UK show plate on a London rooftop",
    caption: "Porsche Taycan · 2D Printed plates",
  },
  {
    src: "/gallery/range-rover-green-strip.jpg",
    alt: "Man holding a PlatedUp sign in front of a black Range Rover with a Green Strip UK show plate",
    caption: "Range Rover · 7MM Gel plates",
  },
  {
    src: "/gallery/bmw-m4-hit-it.jpg",
    alt: "Woman holding a PlatedUp sign beside a white BMW M4 with a show plate",
    caption: "BMW M4 · 4D 5MM plates",
  },
];

const showcase: (Partial<PlateConfig> & { caption: string })[] = [
  { reg: "PL24 TED", style: "4d-5mm", badge: "uk", caption: "4D 5MM with UK Flag" },
  { reg: "G0 LDY", style: "7mm-gel", border: "black", caption: "7MM Gel with black border" },
  { reg: "EV24 VLT", style: "4d-3mm", badge: "green", caption: "4D 3MM with Green Strip" },
  { reg: "EN07 UPS", style: "3d-gel", badge: "eng", caption: "3D Gel with England flag" },
];

const hexShowcase: (Partial<PlateConfig> & { caption: string })[] = [
  { reg: "MAX 1", size: "hex4", style: "4d-3mm", caption: "Hex 4 · 4D 3MM" },
  { reg: "K1 NGS", size: "hex5", style: "7mm-gel", caption: "Hex 5 · 7MM Gel" },
  { reg: "B16 BOY", size: "hex6", style: "3d-gel", caption: "Hex 6 · 3D Gel" },
  { reg: "PL24 TED", size: "hex7", style: "4d-5mm", caption: "Hex 7 · 4D 5MM" },
];

// Re-check for newly approved reviews every few minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Premium 3D Gel & 4D Number Plates | PlatedUp" },
  description:
    "Design premium road-legal 3D gel and 4D number plates and show plates online. Handcrafted in Barking, Essex. Same day dispatch, free delivery from £100.",
  alternates: { canonical: "/" },
};

// Tells Google who we are and where the workshop is.
const business = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${site.url}/#business`,
  name: site.name,
  description: site.description,
  url: site.url,
  logo: `${site.url}/email/logo.png`,
  image: `${site.url}/hero/supercar.jpg`,
  email: site.email,
  telephone: `+${site.whatsapp}`,
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Barking",
    addressRegion: "Essex",
    postalCode: site.postcode,
    addressCountry: "GB",
  },
  areaServed: { "@type": "Country", name: "United Kingdom" },
  sameAs: [site.instagram],
};
const website = { "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url };

export default async function Home() {
  await loadPriceChanges();
  const launchStyles = styles.flatMap((style) => {
    const next = upcomingPrice(style.id);
    return next ? [{ style, next }] : [];
  });
  const firstRise = Math.min(...launchStyles.map((l) => l.next.startsAt));
  return (
    <>
      <JsonLd data={business} />
      <JsonLd data={website} />
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
            ✦ Premium handcrafted plates · Free delivery from £100
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

      {/* Launch prices, until the day they go up. */}
      {launchStyles.length > 0 && (
        <section className="border-b border-line bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#fdecec] px-4 py-1.5 text-sm font-bold text-[#b42318]">
                Today&apos;s prices until {lastDayBefore(firstRise)}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Order Before Prices Go Up</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted">
                These plates go up on {changeDay(firstRise)}. Order by {lastDayBefore(firstRise)} to pay today&apos;s price.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {launchStyles.map(({ style, next }) => (
                <Link
                  key={style.id}
                  href={`/design?style=${style.id}`}
                  className="rounded-2xl border border-line bg-surface p-5 text-center transition-colors hover:border-[#b8901f]"
                >
                  <PlatePreview config={{ ...defaultConfig, reg: "PL24 TED", style: style.id }} side="rear" className="w-full drop-shadow-md" />
                  <p className="mt-4 font-display text-2xl font-bold">{style.name}</p>
                  <p className="mt-1">
                    <span className="gold-text font-display text-3xl font-bold">{money(style.pair)}</span>
                    <span className="text-muted"> a pair</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#b42318]">
                    Goes up to {money(next.pair)} on {changeDay(next.startsAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
            {gallery.map((g) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <Image
                  src={g.src}
                  alt={g.alt}
                  width={900}
                  height={900}
                  sizes="(min-width: 1024px) 25vw, 50vw"
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

      {/* Hex plates */}
      <section className="bg-surface py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">New</span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Hex Number Plates</h2>
            <p className="mx-auto mt-2 max-w-2xl text-muted">
              Pointed ends and a plate cut to the length of your registration. Fully road legal, in every style from
              printed to 7mm gel. Perfect for short and private plates.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {hexShowcase.map(({ caption, ...c }) => (
              <div key={c.reg} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <div className="flex flex-1 items-center bg-surface-2/60 p-4 sm:p-5">
                  <PlatePreview config={{ ...defaultConfig, ...c }} side="rear" className="w-full drop-shadow-md" />
                </div>
                <p className="p-3 text-sm font-semibold sm:p-4">{caption}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/design?size=hex6" className="btn btn-gold">
              Design Your Hex Plate
            </Link>
            <Link href="/faqs" className="btn btn-white">
              Are hex plates legal?
            </Link>
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-white py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">
              Popular Styles
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Plates That Stand Out</h2>
            <p className="mt-2 text-muted">A few of our most popular combinations.</p>
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

      <ReviewsSection />
    </>
  );
}
