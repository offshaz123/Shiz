import Link from "next/link";
import { RegForm } from "@/components/RegForm";
import { TrustBadges } from "@/components/TrustBadges";
import { PlatePreview } from "@/components/PlatePreview";
import { type PlateConfig, defaultConfig, money, styles } from "@/lib/plates";
import { products } from "@/lib/content";
import { site } from "@/lib/site";

const features = [
  {
    title: "FREE Delivery on all orders",
    text: `Order before ${site.dispatchCutoff} for same day dispatch`,
    icon: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  {
    title: "DVLA Compliant",
    text: "All plates meet UK legal standards",
    icon: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z",
  },
  {
    title: "Fast & Reliable",
    text: "Made in the UK on our own equipment",
    icon: "M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  },
];

const showcase: (Partial<PlateConfig> & { caption: string })[] = [
  { reg: "PL24 TED", style: "4d-5mm", badge: "uk", caption: "4D 5MM with Union Flag" },
  { reg: "G0 LDY", style: "7mm-gel", border: "black", caption: "7MM Gel with black border" },
  { reg: "EV24 VLT", style: "4d-3mm", ev: true, caption: "4D 3MM with EV strip" },
  { reg: "SC07 UPS", style: "3d-gel", badge: "sco", caption: "3D Gel with Scotland flag" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="gold-deep relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[#f2dc93] opacity-20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold">
            ✦ FREE Delivery Available on all orders
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.95] sm:text-7xl">
            UK Number Plates
            <br />
            <span className="text-[#f6e6ae]">Built to Perfection</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90 sm:text-xl">
            Road-legal 2D, 3D gel &amp; 4D registration plates made to the highest standards.
          </p>

          <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-white/25 bg-white/10 p-5 text-white backdrop-blur sm:p-6">
            <RegForm inline />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-white/20 bg-white/10 p-6">
                <span className="gold-bg mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden>
                    <path d={f.icon} />
                  </svg>
                </span>
                <h2 className="mt-4 font-display text-xl font-bold">{f.title}</h2>
                <p className="mt-1 text-sm text-white/80">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b border-line bg-white py-5">
        <TrustBadges />
      </div>

      {/* Styles */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">Our Plates</span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Choose Your Style</h2>
            <p className="mt-2 text-muted">Every style is road legal and made to BS AU 145e.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {styles.map((s) => {
              const product = products.find((p) => p.styles.includes(s.id))!;
              return (
                <div key={s.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <PlatePreview config={{ ...defaultConfig, reg: "PL24 TED", style: s.id }} side="rear" className="w-full drop-shadow-md" />
                  <h3 className="mt-4 font-display text-2xl font-bold">{s.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted">{s.blurb}</p>
                  <p className="mt-3 font-semibold">
                    {money(s.pair)} <span className="font-normal text-muted">a pair · {money(s.single)} single</span>
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/design?style=${s.id}`} className="btn btn-gold flex-1 rounded-lg">
                      Build Now
                    </Link>
                    <Link href={`/${product.slug}`} className="btn btn-white rounded-lg">
                      Info
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">
              Customer Showcase
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Plates That Stand Out</h2>
            <p className="mt-2 text-muted">A few of the combinations our customers love.</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map(({ caption, ...c }) => (
              <div key={c.reg} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <div className="bg-surface p-5">
                  <PlatePreview config={{ ...defaultConfig, ...c }} side="rear" className="w-full drop-shadow-md" />
                </div>
                <p className="p-4 text-sm font-semibold">{caption}</p>
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
