import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${brand.name} handles the information you send through this website, and who becomes responsible for it once you apply for an account.`,
  alternates: { canonical: "/privacy" },
};

const { provider } = brand;

/**
 * The privacy notice.
 *
 * It covers what this website actually does and no more: an enquiry form that
 * sends an email, and an introduction to the firm that provides the regulated
 * services. Everything downstream of that introduction — the application, the
 * KYC file, the account, the payments — is CoBanq's processing under CoBanq's
 * own notice, and this document says so rather than implying we do it.
 *
 * The structure follows the notice of an introducer in the same position as
 * ours, and the facts about the provider are taken from what CoBanq publishes
 * on its own site.
 *
 * TODO before go-live: have a solicitor read this alongside the terms that
 * will govern the account relationship, and fill in `brand.icoNumber` once the
 * company is registered with the ICO. Registering with the ICO is a legal
 * requirement, not a formality, for a company processing personal data in the
 * UK. `brand.companyNumber` is filled in; `brand.registeredName` waits on the
 * change of name landing on the register.
 */
const sections: { heading: string; body?: string[]; items?: string[] }[] = [
  {
    heading: "1. Introduction",
    body: [
      `${brand.name} is committed to protecting your privacy and safeguarding your personal data. This notice explains what we collect when you use this website, how we use it, who we share it with, and what rights you have over it. It is given in accordance with the UK General Data Protection Regulation ("UK GDPR") and the Data Protection Act 2018.`,
      `${brand.name} is an introducer. The regulated payment services, and the account you would hold, are provided by ${provider.regulatedEntity}, who is authorised and regulated by the Financial Conduct Authority under ${provider.permissions} (firm reference number ${provider.firmReferenceNumber}). ${provider.name}'s own privacy notice applies to everything that happens after we introduce you, and you should read it alongside this one.`,
      `If you have a question about anything in this notice, email ${brand.email} or call ${brand.phoneDisplay}.`,
    ],
  },
  {
    heading: "2. Who controls your data",
    body: [
      `${brand.name} is the data controller for the enquiry you send through this website and for the correspondence that follows it${brand.companyNumber ? ` (company number ${brand.companyNumber}${brand.icoNumber ? `, ICO registration number ${brand.icoNumber}` : ""})` : ""}.`,
      `${provider.regulatedEntity} is the data controller for your account application and for the account itself, including the identity checks, the anti-money-laundering screening and the transaction records. Its registered office is ${provider.registeredOffice}, its ICO registration number is ${provider.icoNumber}, and its data protection officer can be reached at ${provider.dpoEmail}.`,
      `In plain terms: what you type into the form on this site is ours to look after. What you send to ${provider.name} when you apply is ${provider.name}'s.`,
    ],
  },
  {
    heading: "3. What we collect",
    body: ["From the enquiry form, when you choose to send one:"],
    items: [
      "Contact data: your name, your company's name, your email address and your telephone number.",
      "Business data: what the business does, roughly what comes in each month, the currencies you pay out in, who you bank with today and what they charge you.",
      "Anything else you choose to put in the message box.",
    ],
  },
  {
    heading: "4. What we collect automatically",
    body: [
      "When you visit this website our hosting provider records the standard technical data any web server receives in order to serve you a page: your IP address, your browser type and the pages you requested.",
      "Nothing optional is stored on your device until you have said yes to it. The first time you arrive you are asked whether you are happy with analytics cookies, which count which pages are read; rejecting is one click and the site behaves identically either way. There is no advertising pixel and no tracking of you across other sites. The cookie policy lists everything and lets you change your mind.",
      "We do not ask for identity documents, bank statements or any other application paperwork through this website, and we would rather you did not send them here. When an application needs them, you will be told how to send them securely.",
    ],
  },
  {
    heading: "5. How we use it, and on what basis",
    body: ["We process what you send us for the following purposes, on the following lawful bases:"],
    items: [
      "To answer your enquiry and work out whether the account fits what you do — taking steps at your request before entering into a contract, and our legitimate interest in replying to someone who asked us to get in touch.",
      `To introduce you to ${provider.regulatedEntity} where you ask us to take it forward — steps taken at your request.`,
      "To keep a record of the enquiry and our correspondence about it — our legitimate interest in knowing who we have spoken to and what was said.",
      "To meet any legal or regulatory obligation that applies to us — legal obligation.",
    ],
  },
  {
    heading: "6. Who we share it with",
    body: ["We share your personal data with:"],
    items: [
      `${provider.regulatedEntity}, where you ask us to introduce you, so that your application can be considered.`,
      "Our email and hosting providers, which carry the message from this website to our inbox and store it there.",
      "Professional advisers bound by confidentiality, where we need advice about an enquiry.",
      "Anyone we are legally required to disclose it to.",
    ],
  },
  {
    heading: "7. What we do not do",
    items: [
      "We do not sell your personal data, to anyone, for any purpose.",
      "We do not add you to a marketing list because you sent an enquiry.",
      "We do not make automated decisions about you. Whether an account is opened is decided by the compliance function of the firm providing it, after checks it carries out under its own notice — not by anything on this website.",
    ],
  },
  {
    heading: "8. How long we keep it",
    items: [
      "Enquiries that do not lead to an application: up to two years, in case you come back to us, and then deleted.",
      "Enquiries that lead to an introduction: for as long as the introduction is live, and then for six years, which is the period we may need to evidence what we did and when.",
      `Records held by ${provider.regulatedEntity} in connection with an account follow its own retention periods, which are longer because anti-money-laundering law requires it.`,
    ],
  },
  {
    heading: "9. Where your data is held",
    body: [
      "Your enquiry is held on servers in the United Kingdom or the European Economic Area.",
      "Where personal data is transferred outside the UK, it is protected by the safeguards UK data protection law requires — either a finding of adequacy for the destination country, or the UK's International Data Transfer Agreement or Addendum to the Standard Contractual Clauses.",
    ],
  },
  {
    heading: "10. How we protect it",
    body: [
      "Enquiries reach us over an encrypted connection and are held in mailboxes protected by multi-factor authentication, and access is limited to the people who deal with new enquiries.",
      "No system is completely secure, and anyone who tells you otherwise is selling something. If a breach ever affected your data and posed a risk to you, we would tell you and the Information Commissioner's Office.",
    ],
  },
  {
    heading: "11. Your rights",
    body: ["Under UK GDPR you have the right to:"],
    items: [
      "Access — ask for a copy of the personal data we hold about you.",
      "Rectification — ask us to correct anything inaccurate or incomplete.",
      "Erasure — ask us to delete your data, where we have no overriding reason to keep it.",
      "Restriction — ask us to limit what we do with it while a question about it is resolved.",
      "Portability — receive the data you gave us in a structured, machine-readable format.",
      "Object — object to processing we carry out on the basis of legitimate interests.",
    ],
  },
  {
    heading: "12. How to exercise them, and how to complain",
    body: [
      `Email ${brand.email} and say what you want. We will respond within one calendar month. If a request is complex, or you have made several, we may extend that by up to two further months and will tell you if we do.`,
      `For data held in connection with an account rather than an enquiry, contact ${provider.name}'s data protection officer at ${provider.dpoEmail}, or ${provider.privacyEmail}.`,
      "If you are not satisfied with how we have handled your personal data, you can complain to the Information Commissioner's Office at ico.org.uk, or on 0303 123 1113. We would rather you came to us first, but you do not have to.",
    ],
  },
  {
    heading: "13. Changes to this notice",
    body: [
      "We update this notice when what we do with personal data changes, or when the law does. The date below is the date of the current version, and material changes will be flagged on this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-4 text-sm text-muted">
          Version 1.0 &middot; last updated 23 September 2026
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>

              {section.body && (
                <div className="mt-4 space-y-3.5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {section.items && (
                <ul className="mt-4 space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
