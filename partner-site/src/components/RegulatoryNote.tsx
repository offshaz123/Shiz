import { brand } from "@/lib/brand";

/**
 * The standing regulatory disclosure.
 *
 * Orvopay introduces customers to the firm that provides the regulated payment
 * services — it does not provide them itself and is not authorised. The
 * wording follows the construction our own counterparty uses on its portal,
 * because that is the form the FCA expects of an introducer.
 *
 * The named version renders only once `provider.verified` is true. That flag
 * is deliberately still false: CoBanq's marketing site and its corporate
 * portal currently describe two different regulatory positions, and we should
 * not publish either until they tell us in writing which one is right.
 */
export function RegulatoryNote({
  className = "",
  compact = false,
}: {
  className?: string;
  /** One sentence for the footer bar, rather than the full disclosure. */
  compact?: boolean;
}) {
  const { provider } = brand;
  const named =
    provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;

  if (compact) {
    return (
      <p className={`text-xs leading-relaxed text-muted ${className}`}>
        {named ? (
          <>
            {brand.name} is acting as an introducer to {provider.regulatedEntity}, who is providing
            the regulated payment services and is authorised and regulated by the Financial Conduct
            Authority under {provider.permissions} (firm reference number{" "}
            {provider.firmReferenceNumber}). {brand.name} is not a bank.
          </>
        ) : (
          <>
            {brand.name} is acting as an introducer. The regulated payment services are provided by
            a firm authorised and regulated by the Financial Conduct Authority under the Payment
            Services Regulations 2017. {brand.name} is not a bank.
          </>
        )}
      </p>
    );
  }

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      {named ? (
        <>
          {brand.name} is acting as an introducer to {provider.regulatedEntity}, who is providing
          the regulated payment services and is authorised and regulated by the Financial Conduct
          Authority under {provider.permissions} (firm reference number{" "}
          {provider.firmReferenceNumber}).
        </>
      ) : (
        <>
          {brand.name} acts as an introducer. The regulated payment services are provided by a firm
          authorised and regulated by the Financial Conduct Authority under the Payment Services
          Regulations 2017, not by {brand.name}.
        </>
      )}{" "}
      {brand.name} is not a bank and does not hold deposits. Customer funds are held in safeguarded
      accounts and are not protected by the Financial Services Compensation Scheme. Every
      application is subject to full identity, anti-money-laundering and source-of-funds checks, and
      an account is opened only once those checks are satisfied. Nothing on this site is an offer of
      an account or a guarantee of approval.
    </p>
  );
}
