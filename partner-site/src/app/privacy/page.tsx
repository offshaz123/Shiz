import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${brand.name} handles the information you send through this website.`,
  alternates: { canonical: "/privacy" },
};

/**
 * A starting point covering what this website actually does — an enquiry form
 * that sends an email. It is deliberately narrow.
 *
 * TODO before go-live: have this reviewed alongside the terms that will govern
 * the account relationship itself, and add the company number, the registered
 * address and the ICO registration number once the company is incorporated.
 */
const sections = [
  {
    heading: "Who we are",
    body: [
      `${brand.legalName} ("we", "us") operates this website. If you want to talk to us about anything in this policy, email ${brand.email} or call ${brand.phoneDisplay}.`,
      `${brand.name} acts as an introducer to ${brand.provider.regulatedEntity}, who provides the regulated payment services and is authorised and regulated by the Financial Conduct Authority. Once you apply, that firm is the data controller for the information you give it, and this notice covers the part we handle: your enquiry.`,
    ],
  },
  {
    heading: "What we collect",
    body: [
      "From the enquiry form: your name, company name, email address, phone number, and whatever you tell us about the business — the type of trade, expected volumes, currencies, who you bank with now, and anything you add in the message box.",
      "From your visit: standard server request data such as IP address and browser type, which is what any website receives in order to serve you a page.",
      "We do not ask for identity documents, bank statements or any other application paperwork through this website, and we would rather you did not send them here.",
    ],
  },
  {
    heading: "Why we use it",
    body: [
      "To answer your enquiry and to work out whether we can help — which is our legitimate interest in responding to someone who has asked us to get in touch, and in taking steps at your request before entering into a contract.",
      "If you go on to apply for an account, to prepare and support that application.",
      "We do not sell your information, and we do not add you to a marketing list off the back of an enquiry.",
    ],
  },
  {
    heading: "Who sees it",
    body: [
      "The people at our company who deal with new enquiries.",
      "Our compliance function, where you ask us to take an application forward.",
      "Our email provider, which carries the message from this website to our inbox.",
      "Anyone we are legally required to disclose it to.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Enquiries that do not lead anywhere: up to two years, in case you come back to us.",
      "Enquiries that become customer relationships: for as long as the relationship lasts, and then for the period our legal and regulatory obligations require afterwards.",
    ],
  },
  {
    heading: "Your rights",
    body: [
      "You can ask us for a copy of the information we hold about you, ask us to correct it, ask us to delete it, or object to how we are using it. Email us and we will deal with it within one month.",
      "If you are not happy with how we have handled your information, you can complain to the Information Commissioner's Office at ico.org.uk.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This website sets one cookie, to remember whether you chose the light or dark version of the site. It is not used to track you and it is not shared with anyone.",
      "If we later add analytics or advertising tags, this policy will be updated and you will be asked first.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="mt-4 text-sm text-muted">Last updated 22 September 2026.</p>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="mt-4 space-y-3.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
