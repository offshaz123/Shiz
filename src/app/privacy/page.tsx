import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${siteConfig.name}.`,
  alternates: { canonical: "/privacy" },
};

const sections = [
  {
    heading: "1. Who we are",
    body: `${siteConfig.legalName} ("we", "us", "our"), trading as "${siteConfig.name}", provides car window tinting, wrapping, servicing, number plates and alloy refurbishment services. This policy explains how we collect, use and protect personal information submitted through this website.`,
  },
  {
    heading: "2. Information we collect",
    body: `When you submit an enquiry form on this website, message our AI chat assistant, or we log a call or WhatsApp message from you, we collect the information you provide, which may include your name, phone number, email address, vehicle/service details, and the content of your message.`,
  },
  {
    heading: "3. How we use your information",
    body: `We use the information you provide to respond to your enquiry, arrange bookings, and discuss our services with you. We do not sell your personal information to third parties.`,
  },
  {
    heading: "4. How we store your information",
    body: `Enquiries, call/message logs and chat assistant conversations are stored securely in our own database so our team can respond to and track your enquiry.`,
  },
  {
    heading: "5. Sharing your information",
    body: `We do not share your personal information with third parties except where necessary to deliver our services (for example, our hosting and AI assistant providers), to comply with the law, or with your consent.`,
  },
  {
    heading: "6. Cookies",
    body: `This website uses essential cookies required for it to function correctly (for example, to remember your dark/light theme preference and to keep the AI chat assistant working). You can control cookies through your browser settings.`,
  },
  {
    heading: "7. Your rights",
    body: `You have the right to ask what personal information we hold about you, to request a correction, or to ask us to delete your information. To exercise any of these rights, contact us using the details below.`,
  },
  {
    heading: "8. Data retention",
    body: `We retain personal information only for as long as necessary to respond to your enquiry, provide our services, or as required by law.`,
  },
  {
    heading: "9. Changes to this policy",
    body: `We may update this policy from time to time. Any changes will be posted on this page with an updated revision date.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">Legal</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted">Last updated: 2 August 2026</p>

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
            If you have any questions about this Privacy Policy or how we handle your data, please contact us at{" "}
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
