import type { ProspectFinding } from "./prospect-types";
import { services } from "@/content/services";

/**
 * Turning what the scanner found into something you can say to a person.
 *
 * The audit's own wording is written for the report and for the call list: a
 * label and a clause, read by someone who already knows what a meta
 * description is. Dropped into an email it comes out as "Main heading: More
 * than one main heading muddies what the page is about" — a fragment with no
 * subject, in words the owner of a nail salon has no reason to know. It reads
 * like a form letter from a machine, which is exactly what it must not do.
 *
 * So every check gets a sentence written to the business owner instead. Same
 * fact, their language, and it stands on its own without the label in front
 * of it. Keyed on the label rather than the check id because that is what is
 * stored on a prospect row, so rows scanned before this existed still work.
 */

const LINES: Record<string, string> = {
  // Tracking and advertising
  "Meta Pixel":
    "There's no Facebook or Instagram tracking on the site, so if you ever advertise there it can't learn who actually bought, and you can't put an ad back in front of someone who visited and left.",
  "Google Analytics":
    "Nothing on the site is recording visitors, so there's no way to tell how many people come, where they come from, or which page they give up on.",
  "Google Tag Manager":
    "There's nothing in place to manage your tracking, so every small change to it needs a developer rather than taking two minutes.",
  "Google Ads tracking":
    "If you ever run Google Ads there's nothing set up to tell you which clicks turned into enquiries, so you'd be paying without knowing what's working.",
  "Retargeting ready":
    "Most people don't buy on the first visit, and at the moment there's no way to reach them again afterwards — which is the cheapest advertising there is.",

  // On-page SEO
  "Page title":
    "The title your page shows in Google doesn't really say what you do or where you are, which is the bit people scan before they click.",
  "Meta description":
    "The description Google prints under your link is too short to persuade anyone to choose you over the business listed above you.",
  "Main heading":
    "The page has more than one main heading, which muddies what it's about for both Google and whoever lands on it.",
  "Canonical tag":
    "The site doesn't tell Google which address is the real one for a page, so if it can be reached more than one way Google has to guess.",
  "Structured data":
    "Nothing on the site tells Google your business name, address, phone and hours in a form it can read — which is also where ChatGPT and Google's AI answers get their facts from.",
  "Image descriptions":
    "Most of your images have no description attached, so they don't show up in image search and the site is hard to use for anyone on a screen reader.",
  "Amount of content":
    "There's very little text on the page, so there isn't much for Google to understand you by.",

  // Getting in touch
  "Tappable phone number":
    "Your phone number isn't tappable on a mobile — someone on their phone has to copy it out by hand to ring you.",
  "WhatsApp link":
    "There's no WhatsApp link anywhere. Plenty of people will send a message who would never fill in a form or pick up the phone.",
  "Email address":
    "There's no email address on the site that anyone can click.",
  "Enquiry form":
    "There's no enquiry form, so anybody who isn't ready to ring you has no way of getting in touch.",
  "Live chat or chatbot":
    "There's nothing catching questions out of hours, so an enquiry at nine at night waits until you're back at the desk.",
  "Online booking":
    "There's no way to book online, so every single appointment has to come through you.",

  // Online presence
  "Facebook page linked":
    "Your Facebook page isn't linked from the site, so Google doesn't join the two up as the same business.",
  "Instagram linked":
    "Your Instagram isn't linked from the site, which is a shame when that's where the proof of your work actually lives.",
  "Social sharing preview":
    "When someone shares your link in a message or on social it turns up as a bare web address with no picture or title on it.",
  "Reviews shown on site":
    "Your reviews aren't shown anywhere on the site, and they're usually the thing that decides it for somebody sitting on the fence.",
  "Blog or news section":
    "There's nothing on the site that ever gets added to, so Google has no reason to keep coming back and looking.",

  // Website fundamentals
  "Secure connection":
    "The site isn't on a secure connection, so browsers put a warning in front of people before they've seen a thing.",
  "Mobile friendly":
    "The page isn't set up properly for a phone, which is where the large majority of your visitors are.",
  "Server response":
    "The site is slow to answer, and people leave before they've seen anything at all.",
  Favicon:
    "There's no little icon on the browser tab, which is small, but it's the kind of small thing people notice.",
  "Secure content":
    "Some files on the page load insecurely, so browsers may block them and parts of the page can break.",
  Sitemap:
    "There's no sitemap, so Google has to find your pages the long way round instead of being handed a list.",
  "Robots file":
    "There's no robots file telling search engines how to go through the site.",
};

/**
 * A finding as a sentence in an email.
 *
 * Anything not in the map falls back to the audit's own wording with its
 * label in front, which is how it read before — not elegant, but a new check
 * shipping to the report must never put a blank bullet in an email.
 */
export function outreachLine(finding: ProspectFinding): string {
  return LINES[finding.label] ?? `${finding.label}: ${finding.why}`;
}

/**
 * What we do, in one line, taken from the services pages so it cannot say one
 * thing in an email and another on the site.
 */
export function servicesLine(): string {
  const names = services.map((s) => s.name);
  if (names.length === 0) return "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
