import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { FREE_DELIVERY_FROM, delivery, money } from "@/lib/plates";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Delivery Policy" };

export default function DeliveryPage() {
  return (
    <>
      <PageHero eyebrow="Policies" title="Delivery Policy" />
      <div className="prose-plate mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2>Delivery options</h2>
        <ul>
          {delivery.map((d) => (
            <li key={d.id}>
              <strong>{d.name}</strong> ({money(d.price)}
              {d.id === "standard" && `, or FREE on orders over ${money(FREE_DELIVERY_FROM)}`}): {d.note}
            </li>
          ))}
        </ul>
        <h2>Dispatch times</h2>
        <p>
          Orders placed before {site.dispatchCutoff} Monday to Friday are made and dispatched the
          same working day, as long as we have received and checked your documents. Orders placed
          after {site.dispatchCutoff}, at weekends or on bank holidays are dispatched the next
          working day.
        </p>
        <h2>Where we deliver</h2>
        <p>
          We deliver to addresses across the UK mainland. Delivery to the Highlands, islands and
          Northern Ireland may take an extra 1–2 working days.
        </p>
        <h2>Tracking</h2>
        <p>Every order is sent tracked. We&apos;ll email you the tracking details once your plates are on their way.</p>
        <h2>Problems with delivery</h2>
        <p>
          If your plates haven&apos;t arrived within 5 working days (or the next working day for Next Day Delivery) or arrive damaged, contact us
          on WhatsApp or at {site.email} and we&apos;ll sort it out.
        </p>
      </div>
    </>
  );
}
