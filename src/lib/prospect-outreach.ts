import { siteConfig } from "./site-config";
import { outreachLine, servicesLine } from "./outreach-lines";
import type { Prospect } from "./prospect-types";

/**
 * The three emails a prospect gets, and nothing else.
 *
 * Step 1 goes out when Walid presses send, after reading it. Steps 2 and 3
 * follow on their own three and five days after that, and that is the end —
 * there is no step 4, and nothing here will ever write to somebody who has
 * not had step 1 sent to them by hand.
 *
 * Kept out of the admin component so the cron job and the browser build the
 * same email from the same words. Nothing in here touches the database or
 * node crypto, because the browser imports it: the unsubscribe URL is minted
 * by the caller and passed in.
 */

/**
 * The signature. Four lines, and that is the whole point of it.
 *
 * It used to carry LinkedIn, Instagram, Facebook and the postal address. A
 * signature with six links under it looks like a mailshot even when the
 * email above it is not one, and every one of those links is a thing between
 * the reader and the only two that matter: the phone number and the website.
 *
 * The address came off with them, at Walid's call. It buys a little goodwill
 * with a spam filter, but a cold email that looks like a letterhead costs
 * more than it earns.
 */
export const SIGNATURE: string[] = [
  "Walid Shah",
  siteConfig.name,
  `${siteConfig.phoneDisplay} · ${siteConfig.email}`,
  siteConfig.url.replace(/^https?:\/\//, ""),
];

export type OutreachStep = 1 | 2 | 3;

export type Draft = { subject: string; body: string };

/** Days after the first email that each of the later ones is due. */
export const STEP_DAYS: Record<2 | 3, number> = { 2: 3, 3: 5 };

const booking = siteConfig.demoBookingUrl;

/**
 * The first email: short on purpose.
 *
 * A cold email that opens with six paragraphs is deleted on the first one.
 * This one says what is wrong, what we do about it, and how to answer — and
 * stops. Everything else can wait for a reply or for step 2.
 */
function stepOne(p: Prospect, unsubscribeUrl: string): Draft {
  const findings = p.findings.length
    ? [
        p.findings.length === 1
          ? `I had a look at the ${p.name} website, and one thing on it is quietly costing you enquiries:`
          : `I had a look at the ${p.name} website, and a few things on it are quietly costing you enquiries:`,
        ``,
        ...p.findings.flatMap((f) => [`- ${outreachLine(f)}`, ``]),
      ]
    : [`I had a look at the ${p.name} website and there are a few things on it worth putting right.`, ``];

  return {
    subject: `${p.name} — a couple of things on your website`,
    body: [
      `Hi,`,
      ``,
      ...findings,
      `That's the sort of thing we fix, alongside running the Google and Meta ads that bring people to the site in the first place.`,
      ``,
      `Want the full report? Reply and I'll send it over — free, no obligation. Or ring me on ${siteConfig.phoneDisplay}: I'm Walid Shah, I own the business, and I take the calls myself.`,
      ``,
      ...SIGNATURE,
      // One click rather than "reply and say so". Asking somebody to compose
      // an email to make you stop is a small favour to ask of a person you
      // wrote to out of the blue, and a filter counts a link it can see.
      ...(unsubscribeUrl
        ? [``, `Rather not hear from me? Click here and I won't contact you again: ${unsubscribeUrl}`]
        : [``, `If you'd rather I didn't email again, just say so and that's the end of it.`]),
    ].join("\n"),
  };
}

/**
 * The second, three days later: the one that explains itself.
 *
 * Longer because by now they have decided not to reply once, and the only
 * thing that changes that is understanding what the first email was actually
 * about. No invented numbers — what is lost here is described, not counted,
 * because we have not measured their business and will not pretend to have.
 */
function stepTwo(p: Prospect, unsubscribeUrl: string): Draft {
  return {
    subject: `Re: ${p.name} — a couple of things on your website`,
    body: [
      `Hi,`,
      ``,
      `Following up on what I sent about the ${p.name} website.`,
      ``,
      `The reason I'm bothering you again is what those things add up to. They are all the same story: somebody looking for exactly what you sell finds you, something small gets in the way — nothing to tap, nothing that answers them, nothing that follows up — and they go back to the search results and ring the next one instead. You never see it happen. It just looks like a quiet week.`,
      ``,
      `What we would actually do, in order:`,
      ``,
      `- Fix what's losing people on the site now, which is the list in my last email.`,
      `- Put Google Ads in front of the people already searching for what you do in your area, and Meta and Instagram ads in front of the ones who haven't thought of you yet.`,
      `- Set you up with a CRM so every enquiry — form, WhatsApp, phone, Instagram — lands in one place and gets followed up, instead of sitting in somebody's phone.`,
      ``,
      `The full list of what we do is ${servicesLine()}.`,
      ``,
      `Our prices are on the website, which is more than most will tell you up front. If you're already working with someone, tell me what you're paying and I'll tell you straight whether we'd beat it — and if we wouldn't, I'll say so.`,
      ``,
      `Twenty minutes on a Google Meet with me is usually enough to know whether any of it's worth doing.${booking ? ` You can take a slot out of my diary here: ${booking}` : ""}`,
      ``,
      `Reply, or ring me on ${siteConfig.phoneDisplay}. If neither, I'll send one more and then leave you to it.`,
      ``,
      ...SIGNATURE,
      ``,
      `Not interested? Click here and I will not contact you again: ${unsubscribeUrl}`,
    ].join("\n"),
  };
}

/**
 * The third, on day five: the last one, and it says so.
 *
 * Saying plainly that this is the end is not a tactic. It is the only part of
 * a cold sequence that a person can verify, because the proof arrives when
 * nothing else does.
 */
function stepThree(p: Prospect, unsubscribeUrl: string): Draft {
  return {
    subject: `Re: ${p.name} — a couple of things on your website`,
    body: [
      `Hi,`,
      ``,
      `Last one from me, as promised.`,
      ``,
      `Short version: the ${p.name} website is losing enquiries it doesn't need to lose, I can show you exactly where, and the report's free whether or not you ever work with us.`,
      ``,
      `If the timing's wrong, or you already have somebody, or it's simply not the thing you need this month — all completely fair. I won't email you again either way.`,
      ``,
      `If it ever does become the thing: ${siteConfig.phoneDisplay}, ${siteConfig.email}, and the prices are on ${siteConfig.url}.${booking ? ` My diary is at ${booking}.` : ""}`,
      ``,
      `All the best with it either way.`,
      ``,
      ...SIGNATURE,
      ``,
      `Rather not hear from us again? Click here: ${unsubscribeUrl}`,
    ].join("\n"),
  };
}

export function buildDraft(step: OutreachStep, p: Prospect, unsubscribeUrl = ""): Draft {
  if (step === 2) return stepTwo(p, unsubscribeUrl);
  if (step === 3) return stepThree(p, unsubscribeUrl);
  return stepOne(p, unsubscribeUrl);
}
