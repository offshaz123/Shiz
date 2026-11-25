import type { Prospect } from "./prospect-types";
import { outreachLine } from "./outreach-lines";
import { siteConfig } from "./site-config";

/**
 * The email you send straight after a call.
 *
 * Different from the cold sequence in the one way that matters: the
 * person has just spoken to you and asked for this. The cold emails
 * have to earn attention from nothing and open by proving somebody
 * looked at their website. These open by referring to a conversation
 * that happened twenty seconds ago, which is the whole advantage of
 * having made the call.
 *
 * The button on the call list sent a cold step-one email, to somebody
 * who had just been on the phone. That reads as a mail-merge, and it
 * undoes the call.
 *
 * Three, because the thing they asked for is one of three things:
 * what you promised, what we actually do, or what is wrong with the
 * site. No invented figures and no promised results anywhere in them:
 * these go to somebody who can tell in one line whether a person
 * wrote it.
 */

export type TemplateKey = "as-promised" | "what-we-do" | "their-site";

export type CallTemplate = {
  key: TemplateKey;
  /** What it is called on the button. */
  label: string;
  /** When to use it, in a few words. */
  when: string;
  subject: string;
  body: string;
};

/**
 * The WhatsApp number as a person would read it.
 *
 * The stored one is "447539559947", which is what wa.me links need and
 * is not something anybody wants to read in an email. It is the same
 * number as the phone, so it is written the way the phone is written.
 */
const WHATSAPP = siteConfig.phoneDisplay;

/**
 * Signed by whoever made the call.
 *
 * Given the whole name, because this is the bottom of an email rather than
 * the middle of a sentence: "Ali" is how you introduce yourself on the
 * phone, and a surname is how somebody looks you up afterwards.
 */
function signOff(callerName: string): string[] {
  const name = callerName.trim() || "Walid Shah";
  return [``, name, siteConfig.name, siteConfig.phoneDisplay, siteConfig.url];
}

function tail(unsubscribeUrl: string): string[] {
  return unsubscribeUrl
    ? [``, `If you'd rather not hear from me again: ${unsubscribeUrl}`]
    : [``, `If you'd rather I didn't email again, just say so and that's the end of it.`];
}

/** The findings as a numbered list, or nothing when the site is clean. */
function findingLines(p: Prospect): string[] {
  if (p.findings.length === 0) return [];
  return p.findings.map((f, i) => `${i + 1}. ${outreachLine(f)}`);
}

export function callTemplates(
  p: Prospect,
  callerName = "",
  unsubscribeUrl = "",
): CallTemplate[] {
  // Passed through as given, so signOff can use the full name where nobody
  // was named. Defaulting it here left that fallback unreachable and signed
  // every unattributed email "Walid" with no surname.
  const name = callerName;
  const found = findingLines(p);
  const site = p.website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const asPromised: CallTemplate = {
    key: "as-promised",
    label: "As promised",
    when: "They asked you to send something over",
    subject: `As promised — ${p.name}`,
    body: [
      `Hi,`,
      ``,
      `Thanks for taking my call just now. As promised, here it is in writing.`,
      ``,
      ...(found.length
        ? [
            found.length === 1
              ? `The thing I mentioned about your website:`
              : `The things I mentioned about your website:`,
            ``,
            ...found,
            ``,
          ]
        : [
            `I had a look at ${site || "your website"} before I rang and there was nothing obviously broken on it, which puts you ahead of most. What we would be talking about is getting more people to it.`,
            ``,
          ]),
      `If any of that is worth a longer conversation, the easiest thing is WhatsApp — ${WHATSAPP}, same number. Send me a message and I'll answer there, no need to book anything.`,
      ``,
      `And if it isn't for you, no hard feelings at all. Thanks for your time.`,
      ...signOff(name),
      ...tail(unsubscribeUrl),
    ].join("\n"),
  };

  const whatWeDo: CallTemplate = {
    key: "what-we-do",
    label: "What we do",
    when: "They asked what you actually do",
    subject: `What we do — ${siteConfig.name}`,
    body: [
      `Hi,`,
      ``,
      `Thanks for your time on the phone. You asked what we actually do, so here it is plainly.`,
      ``,
      `We do three things for businesses like yours:`,
      ``,
      `1. Websites. Built to be found and to make it easy to get in touch — which is most of what decides whether a visitor turns into an enquiry.`,
      `2. Google and Meta ads. Run properly, watched weekly, and stopped if they are not working rather than left running quietly.`,
      `3. Getting found locally. Your Google listing, your reviews, and the pages people land on when they search for your trade in your area.`,
      ``,
      `Our prices are on the website rather than behind a phone call: ${siteConfig.url}/pricing`,
      ``,
      `Easiest way to carry this on is WhatsApp — ${WHATSAPP}, same number. Message me there whenever suits and I'll answer properly.`,
      ...signOff(name),
      ...tail(unsubscribeUrl),
    ].join("\n"),
  };

  const theirSite: CallTemplate = {
    key: "their-site",
    label: "Their website",
    when: "They want what is wrong with the site in writing",
    subject: found.length
      ? `${p.name} — what I found on your website`
      : `${p.name} — your website`,
    body: [
      `Hi,`,
      ``,
      `Thanks for your time on the phone. Here it is in writing, as asked.`,
      ``,
      ...(found.length
        ? [
            `This is what I found when I went through ${site || "your website"}, in the order I would fix it.`,
            ``,
            ...found,
            ``,
            `None of that is difficult to put right, and the first one usually makes the biggest difference on its own.`,
          ]
        : [
            `I went through ${site || "your website"} properly and there was nothing obviously wrong with it. I would rather tell you that than invent a problem to sell you something.`,
            ``,
            `What that means is the gap is further back — how many people find the site at all. That is a different job and it is the one worth talking about.`,
          ]),
      ``,
      `Happy to go through any of it. WhatsApp is easiest — ${WHATSAPP}, same number — or just ring it.`,
      ...signOff(name),
      ...tail(unsubscribeUrl),
    ].join("\n"),
  };

  return [asPromised, whatWeDo, theirSite];
}
