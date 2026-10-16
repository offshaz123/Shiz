import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { TradeForm } from "@/components/TradeForm";

export const metadata: Metadata = {
  title: "Trade Number Plates for Dealers & Garages",
  description:
    "Trade number plates for car dealers, garages, body shops and fleets. Trade prices, same day dispatch and road-legal plates made in Barking. Enquire on WhatsApp.",
  alternates: { canonical: "/trade" },
};

const perks = [
  { title: "Trade prices", text: "Better prices on every style, from standard plates to 4D and gel." },
  { title: "Same day dispatch", text: "Order before 2pm on a working day and your plates go out the same day." },
  { title: "One contact", text: "Message us directly on WhatsApp. No call centres, no waiting." },
  { title: "Fully road legal", text: "DVLA registered supplier. Every road-legal plate is made to BS AU 145e." },
];

const who = ["Car dealerships", "Garages & MOT centres", "Body shops & repairers", "Detailers & wrap shops", "Fleet & lease companies", "Car sales on the drive"];

export default function TradePage() {
  return (
    <>
      <PageHero eyebrow="For the motor trade" title="Trade Accounts">
        Number plates for dealers, garages and fleets, at trade prices. Tell us about your business and we&apos;ll get back to you on
        WhatsApp.
      </PageHero>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {perks.map((p) => (
              <div key={p.title} className="rounded-3xl border border-line bg-surface p-5">
                <h2 className="font-display text-xl font-bold">{p.title}</h2>
                <p className="mt-1 text-sm text-muted">{p.text}</p>
              </div>
            ))}
          </div>
          <h2 className="mt-8 font-display text-2xl font-bold">Who it&apos;s for</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {who.map((w) => (
              <li key={w} className="rounded-full border border-line bg-white px-3 py-1 text-sm">
                {w}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            The law still applies to trade orders: for road-legal plates we need proof of entitlement for each vehicle (such as the
            V5C, or a letter of authority) and ID. We&apos;ll explain the simplest way to send these when we set up your account.
          </p>
        </div>
        <TradeForm />
      </div>
    </>
  );
}
