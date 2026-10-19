import { brand } from "@/lib/brand";

/**
 * The standing regulatory disclosure.
 *
 * OvaroPay introduces customers to the firm that provides the regulated
 * payment services — it does not provide them itself and is not authorised.
 *
 * WHERE THE PROVIDER IS NAMED, AND WHERE IT IS NOT.
 *
 * `nameProvider` is off by default, and only the footer turns it on. That is
 * deliberate and it is how every white-label and introducer brand in this
 * market handles it: the provider is named in the footer disclosure on every
 * page, and in the privacy notice where data protection law requires the
 * controller to be identified. It is not named in body copy, because a
 * prospect who reads the provider's name on an About page can simply go to
 * the provider direct, and there is then no business here.
 *
 * Unnamed does not mean vague. The arrangement, the permission and the fact
 * that we are not the regulated firm are all stated plainly either way. What
 * is withheld is only the counterparty's identity, and only where the law
 * does not ask for it.
 */
export function RegulatoryNote({
  className = "",
  compact = false,
  tone = "muted",
  nameProvider = false,
}: {
  className?: string;
  /** One sentence for the footer bar, rather than the full disclosure. */
  compact?: boolean;
  /** `inherit` drops the colour so the note can sit on a dark panel. */
  tone?: "muted" | "inherit";
  /** Name the regulated firm and its FRN. Footer only. */
  nameProvider?: boolean;
}) {
  const { provider } = brand;
  const named =
    nameProvider && provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;
  const base = `text-xs leading-relaxed ${tone === "muted" ? "text-muted" : ""}`;

  const introduction = named ? (
    <>
      {brand.name} is acting as an introducer to {provider.regulatedEntity}, who is providing the
      regulated payment services and is authorised and regulated by the Financial Conduct Authority
      under {provider.permissions} (firm reference number {provider.firmReferenceNumber}).
    </>
  ) : (
    <>
      {brand.name} is acting as an introducer. The regulated payment services are provided by an
      established payment institution authorised and regulated by the Financial Conduct Authority
      under the Payment Services Regulations 2017, not by {brand.name}.
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
