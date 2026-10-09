import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Policies" title="Privacy Policy" />
      <div className="prose-plate mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <p>
          {site.name} ({site.address}) is responsible for the personal data you give us. This
          policy explains what we collect and why.
        </p>
        <h2>What we collect</h2>
        <ul>
          <li>Your name, email, phone number and delivery address</li>
          <li>The registration numbers you order</li>
          <li>Copies of your entitlement and identity documents</li>
          <li>Messages you send us</li>
        </ul>
        <h2>Why we collect it</h2>
        <p>
          To make and deliver your order, to reply to you, and to meet our legal duty as a DVLA
          registered number plate supplier to verify and record every plate we supply.
        </p>
        <h2>How long we keep it</h2>
        <p>
          The law requires us to keep records of plates supplied, including the documents seen, for
          three years. Other data is kept only as long as needed for your order and our accounts.
        </p>
        <h2>Who we share it with</h2>
        <p>
          Our payment provider and delivery company, only as needed to complete your order. We may
          share records with the DVLA, police or Trading Standards when the law requires it. We
          never sell your data.
        </p>
        <h2>Your rights</h2>
        <p>
          You can ask to see, correct or delete your data (subject to our legal record-keeping
          duty) by emailing {site.email}. You can also complain to the Information
          Commissioner&apos;s Office (ico.org.uk).
        </p>
      </div>
    </>
  );
}
