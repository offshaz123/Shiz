import { brand } from "@/lib/brand";

/**
 * The standing regulatory disclosure.
 *
 * OvaroPay introduces customers to the firm that provides the regulated payment
 * services — it does not provide them itself and is not authorised. The
 * wording follows the construction our own counterparty uses on its portal,
 * because that is the form the FCA expects of an introducer.
 *
 * The named version renders only once `provider.verified` is true. That flag
 * is deliberately still false: CoBanq's marketing site and its corporate
 * portal currently describe two different regulatory positions, and we should
 * not publish either until they tell us in writing which one is right.
 *
 * Every regulated sentence on the site comes from this one component. Do not
 * hand-write the disclosure into a page — that is how the wording drifts out
 * of step with `brand.provider.model`.
 */
export function RegulatoryNote({
  className = "",
  compact = false,
  tone = "muted",
}: {
  className?: string;
  /** One sentence for the footer bar, rather than the full disclosure. */
  compact?: boolean;
  /** `inherit` drops the colour so the note can sit on a dark panel. */
  tone?: "muted" | "inherit";
}) {
  const { provider } = brand;
  const named =
    provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;
  const base = `text-xs leading-relaxed ${tone === "muted" ? "text-muted" : ""}`;

  const introduction = named ? (
    <>
      {brand.name} is acting as an introducer to {provider.regulatedEntity}, who is providing the
      regulated payment services and is authorised and regulated by the Financial Conduct Authority
      under {provider.permissions} (firm reference number {provider.firmReferenceNumber}).
    </>
  ) : (
    <>
      {brand.name} is acting as an introducer. The regulated payment services are provided by a firm
      authorised and regulated by the Financial Conduct Authority under the Payment Services
      Regulations 2017, not by {brand.name}.
    </>
  );

  if (compact) {
    return (
      <p className={`${base} ${className}`}>
        {introduction} {brand.name} is not a bank.
      </p>
    );
  }

  return (
    <p className={`${base} ${className}`}>
      {introduction} {brand.name} is not a bank and does not hold deposits. Every application is
      subject to full identity, anti-money-laundering and source-of-funds checks, and an account is
      opened only once those checks are satisfied. Nothing on this site is an offer of an account or
      a guarantee of approval.
    </p>
  );
}
