import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { Section, Eyebrow } from "@/components/Section";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: `The cookies ${brand.name} uses, what each one is for, and how to change your mind.`,
  alternates: { canonical: "/cookies" },
};

/**
 * The cookie policy.
 *
 * The table is the document. Everything else is context for it, and the rule
 * we hold ourselves to is that nothing appears in it that the site does not
 * actually set — a policy listing cookies you do not use is as wrong as one
 * that omits cookies you do.
 */
const rows = [
  {
    category: "Strictly necessary",
    purpose:
      "Remembering the choice you made on the cookie banner, so you are not asked again on every page.",
    detail: "Stored in your browser, not sent to us. Kept whichever way you answer.",
    consent: "No consent needed",
  },
  {
    category: "Analytics",
    purpose:
      "Counting which pages are read and how people arrive, so we know which parts of the site are worth writing more of.",
    detail: "Google Analytics, with IP anonymisation on. Loaded only after you accept.",
    consent: "Only with your consent",
  },
  {
    category: "Advertising",
    purpose: "Following you around other websites with adverts.",
    detail: "We do not use these. There is no advertising pixel on this site.",
    consent: "Not used",
  },
];

const sections = [
  {
    heading: "What a cookie is",
    body: [
      "A small file a website asks your browser to keep, so that something can be remembered between one page and the next. Some are needed for a site to work at all; the rest are optional, and optional means you get to say no.",
    ],
  },
  {
    heading: "How we ask",
    body: [
      "The first time you arrive, a banner asks whether you are happy with analytics cookies. Nothing optional is set before you answer. Rejecting is one click, exactly like accepting — there is no maze of toggles standing in for a no, and the site behaves identically whichever you choose.",
      "Your answer is remembered in your browser's local storage rather than in a cookie. It never leaves your device, and we cannot read it.",
    ],
  },
  {
    heading: "Changing your mind",
    body: [
      "Use the cookie settings link in the footer of any page, or at the bottom of this one. Clearing your browser's site data for this site also resets the question.",
      "You can block or delete cookies in your browser settings as well. Blocking the strictly necessary one only means the banner asks again on every visit.",
    ],
  },
  {
    heading: "Cookies set by other people",
    body: [
      "If you go on to apply for an account, that application is handled on the provider's own website, under its own cookie policy. This policy covers this site only.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <Section>
      <div className="max-w-3xl">
        <Eyebrow>Legal</Eyebrow>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight">Cookie policy</h1>
        <p className="mt-4 text-sm text-muted">
          Version 1.0 &middot; last updated 23 September 2026
        </p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">What it does</th>
                <th className="px-4 py-3 font-medium">Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.category} className="align-top">
                  <td className="px-4 py-4 font-semibold">{row.category}</td>
                  <td className="px-4 py-4 leading-relaxed text-muted">
                    {row.purpose}
                    <span className="mt-1.5 block text-xs">{row.detail}</span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-muted">{row.consent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-border pt-8 text-sm">
          <CookieSettingsLink className="btn btn-ghost" />
          <Link href="/privacy" className="font-semibold text-accent-2 underline-offset-4 hover:underline">
            Privacy policy
          </Link>
        </div>
      </div>
    </Section>
  );
}
