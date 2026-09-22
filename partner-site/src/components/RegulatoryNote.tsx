import { brand } from "@/lib/brand";

/**
 * The standing disclosure about who is regulated and who is not.
 *
 * The version naming the regulated entity and its FCA firm reference number
 * renders only once `provider.verified` is true. The numbers currently in the
 * config were read off CoBanq's own website, which is a reasonable source but
 * not the register — and an unverified FRN on a payments site is worse than
 * none. Confirm with CoBanq in writing, check the FCA register, then flip the
 * flag.
 */
export function RegulatoryNote({ className = "" }: { className?: string }) {
  const { provider } = brand;
  const named =
    provider.verified && provider.regulatedEntity && provider.firmReferenceNumber;

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      {brand.name} is not a bank and does not hold deposits.{" "}
      {named ? (
        <>
          Business payment accounts are provided by {provider.regulatedEntity}, authorised and
          regulated by the Financial Conduct Authority under {provider.permissions} (firm
          reference number {provider.firmReferenceNumber}).
        </>
      ) : (
        <>
          Business payment accounts are provided through our UK-regulated payments partner, under
          that firm&rsquo;s permissions.
        </>
      )}{" "}
      Customer funds are held in safeguarded accounts and are not protected by the Financial
      Services Compensation Scheme. Every application is subject to full identity,
      anti-money-laundering and source-of-funds checks, and the regulated firm makes the final
      decision on whether an account is opened. Nothing on this site is an offer of an account or a
      guarantee of approval.
    </p>
  );
}
