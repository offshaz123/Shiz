import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Policies" title="Terms & Conditions" />
      <div className="prose-plate mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <p>
          These terms apply to all orders placed with {site.name} ({site.address}). By placing an
          order you agree to them.
        </p>
        <h2>Your order</h2>
        <p>
          When you place an order you confirm that you are entitled to display the registration
          ordered and that the documents you provide are genuine. We will not make plates until we
          have verified your documents, as required by the DVLA.
        </p>
        <h2>Prices and payment</h2>
        <p>
          Prices are shown in pounds sterling and include VAT where applicable. Payment is taken
          when you place your order. If we can&apos;t verify your documents we will refund you in full.
        </p>
        <h2>Legal plates</h2>
        <p>
          All plates are made to BS AU 145e. We cannot change fonts, spacing or remove the
          supplier and British Standard markings. Fitting your plates and keeping them clean and
          legible is your responsibility.
        </p>
        <h2>Refusal of orders</h2>
        <p>
          We may refuse or cancel any order where we cannot verify entitlement or suspect the
          plates may be used unlawfully. Any payment will be refunded.
        </p>
        <h2>Delivery and returns</h2>
        <p>See our Delivery Policy and Returns Policy, which form part of these terms.</p>
        <h2>Liability</h2>
        <p>
          Nothing in these terms limits your statutory rights. Our liability for any order is
          limited to the price paid for that order.
        </p>
      </div>
    </>
  );
}
