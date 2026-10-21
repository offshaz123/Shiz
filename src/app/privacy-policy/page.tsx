import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PlatedUp collects, uses and protects your personal information and documents.",
  alternates: { canonical: "/privacy-policy" },
};

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
          <li>Reviews you leave on our website (your name and review are shown; your email is not)</li>
        </ul>
        <h2>Why we collect it</h2>
        <p>
          To make and deliver your order, to reply to you, and to meet our legal duty as a DVLA
          registered number plate supplier to verify and record every plate we supply. If you start an
          order but don&apos;t finish paying, we send you one reminder email with a link to complete it,
          and no more.
        </p>
        <h2>How long we keep it</h2>
        <p>
          The law requires us to keep records of plates supplied, including the documents seen, for
          three years. Other data is kept only as long as needed for your order and our accounts.
        </p>
        <h2>Who we share it with</h2>
        <p>
          Our payment provider and delivery company, only as needed to complete your order. If you accept
          advertising cookies, Meta, Google and TikTok as described under Cookies. We may
          share records with the DVLA, police or Trading Standards when the law requires it. We
          never sell your data.
        </p>
        <h2 id="cookies">Cookies</h2>
        <p>
          <strong>Essential cookies</strong> are always on. They keep your basket, log you in and remember your
          cookie choice. The site doesn&apos;t work properly without them.
        </p>
        <p>
          <strong>Analytics and advertising cookies</strong> are only used if you press &ldquo;Accept&rdquo;. They
          let Google Analytics show us how people use the site, and let Meta (Facebook and Instagram), TikTok and Google
          Ads tell us which adverts lead to orders, so we can show them to people likely to be interested. If you
          accept and then place an order, we also send Meta your order value and a scrambled (hashed) copy of your
          email, phone, name and postcode, and TikTok your order value and a scrambled copy of your email and phone,
          so they can match the order to their advert. Meta, TikTok and Google handle this under their own privacy
          policies.
        </p>
        <p>
          Before you choose, or if you press &ldquo;Reject&rdquo;, Google&apos;s tag still runs in its &ldquo;consent
          mode&rdquo;: it sets no cookies and sends Google only basic signals with no cookie or advertising ID (for
          example that a page was viewed or an order placed), which Google uses to estimate how many orders came from
          its adverts. Meta gets nothing unless you accept.
        </p>
        <p>
          You can change your mind at any time with &ldquo;Cookie settings&rdquo; at the bottom of every page.
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
