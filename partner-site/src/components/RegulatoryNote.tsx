import { brand } from "@/lib/brand";

/**
 * The standing disclosure about who is regulated and who is not.
 *
 * The version naming the regulated entity and its FCA firm reference number
 * only renders once both are filled in on `brand.provider`. Publishing an
 * unverified FRN on a payments website is worse than publishing none, so until
 * CoBanq confirms them this falls back to wording that is accurate either way.
 */
export function RegulatoryNote({ className = "" }: { className?: string }) {
  const { provider } = brand;
  const named = provider.regulatedEntity && provider.firmReferenceNumber;

  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`}>
      {brand.name} is not a bank and does not hold deposits.{" "}
      {named ? (
        <>
          Business payment accounts are provided by {provider.regulatedEntity}, authorised and
          regulated by the Financial Conduct Authority (firm reference number{" "}
          {provider.firmReferenceNumber}).
        </>
      ) : (
        <>
          Business payment accounts are provided through our UK-regulated payments partner, under
          that firm&rsquo;s permissions.
        </>
      )}{" "}
      Customer funds are held in safeguarded accounts and are not protected by the Financial
      Services Compensation Scheme. Every application is subject to full identity, anti-money-laundering
      and source-of-funds checks, and the regulated firm makes the final decision on whether an
      account is opened. Nothing on this site is an offer of an account or a guarantee of approval.
    </p>
  );
}
