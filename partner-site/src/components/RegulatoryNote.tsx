import { brand } from "@/lib/brand";

/**
 * The standing regulatory disclosure.
 *
 * Orvopay is a trading name of the regulated firm, not a separate business
 * introducing to it — so the wording says "is a trading name of", which is
 * what the FCA expects a trading name to publish.
 *
 * The version naming the firm and its reference number renders only once
 * `provider.verified` is true. That flag covers two things: the FRN being
 * confirmed in writing, and the trading name actually being registered against
 * the firm's permissions. Publishing either before they are true would be
 * worse than publishing neither.
 */
export function RegulatoryNote({ className = "" }: { className?: string }) {
  const { provider } = brand;
  const named =
    provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      {named ? (
        <>
          {brand.name} is a trading name of {provider.regulatedEntity}, which is authorised and
          regulated by the Financial Conduct Authority under {provider.permissions} (firm reference
          number {provider.firmReferenceNumber}).
        </>
      ) : (
        <>
          {brand.name} is a trading name of a UK payments firm authorised and regulated by the
          Financial Conduct Authority.
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
