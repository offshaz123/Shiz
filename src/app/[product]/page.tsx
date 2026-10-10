import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatePreview } from "@/components/PlatePreview";
import { RegForm } from "@/components/RegForm";
import { FREE_DELIVERY_FROM, defaultConfig, delivery, extrasPrice, fixings, money, styles } from "@/lib/plates";
import { products } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ product: p.slug }));
}

export async function generateMetadata(props: PageProps<"/[product]">): Promise<Metadata> {
  const { product } = await props.params;
  const p = products.find((x) => x.slug === product);
  if (!p) return {};
  return { title: p.title, description: p.intro };
}

export default async function ProductPage(props: PageProps<"/[product]">) {
  const { product } = await props.params;
  const p = products.find((x) => x.slug === product);
  if (!p) notFound();
  const range = styles.filter((s) => p.styles.includes(s.id));
  const from = range[0];

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="gold-bg pointer-events-none absolute -top-56 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="eyebrow">Road legal · BS AU 145e</span>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase sm:text-6xl">{p.heading}</h1>
            <p className="mt-4 text-lg text-muted">{p.intro}</p>
            <p className="mt-6 font-display text-3xl font-bold">
              <span className="text-lg font-medium text-muted">From </span>
              <span className="gold-text">{money(from.pair)}</span>
              <span className="text-lg font-medium text-muted"> a pair</span>
            </p>
            <ul className="mt-6 space-y-2">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                  {pt}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <div className="grid gap-4">
                <PlatePreview config={{ ...defaultConfig, reg: "PL24 TED", style: from.id }} side="front" className="w-full drop-shadow-lg" />
                <PlatePreview config={{ ...defaultConfig, reg: "PL24 TED", style: range[range.length - 1].id, badge: "uk" }} side="rear" className="w-full drop-shadow-lg" />
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-white p-6 shadow-xl shadow-black/5">
              <p className="mb-3 font-display text-2xl font-bold">Build your {p.heading}</p>
              <RegForm buttonLabel="Build Now" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center font-display text-3xl font-bold uppercase">Prices &amp; extras</h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-line bg-white">
            <table className="w-full text-left">
              <tbody className="divide-y divide-line">
                {range.map((st) => (
                  <tr key={st.id}>
                    <th className="p-4 font-semibold">
                      {st.name}
                      <span className="block text-sm font-normal text-muted">{st.blurb}</span>
                    </th>
                    <td className="p-4 text-right">
                      {money(st.pair)} pair
                      <span className="block text-sm text-muted">{money(st.single)} single</span>
                    </td>
                  </tr>
                ))}
                <tr>
                  <th className="p-4 font-semibold">Flag badge or EV green strip</th>
                  <td className="p-4 text-right">+{money(extrasPrice.badge)}</td>
                </tr>
                <tr>
                  <th className="p-4 font-semibold">Black border</th>
                  <td className="p-4 text-right">+{money(extrasPrice.border)}</td>
                </tr>
                <tr>
                  <th className="p-4 font-semibold">Fixing kit (pads, screws or both)</th>
                  <td className="p-4 text-right">from +{money(fixings[1].price)}</td>
                </tr>
                <tr>
                  <th className="p-4 font-semibold">
                    Tracked delivery
                    <span className="block text-sm font-normal text-muted">{delivery[0].note}</span>
                  </th>
                  <td className="p-4 text-right">
                    {money(delivery[0].price)}
                    <span className="block text-sm font-semibold text-gold">FREE over {money(FREE_DELIVERY_FROM)}</span>
                  </td>
                </tr>
                <tr>
                  <th className="p-4 font-semibold">
                    Next Day Delivery
                    <span className="block text-sm font-normal text-muted">{delivery[1].note}</span>
                  </th>
                  <td className="p-4 text-right">{money(delivery[1].price)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/design?style=${from.id}`} className="btn btn-gold">
              Design Your {p.heading}
            </Link>
            {products
              .filter((o) => o.slug !== p.slug)
              .map((o) => (
                <Link key={o.slug} href={`/${o.slug}`} className="btn btn-white">
                  {o.heading}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
