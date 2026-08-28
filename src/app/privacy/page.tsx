import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Executive Tints & Repairs.",
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    heading: "1. Who we are",
    body: `Executive Tints & Repairs ("we", "us", "our") provides window tinting and vehicle repair & servicing to customers. This policy explains how we collect, use and protect personal information submitted through this website, and we take keeping that information safe seriously.`,
  },
  {
    heading: "2. Information we collect",
    body: `When you submit a quote or enquiry form on this website, we collect the information you provide, which may include your name, phone number, email address, vehicle details and the service you're interested in. We may also collect basic technical information such as browser type and device information to help us improve the site.`,
  },
  {
    heading: "3. How we use your information",
    body: `We use the information you provide to respond to your enquiry, provide a quote, book and carry out your service, and, where you agree, to send you occasional offers. We do not sell your personal information to third parties.`,
  },
  {
    heading: "4. How we keep your information safe",
    body: `Quote and enquiry submissions are delivered securely to our team's email inbox. We only keep the details we need to complete your service and respond to you, and we take reasonable technical and organisational steps to protect your information from unauthorised access, loss or misuse.`,
  },
  {
    heading: "5. Sharing your information",
    body: `We do not share your personal information with third parties except where necessary to deliver our services (for example, parts suppliers or our email provider), to comply with the law, or with your consent.`,
  },
  {
    heading: "6. Cookies",
    body: `This website may use essential cookies required for it to function correctly, and a small amount of local browser storage to remember your chosen colour theme. You can control cookies through your browser settings.`,
  },
  {
    heading: "7. Your rights",
    body: `You have the right to ask what personal information we hold about you, to request a correction, or to ask us to delete your information. You can also opt out of any marketing communications at any time. To exercise any of these rights, contact us using the details below.`,
  },
  {
    heading: "8. Data retention",
    body: `We retain personal information only for as long as necessary to respond to your enquiry, provide your service, or as required by law.`,
  },
  {
    heading: "9. Changes to this policy",
    body: `We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Legal</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: 27 August 2026</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="text-lg font-semibold text-foreground">{s.heading}</h2>
            <p className="mt-2 leading-relaxed text-muted">{s.body}</p>
          </div>
        ))}

        <div>
          <h2 className="text-lg font-semibold text-foreground">10. Contact us</h2>
          <p className="mt-2 leading-relaxed text-muted">
            If you have any questions about this Privacy Policy or how we handle your data, please
            contact us at{" "}
            <a href={`mailto:${siteConfig.email}`} className="underline hover:text-foreground">
              {siteConfig.email}
            </a>{" "}
            or call {siteConfig.phoneDisplay}.
          </p>
        </div>
      </div>
    </div>
  );
}
