import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Faqs } from "@/components/Faqs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal & DVLA Compliance",
  description: "How PlatedUp makes road-legal number plates and which documents we need.",
};

export default function LegalPage() {
  return (
    <>
      <PageHero eyebrow="DVLA compliance" title="Legal & Compliance">
        Every plate we make is road legal. Here&apos;s how, and what we need from you.
      </PageHero>
      <div className="prose-plate mx-auto max-w-3xl px-4 pb-6 sm:px-6">
        <h2>DVLA registered supplier</h2>
        <p>
          {site.name} is registered with the DVLA&apos;s Register of Number Plate Suppliers (RNPS).
          By law, only registered suppliers can make and sell number plates, and we must check
          documents and keep records of every plate we supply.
        </p>

        <h2>British Standard BS AU 145e</h2>
        <p>All of our plates are made to BS AU 145e, which means they:</p>
        <ul>
          <li>Use the legal Charles Wright font with solid black characters, with no shading or two-tone effects</li>
          <li>Use the legal character size and spacing for your registration</li>
          <li>Are reflective, with a white front plate and a yellow rear plate</li>
          <li>Show our business name and postcode, and the British Standard mark</li>
          <li>Are tested to resist weather, abrasion and impact</li>
        </ul>
        <p>
          3D gel and 4D raised characters are legal as long as they are solid black, which is how
          we make them. We don&apos;t make show plates or alter spacing.
        </p>

        <h2 id="documents">Documents we need</h2>
        <p>Before we can make road-legal plates, we must see one document from each list.</p>
        <p>
          <strong>1. Proof you&apos;re entitled to the registration</strong>
        </p>
        <ul>
          <li>V5C vehicle registration certificate (logbook)</li>
          <li>V5C/2 new keeper supplement (green slip)</li>
          <li>V750 certificate of entitlement or V778 retention document</li>
          <li>A hire, lease or company letter of authority for the vehicle</li>
          <li>V948 certificate (authority to buy plates) issued by the DVLA or police</li>
        </ul>
        <p>
          <strong>2. Proof of your identity or address</strong>
        </p>
        <ul>
          <li>UK photo driving licence</li>
          <li>Passport or national identity card</li>
          <li>Utility bill or council tax bill from the last 6 months</li>
          <li>Bank or building society statement from the last 6 months</li>
        </ul>
        <p>
          You can upload these at checkout or on our{" "}
          <Link href="/upload-documents" className="font-semibold text-gold underline">
            Upload Documents
          </Link>{" "}
          page. We keep records for three years as the law requires and use them only to verify
          your order.
        </p>

        <h2>Badges and flags</h2>
        <p>
          You can add the Union Flag (UK), Cross of St George (ENG), Saltire (SCO) or Red Dragon
          of Wales (CYM) to the left of your plate. The green flash is only for zero-emission
          vehicles.
        </p>

        <h2 id="faqs">FAQs</h2>
      </div>
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <Faqs />
      </div>
    </>
  );
}
