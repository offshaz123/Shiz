import type { Prospect } from "./prospect-types";
import { outreachLine } from "./outreach-lines";
import { siteConfig } from "./site-config";

/**
 * What to say when you ring one of these businesses.
 *
 * Walid's reasoning, and it is right: most cold calls die in the first ten
 * seconds because the person on the other end has heard the opening before
 * and already knows how to end it. "We're not interested" is a reflex to a
 * shape of call, not a judgement on the offer, and the way past it is not a
 * better pitch, it is not sounding like the call they are bracing for.
 *
 * So this is built on four rules rather than a word-for-word read:
 *
 *  1. Ask permission in the first sentence and mean it. "Thirty seconds and
 *     if it's not for you I'll go" is disarming because it hands them the
 *     control they were about to take anyway, and it costs nothing: a
 *     business that says no at ten seconds was never going to say yes at
 *     ninety.
 *  2. Lead with something true about THEIR business, not about ours. That
 *     is what the scan is for. "Your phone number isn't tappable on a
 *     mobile" is a sentence nobody else rang them with today.
 *  3. Ask a question early and then stop talking. A call where only one
 *     person speaks is a presentation, and people hang up on presentations.
 *     The pen is never sold by describing the pen.
 *  4. Ask for something small. Not the work. A report, or fifteen minutes.
 *
 * The scripts are generated from the prospect's own data, so the opener
 * changes depending on whether they have no website, a bad one, or three
 * emails they never answered. Every figure quoted is a real client result
 * from the case studies on the site; nothing here invents a number, and
 * nothing promises an outcome.
 */

export type ScriptSection = {
  heading: string;
  /** Said aloud. Rendered as the words to use. */
  say?: string;
  /** Why it is worded this way. Rendered smaller, for reading once. */
  note?: string;
};

export type CallScript = {
  /** Why this business is on the call list at all, in one line. */
  reason: string;
  sections: ScriptSection[];
  objections: { they: string; you: string }[];
  /** Everything found wrong with their site, in the order to raise it.
   *  Beside the script rather than inside it: the opener uses the
   *  first one, and these are what you talk through if they stay on
   *  the line and ask what else. Without them the call runs out of
   *  material after one sentence, which is where people hang up. */
  keyPoints: string[];
  /** How long this call should last, in minutes. Every minute is
   *  charged, and the thing worth winning is free. */
  minutes: number;
};

/**
 * A real result from a comparable business, when there is one.
 *
 * Proof from their own trade lands harder than the best number we have, so
 * a gym hears about a gym. Everything here is published on the site and
 * reconciles; where there is no match for the trade, the call gets no
 * figure rather than a borrowed one.
 */
const PROOF: Record<string, string> = {
  automotive:
    "We run the ads for Auto Wrap Manchester. 6,920 enquiries at £2.89 each.",
  fitness: "We did Federation Gym. 95 memberships for £6,000 of advertising.",
  hospitality:
    "We did Coffee Rules on Slater Street in Liverpool. 3,286 enquiries at £2.57 each.",
  "professional-services":
    "We run the ads for CoBanq. 8,427 enquiries at £1.86, and 2,371 opened accounts.",
};

function proofFor(industry: string): string {
  return PROOF[industry] ?? "";
}

/**
 * How the caller introduces themselves.
 *
 * It was "It's Walid" for everybody, which meant the first person
 * hired would have read somebody else's name down the phone to a
 * stranger. Wrong, and not a small kind of wrong: the whole opener is
 * built on not sounding like the call they are braced for, and it is
 * hard to sound like yourself while using another man's name.
 */
function who(callerName: string): string {
  const name = callerName.trim() || "Walid";
  return `It's ${name} from ${siteConfig.name}, we're a marketing agency in Canary Wharf.`;
}

/**
 * The ask: their WhatsApp number.
 *
 * It used to be the email address, and an email address is a worse
 * thing to win. An email goes into an inbox with forty others and
 * gets answered when they get round to it, which is never. A WhatsApp
 * message is read, and it gets replied to in a sentence rather than
 * in a letter — so the conversation carries on instead of stopping.
 *
 * It is also the cheapest thing on this page. Every minute of the
 * call costs money per minute; WhatsApp costs nothing at all. So the
 * job of the call is not to sell anything. It is to turn a metered
 * phone line into a free conversation, and then get off the phone.
 */
function theAsk(p: Prospect): ScriptSection {
  return {
    heading: "What to ask for — their WhatsApp",
    say: p.website
      ? `Look, I'll not keep you on the phone. Are you on WhatsApp? Give me the number and I'll send you exactly what I found, in writing, so you can read it when you've got two minutes rather than me talking at you now.`
      : `I'll not keep you. Are you on WhatsApp? Give me your number and I'll send you a mock-up of what a page for ${p.name} could look like — you can look at it tonight and tell me to get lost if you hate it.`,
    note: "The WhatsApp number is the win, not the sale. An email address gets you into an inbox with forty others; a WhatsApp number gets you a conversation they actually answer, and it costs nothing per minute. If they will only give you an email, take the email — but ask for WhatsApp first, every time.",
  };
}

/**
 * The reminder that the call is costing money by the minute.
 *
 * Put at the end rather than the start because that is when it is
 * needed: the risk is not starting a long call, it is not noticing
 * one. Five minutes is a number somebody can hold in their head while
 * talking.
 */
const KEEP_IT_SHORT: ScriptSection = {
  heading: "Get off the phone",
  say: `That's great — I'll send it over to you on WhatsApp now. Thanks for your time.`,
  note: "Five minutes is the limit. Past that the call is costing real money and you are no longer selling, you are chatting. Once you have the WhatsApp number the valuable part of this call is over: say thanks, hang up, and send the message while you are still fresh in their mind.",
};

function objections(p: Prospect, hasEmailed: boolean): { they: string; you: string }[] {
  const list = [
    {
      they: "We're not interested.",
      you: `That's fair enough, I rang you out of the blue. Can I ask one thing before I go, is it that you're busy enough already, or have you been burned by a marketing company before?`,
    },
    {
      they: "We've already got someone doing it.",
      you: `Good, that puts you ahead of most. What are they handling for you, the ads or the website? If they're doing it properly I'll leave you alone, I mean that.`,
    },
    {
      they: "How much is it?",
      you: `The prices are on our website, which is more than most will tell you. Have a look at ${siteConfig.url.replace(/^https?:\/\//, "")} and if you're already paying someone, tell me what you're paying and I'll tell you straight whether we'd beat it.`,
    },
    {
      they: "I haven't got time right now.",
      you: `No problem, I'll not keep you. When's quieter, mornings or after five? I'll ring back then.`,
    },
  ];

  list.splice(1, 0, {
    they: "Send me an email.",
    you: hasEmailed
      ? `I did, that's actually why I'm ringing — I sent a few last week and I know they get buried. Give me twenty seconds now and if it's not for you I'll stop.`
      : `I can do, but they get buried. Give me twenty seconds now, and if it's worth reading I'll send it straight after so you've got it in writing.`,
  });

  return list;
}

export function callScript(p: Prospect, emailsSent: number, callerName = ""): CallScript {
  const WHO = who(callerName);
  const proof = proofFor(p.industry);
  const hasEmailed = emailsSent > 0;
  const finding = p.findings[0] ? outreachLine(p.findings[0]) : "";

  const opener: ScriptSection = {
    heading: "Opening line",
    say: hasEmailed
      ? `Hi, is that ${p.name}? ${WHO} I sent you a couple of emails last week about your website. I'm not chasing, I just know emails get buried and I'd rather ask you directly. Have you got thirty seconds?`
      : `Hi, is that ${p.name}? ${WHO} I know I'm ringing out of the blue. Can I have thirty seconds to tell you why, and if it's not for you just say so and I'll leave you be?`,
    note: "Hand them the exit in the first sentence. They were going to take it anyway, and offering it is the thing that makes this not sound like the call they are braced for. Then stop and let them answer.",
  };

  const hook: ScriptSection = !p.website
    ? {
        heading: "Why you are ringing them",
        say: `I was looking you up on Google. You've got ${p.reviews} review${p.reviews === 1 ? "" : "s"}${p.rating !== null ? ` at ${p.rating} stars` : ""}, which is better than a lot of people in your trade. But when somebody finds you and wants to check you out, there's nothing there. No website at all. So they go back to the search and click whoever's next.`,
        note: "No website is the easiest version of this call: there is nothing to criticise, only something missing. Lead with the reviews, which is a genuine compliment and true.",
      }
    : finding
      ? {
          heading: "Why you are ringing them",
          // "This morning" is false for anybody emailed that same finding
          // last week, and one detail that does not line up is what makes a
          // call sound read off a card. Reference the email instead.
          say: hasEmailed
            ? `It was about your website. ${finding} So somebody's looking for exactly what you do, they land on you, something small gets in the way, and they go back to Google and ring the next one. You'd never know it happened. It just looks like a quiet week.`
            : `I had a look at your website this morning. ${finding} So somebody's looking for exactly what you do, they land on you, something small gets in the way, and they go back to Google and ring the next one. You'd never know it happened. It just looks like a quiet week.`,
          note: "One finding, not the list. The list is what the report is for. Say the one that costs them money and let them react to it.",
        }
      : {
          heading: "Why you are ringing them",
          say: `I had a look at your website and honestly it's in better shape than most I see. The gap is further back, in how many people are finding it in the first place.`,
          note: "Nothing was found worth criticising, so do not invent a fault. A site with no problems is a traffic conversation, not a fixing one.",
        };

  const question: ScriptSection = {
    heading: "Then ask this, and stop talking",
    say: `Can I ask, how are people finding you at the moment? Is it mostly word of mouth and repeat, or are you doing anything to bring new ones in?`,
    note: "The most important line on the page. Up to here you have been talking; this is where they start, and a call where they talk is a call that does not end in thirty seconds. Whatever they answer tells you which half of what we do is worth mentioning. Do not fill the silence.",
  };

  const sections = [opener, hook, question];

  if (proof) {
    sections.push({
      heading: "If they ask who you've worked with",
      say: proof,
      note: "Their trade, not our best number. Only say it if they ask or if it answers something they raised. Reeling off client names unprompted is what every other agency does on this call.",
    });
  }

  sections.push(theAsk(p));
  sections.push(KEEP_IT_SHORT);

  const reason = !p.website
    ? "No website at all. Nothing for anyone to land on when they search for them."
    : hasEmailed
      ? `Had ${emailsSent} email${emailsSent === 1 ? "" : "s"} and never replied. They know the name, so this is a follow-up rather than a cold call.`
      : !p.email
        ? "Has a website but publishes no email address, so we can only ever reach them by phone."
        : p.findings.length > 0
          ? `Their website has ${p.findings.length} thing${p.findings.length === 1 ? "" : "s"} wrong with it that are costing them enquiries.`
          : "On the list from a search, scanned, nothing obviously wrong with the site.";

  return {
    reason,
    sections,
    objections: objections(p, hasEmailed),
    keyPoints: p.findings.map((f) => outreachLine(f)),
    minutes: 5,
  };
}
