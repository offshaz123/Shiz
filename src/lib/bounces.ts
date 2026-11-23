/**
 * Reading a bounce message and working out which address is dead.
 *
 * Its own module with no imports, so it can be tested against real bounce
 * messages without a mailbox.
 *
 * Why this exists: on 23 November the mail server's own logs showed 81
 * outbound emails over seven days, of which three hard bounced and six more
 * went to domains with no mail server at all. The system knew about none of
 * it. A send-time refusal is caught and recorded, but a bounce that arrives
 * afterwards comes back from MAILER-DAEMON rather than from the business, so
 * the reply check walked straight past it, the sequence kept going, and the
 * business then appeared on the call list labelled "three emails, no reply".
 *
 * That label is a lie that costs a phone call: "they ignored three emails"
 * and "their published email address does not work" are opposite openings.
 * The second one is a reason to ring, and a thing worth telling them.
 *
 * What counts as dead is deliberately narrow. A 5.x.x status means the
 * receiving server has refused permanently; a 4.x.x is a delay and may well
 * deliver on the next attempt. Treating a delay as a dead address would
 * quietly empty the email list, which is the same failure mx-check.ts was
 * written to avoid, so only a clear permanent failure counts here.
 */

/** A permanently failed delivery, read out of one bounce message. */
export type DeadAddress = {
  /** The address that failed, lowercased. */
  email: string;
  /** The server's own words, trimmed, for showing somebody why. */
  reason: string;
};

/**
 * Does this look like it came from a mail system rather than a person?
 *
 * Matched on the local part and on the bounce subdomains the big hosts use.
 * Hostinger's own bounces arrive from mailer-daemon@bounce.mail.hostinger.com.
 */
export function isBounceSender(address: string): boolean {
  const from = address.trim().toLowerCase();
  if (!from.includes("@")) return false;
  const [local, domain] = [from.slice(0, from.indexOf("@")), from.slice(from.indexOf("@") + 1)];
  if (/^(mailer-daemon|postmaster|mail-daemon|bounce|bounces|no-reply-bounce)$/.test(local)) {
    return true;
  }
  return /^bounce[sd]?\./.test(domain);
}

/** Subjects mail systems give their own failure reports. */
const BOUNCE_SUBJECT =
  /(undelivered mail|returned to sender|delivery status notification|mail delivery (failed|subsystem)|undeliverable|failure notice|delivery has failed)/i;

/**
 * Worth opening and reading as a bounce?
 *
 * Either test passing is enough. Some systems send from a real-looking
 * address with an unmistakable subject, and some do the reverse, so an
 * envelope that fails both is left alone rather than downloaded.
 */
export function looksLikeBounce(from: string, subject: string): boolean {
  return isBounceSender(from) || BOUNCE_SUBJECT.test(subject || "");
}

/** Strips the angle brackets and routing an address arrives wrapped in. */
function tidyAddress(raw: string): string {
  const inner = raw.trim().replace(/^<|>$/g, "").trim();
  // "rfc822;" prefixes and source routes ("@a.com:user@b.com") both appear.
  const afterColon = inner.includes(":") ? inner.slice(inner.lastIndexOf(":") + 1) : inner;
  return afterColon.trim().toLowerCase();
}

/** One line of the server's explanation, short enough to put on a row. */
function tidyReason(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/^\s*(smtp;\s*)?/i, "")
    .trim()
    .slice(0, 180);
}

/**
 * Pulls every permanently-failed address out of one bounce message.
 *
 * Reads the machine-readable part rather than the human sentence at the top,
 * because the sentence is written differently by every mail system while
 * RFC 3464's Final-Recipient / Action / Status fields are not. A message can
 * report several recipients, each in its own block, and a single bounce
 * covering two addresses where one succeeded is a real shape — so the fields
 * are read per block rather than per message.
 *
 * Returns an empty list for a delay, for a message that is not a bounce at
 * all, and for anything it cannot read with confidence. Guessing here marks
 * a live address dead and silently stops writing to a real business.
 */
export function parseBounce(source: string): DeadAddress[] {
  const text = source.replace(/\r\n/g, "\n");

  // Unfold continued header lines (a leading space means "still the previous
  // field"), or a Diagnostic-Code wrapped over three lines reads as three.
  const unfolded = text.replace(/\n[ \t]+/g, " ");

  // Split into per-recipient blocks. Everything before the first
  // Final-Recipient is the covering note and the original headers.
  const blocks = unfolded.split(/\n(?=Final-Recipient:)/i).slice(1);

  const dead = new Map<string, string>();

  for (const block of blocks) {
    const recipient = /^Final-Recipient:\s*(?:rfc822\s*;)?\s*([^\n]+)/i.exec(block);
    if (!recipient) continue;

    const email = tidyAddress(recipient[1]);
    // A bare domain or a mangled line is not an address to act on.
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,24}$/.test(email)) continue;

    const action = /^Action:\s*([a-z-]+)/im.exec(block)?.[1]?.toLowerCase();
    const status = /^Status:\s*(\d)\.(\d+)\.(\d+)/im.exec(block);
    const diagnostic = /^Diagnostic-Code:\s*([^\n]+)/im.exec(block)?.[1] ?? "";

    // Both have to agree that it is over. "failed" with a 4.x.x status is a
    // mail system that has given up for now and will try again.
    if (action !== "failed") continue;
    if (!status || status[1] !== "5") continue;

    const code = `${status[1]}.${status[2]}.${status[3]}`;
    dead.set(email, tidyReason(diagnostic) || `Permanent failure ${code}`);
  }

  return [...dead].map(([email, reason]) => ({ email, reason }));
}
