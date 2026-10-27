import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { RegForm } from "@/components/RegForm";
import { cities, findCity } from "@/lib/cities";
import { FREE_DELIVERY_FROM, delivery, money } from "@/lib/plates";
import { site, whatsappHref } from "@/lib/site";

// A page per city we deliver to (lib/cities), for people searching
// "number plates <city>". Plates are made in our London workshop and posted.

export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export async function generateMetadata(props: PageProps<"/number-plates/[city]">): Promise<Metadata> {
  const c = findCity((await props.params).city);
  if (!c) return {};
  return {
    title: `Number Plates ${c.name}: Road Legal 3D Gel & 4D Plates Delivered`,
    description: `Order road-legal 3D gel, 4D and standard number plates online, delivered to ${c.name} and across ${c.region}. Live preview, DVLA registered supplier, same day dispatch.`,
    alternates: { canonical: `/number-plates/${c.slug}` },
  };
}

const link = "font-semibold text-[#8a6a12] underline";

export default async function CityPage(props: PageProps<"/number-plates/[city]">) {
  const c = findCity((await props.params).city);
  if (!c) notFound();
  const [tracked, nextDay] = delivery;

  const reasons = [
    { title: "Next Day Delivery", text: `Order before ${site.dispatchCutoff}` },
    { title: "Made in London", text: "Premium high-impact acrylic" },
    { title: "Fully road legal", text: "DVLA registered, BS AU 145e" },
    { title: `Free delivery`, text: `On orders from ${money(FREE_DELIVERY_FROM)}` },
  ];

  const faqs = [
    {
      q: `How quickly can I get number plates in ${c.name}?`,
      a: `Order before ${site.dispatchCutoff} on a working day and choose ${nextDay.name} (${money(nextDay.price)}) at checkout to get them the next working day. We make and dispatch your plates the same day. Or choose free ${tracked.name.toLowerCase()} on orders of ${money(FREE_DELIVERY_FROM)} or more, which takes ${tracked.note}.`,
    },
    {
      q: `Do you have a shop in ${c.name}?`,
      a: `No. We make every plate by hand in our own London workshop and send it to you by tracked delivery, with Next Day Delivery available. You design and order online, so there's no need to visit anywhere.`,
    },
    {
      q: "What are your plates made from?",
      a: "Premium high-impact acrylic, made to the British Standard BS AU 145e, with the legal Charles Wright font. Choose printed, glossy 3D gel, or laser-cut 4D acrylic letters, and upgrade to our thicker, high-gloss Premium Acrylic if you like.",
    },
    {
      q: "What do I need to order road-legal plates?",
      a: "Proof you're entitled to the registration (like your V5C logbook) and photo ID, such as your driving licence. This is the law for every registered supplier. You can upload them at checkout or after you order.",
    },
    {
      q: "Do you make show plates?",
      a: "Yes. Show plates can have any text you like, for car shows, display and gifts. They're not road legal, and no documents are needed.",
    },
  ];

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Number plates delivered to ${c.name}`,
    serviceType: "Number plates",
    provider: { "@id": `${site.url}/#business` },
    areaServed: [{ "@type": "City", name: c.name }, ...c.areas.map((name) => ({ "@type": "Place", name }))],
    url: `${site.url}/number-plates/${c.slug}`,
  };
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <JsonLd data={service} />
      <JsonLd data={faqData} />
      <PageHero eyebrow={`${c.name} · ${c.region}`} title={`Number Plates in ${c.name}`}>
        Road-legal 3D gel and 4D plates, made in London and delivered to your door.
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
          <p className="mb-3 font-display text-2xl font-bold">Build your plates in seconds</p>
          <RegForm buttonLabel="Build Now" />
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-line bg-surface p-3 text-center">
              <p className="font-display text-base font-bold leading-tight">{r.title}</p>
              <p className="mt-1 text-xs text-muted">{r.text}</p>
            </div>
          ))}
        </div>

        <div className="prose-plate mx-auto mt-10 max-w-3xl">
          <h2>Number plates for {c.name} drivers</h2>
          <p>{c.intro}</p>
          <p>
            Choose from classic <Link href="/plates/standard" className={link}>2D printed plates</Link>, glossy{" "}
            <Link href="/plates/3d-gel" className={link}>3D gel plates</Link>, laser-cut{" "}
            <Link href="/4d-plates" className={link}>4D plates</Link> or deep{" "}
            <Link href="/plates/7mm-gel" className={link}>7mm gel</Link>, in standard, hex,{" "}
            <Link href="/plates/3d-gel/motorbike" className={link}>motorbike</Link> and{" "}
            <Link href="/plates/3d-gel/4x4-import" className={link}>4x4 / import</Link> sizes. Need something for display?
            We make <Link href="/plates/3d-gel/show" className={link}>show plates</Link> with any text too.
          </p>
          <p className="text-sm text-muted">
            We deliver across {c.name}, {c.areas.join(", ")} ({c.postcodes.join(", ")} postcodes) and the rest of the UK. See{" "}
            <Link href="/number-plates" className={link}>all areas</Link>.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold">Questions from {c.name}</h2>
          <div className="mt-4 space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-2xl border border-line bg-white p-4">
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
