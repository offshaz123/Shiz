import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/StructuredData";
import { siteConfig, numberPlateFinishes, numberPlateShapes } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Number Plates — Standard, 3D, 4D & 5D",
  description:
    "Standard, 3D, 3D Gel, 4D, 4D Gel, 5D and 5D Gel number plates, in short, hexagon or normal shapes. See how each finish compares.",
  alternates: { canonical: "/number-plates" },
  openGraph: {
    title: "Number Plates | Executive Tints & Repairs",
    description:
      "Standard, 3D, 3D Gel, 4D, 4D Gel, 5D and 5D Gel number plates, in short, hexagon or normal shapes.",
  },
};

export default function NumberPlatesPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Repairs & Servicing", url: `${siteConfig.url}/repairs` },
          { name: "Number Plates", url: `${siteConfig.url}/number-plates` },
        ]}
      />
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full opacity-10 blur-3xl brand-gradient-bg"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Number Plates
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Standard, 3D, 4D &amp; 5D plates
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            From flat printed plates to raised, gel-domed 5D digits — in short, hexagon or normal
            shapes. All road-legal, all made while you wait.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8">
        <h2 className="text-2xl font-bold text-foreground">Digit finishes</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {numberPlateFinishes.map((finish) => (
            <div key={finish.id} className="rounded-3xl border border-border bg-surface p-6">
              <h3 className="text-lg font-semibold text-foreground">{finish.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{finish.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
          <h2 className="text-2xl font-bold text-foreground">Plate shapes</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {numberPlateShapes.map((shape) => (
              <div key={shape.name} className="rounded-3xl border border-border bg-background p-6">
                <h3 className="text-lg font-semibold text-foreground">{shape.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{shape.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground">
          Why upgrade from Standard to 3D, 4D or 5D?
        </h2>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-0 overflow-hidden rounded-3xl border border-border text-left text-sm">
            <thead>
              <tr className="bg-surface-2">
                <th className="p-4 font-semibold text-foreground">Finish</th>
                <th className="p-4 font-semibold text-foreground">Look</th>
                <th className="p-4 font-semibold text-foreground">Depth</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-t border-border">
                <td className="p-4 font-medium text-foreground">Standard</td>
                <td className="p-4">Flat, printed</td>
                <td className="p-4">None</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-4 font-medium text-foreground">3D / 3D Gel</td>
                <td className="p-4">Raised resin digits</td>
                <td className="p-4">Light</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-4 font-medium text-foreground">4D / 4D Gel</td>
                <td className="p-4">Laser-cut acrylic, glossier</td>
                <td className="p-4">Medium</td>
              </tr>
              <tr className="border-t border-border">
                <td className="p-4 font-medium text-foreground">5D / 5D Gel</td>
                <td className="p-4">Thickest, glossiest finish</td>
                <td className="p-4 font-medium text-foreground">Deepest</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Any Gel option adds a domed, glass-like top layer over the digits for extra shine and
          depth — available on 3D, 4D and 5D. Want the full breakdown?{" "}
          <Link href="/blog/3d-vs-4d-vs-5d-number-plates" className="text-brand hover:underline">
            Read our number plates guide →
          </Link>
        </p>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Ready to order your plates?
          </h2>
          <p className="mt-4 text-muted">
            Send us your registration and choice of finish and shape, and we&apos;ll confirm the price.
          </p>
          <Link
            href="/quote?service=Number Plates"
            className="brand-gradient-bg mt-8 inline-flex rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.03]"
          >
            Get a Free Quote →
          </Link>
        </div>
      </section>
    </div>
  );
}
