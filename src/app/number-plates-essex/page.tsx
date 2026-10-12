import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { RegForm } from "@/components/RegForm";
import { FREE_DELIVERY_FROM, money } from "@/lib/plates";
import { site, whatsappHref } from "@/lib/site";

// Local page for people searching "number plates near me" around the workshop.
export const metadata: Metadata = {
  title: "Number Plates in Hornchurch, Romford & Essex",
  description:
    "Premium road-legal number plates made in Hornchurch. 3D gel, 4D and show plates for Romford, Upminster, Dagenham, Brentwood, East London and across Essex.",
  alternates: { canonical: "/number-plates-essex" },
};

const areas = [
  "Hornchurch", "Romford", "Upminster", "Elm Park", "Rainham", "Dagenham", "Barking", "Ilford",
  "Gidea Park", "Harold Wood", "Brentwood", "Basildon", "Chelmsford", "Grays", "Thurrock", "East London",
];

const reasons = [
  { title: "Made locally", text: "Every plate is made by hand in our workshop at Roneo Corner, Hornchurch." },
  { title: "Same day dispatch", text: `Order before ${site.dispatchCutoff} on a working day and your plates are made and sent the same day.` },
  { title: "Fully road legal", text: "DVLA registered supplier. Every road-legal plate is made to BS AU 145e." },
  { title: `Free delivery from ${money(FREE_DELIVERY_FROM)}`, text: "Tracked delivery to your door, or next day delivery if you need them fast." },
];

const faqs = [
  {
    q: "Where are you based?",
    a: `Our workshop is at ${site.address}. We make every plate there and send it out by tracked delivery.`,
  },
  {
    q: "How quickly can I get number plates in Romford or Hornchurch?",
    a: `Order before ${site.dispatchCutoff} on a working day and we dispatch the same day. Choose Next Day Delivery at checkout for the fastest service.`,
  },
  {
    q: "What do I need to order road-legal plates?",
    a: "Proof you're entitled to the registration (like your V5C logbook) and photo ID, such as your driving licence. You can upload them at checkout or after you order.",
  },
  {
    q: "Do you make show plates?",
    a: "Yes. Show plates can have any text and spacing you like, for display and off-road use only. No documents needed.",
  },
];

export default function EssexPage() {
  const local = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${site.url}/#business`,
    name: site.name,
    url: `${site.url}/number-plates-essex`,
    address: { "@type": "PostalAddress", streetAddress: "10–12 Roneo Corner", addressLocality: "Hornchurch", addressRegion: "Essex", postalCode: site.postcode, addressCountry: "GB" },
    areaServed: areas.map((name) => ({ "@type": "Place", name })),
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={local} />
      <JsonLd data={faqData} />
      <PageHero eyebrow="Hornchurch · Romford · Essex" title="Number Plates Near You">
        Premium road-legal 3D gel and 4D number plates, handcrafted in our Hornchurch workshop.
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
          <p className="mb-3 font-display text-2xl font-bold">Build your plates in seconds</p>
          <RegForm buttonLabel="Build Now" />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-3xl border border-line bg-surface p-6">
              <h2 className="font-display text-xl font-bold">{r.title}</h2>
              <p className="mt-2 text-sm text-muted">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="prose-plate">
            <h2>Number plates for Hornchurch, Romford and beyond</h2>
            <p>
              PlatedUp is a DVLA registered number plate supplier based at <strong>10–12 Roneo Corner, Hornchurch RM12 4TN</strong>.
              We make premium plates for drivers across Havering, East London and Essex, from straight replacements to bold{" "}
              <Link href="/4d-plates" className="font-semibold text-[#8a6a12] underline">4D plates</Link>{" "}and glossy{" "}
              <Link href="/3d-gel-plates" className="font-semibold text-[#8a6a12] underline">3D gel plates</Link>.
            </p>
            <p>
              Need a quick replacement before your MOT, new plates for a private registration, or a{" "}
              <Link href="/blog/show-plates-explained" className="font-semibold text-[#8a6a12] underline">show plate</Link>{" "}as a gift? Design
              them online with a live preview and we&apos;ll get them to you fast.
            </p>
            <h2>Areas we cover</h2>
            <ul className="!list-none !pl-0 flex flex-wrap gap-2">
              {areas.map((a) => (
                <li key={a} className="rounded-full border border-line bg-white px-3 py-1 text-sm">
                  {a}
                </li>
              ))}
            </ul>
            <p className="mt-3">We also deliver tracked across the whole of the UK.</p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-line">
            <iframe
              title="PlatedUp workshop on Google Maps"
              src={`https://maps.google.com/maps?q=${encodeURIComponent("10-12 Roneo Corner, Hornchurch RM12 4TN")}&z=15&output=embed`}
              className="h-80 w-full lg:h-full lg:min-h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-3xl font-bold">Local questions</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-2xl border border-line bg-white p-5">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center">
            <a href={whatsappHref} className="btn btn-white">
              Questions? WhatsApp us
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
