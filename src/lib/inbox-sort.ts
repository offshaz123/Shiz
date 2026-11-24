/**
 * Sorting what arrives in the inbox into the three things it actually is.
 *
 * Its own module with no imports, so it can be tested against real
 * messages without a mailbox.
 *
 * The inbox of a business that sends cold email is mostly not replies.
 * A month of the real one held 113 messages: nine bounce reports, sixteen
 * DMARC reports from Google, Microsoft and Yahoo, a steady drip from
 * TikTok, Trustpilot and Clutch, a pile of cold email aimed back at us,
 * and a handful of actual replies. Showing those as one list and calling
 * it an inbox buries the only part that matters.
 *
 * So: a reply from a person goes first, a bounce goes in its own pile
 * because it is a job rather than a conversation, and the machinery goes
 * somewhere you can still look but do not have to.
 *
 * The rule that matters most is the one about not losing a real reply.
 * Everything here is biased that way: anything that could be a person is
 * treated as one, and only things that announce themselves as automated
 * are moved out of the way.
 */

export type Folder = "reply" | "bounced" | "other";

export type Envelope = {
  from: string;
  fromName?: string;
  subject: string;
  /** Headers, lowercased keys. Empty when they could not be fetched. */
  headers?: Record<string, string>;
  /** True when the sender matches a business we have written to. */
  known?: boolean;
};

/** Mail systems reporting a failure. */
const DAEMON_LOCAL = /^(mailer-daemon|postmaster|mail-daemon|bounce|bounces|no-reply-bounce)$/;

const BOUNCE_SUBJECT =
  /(undelivered mail|returned to sender|delivery status notification|mail delivery (failed|subsystem)|undeliverable|failure notice|delivery has failed)/i;

/**
 * Senders that are machines talking to machines.
 *
 * Deliberately a list of exact things rather than a clever rule. Every
 * entry is something seen in the real inbox, and a rule loose enough to
 * catch them all in one go would eventually catch a plumber.
 */
const NOISE_LOCAL = /^(no-?reply|donotreply|do-not-reply|notifications?|news|newsletter|mailer|automated|alerts?|dmarc|dmarcreport|dmarc-?report|abuse|support)$/;

/** Report addresses the big mailbox providers send DMARC data from. */
const DMARC_HINT = /(dmarc|rua@|report@|reports@)/i;

/** Hosts that only ever send us machine mail. */
const NOISE_HOST =
  /(^|\.)(dmarc\.yahoo\.com|secureserver\.net|notify\.clutch\.co|post\.trustpilot\.com|service\.tiktok\.com|i\.service\.tiktok\.com|em\d+\.(i\.)?service\.tiktok\.com|sendgrid\.net|mailchimp\.com|amazonses\.com)$/i;

function split(address: string): { local: string; host: string } {
  const at = address.lastIndexOf("@");
  if (at < 0) return { local: address.toLowerCase(), host: "" };
  return {
    local: address.slice(0, at).toLowerCase(),
    host: address.slice(at + 1).toLowerCase(),
  };
}

/** A failure report from a mail system rather than a message from anyone. */
export function isBounce(envelope: Envelope): boolean {
  const { local, host } = split(envelope.from.trim().toLowerCase());
  if (DAEMON_LOCAL.test(local)) return true;
  if (/^bounce[sd]?\./.test(host)) return true;
  return BOUNCE_SUBJECT.test(envelope.subject || "");
}

/**
 * Sent by a machine, to a list, or about the mail system rather than
 * about anything we do.
 *
 * Checks the headers first where there are any. List-Unsubscribe,
 * Precedence: bulk and Auto-Submitted are how a sender declares itself
 * automated, and a declaration beats a guess about its address.
 */
export function isNoise(envelope: Envelope): boolean {
  const headers = envelope.headers ?? {};

  // A real person's reply does not carry these.
  if (headers["list-unsubscribe"] || headers["list-id"]) return true;
  if (/bulk|list|junk/i.test(headers["precedence"] ?? "")) return true;
  const auto = headers["auto-submitted"] ?? "";
  if (auto && auto.toLowerCase() !== "no") return true;

  const { local, host } = split(envelope.from.trim().toLowerCase());
  if (NOISE_LOCAL.test(local)) return true;
  if (NOISE_HOST.test(host)) return true;
  if (DMARC_HINT.test(local) || DMARC_HINT.test(envelope.subject || "")) return true;

  // "bounces+12345-abc=us@..." is a bulk sender's return path being used
  // as a From, which is a mailing platform and not a person.
  if (/^bounces?\+/.test(local)) return true;

  return false;
}

/**
 * Which pile a message belongs in.
 *
 * Order matters. A bounce from a mail system would also read as noise,
 * and a bounce is the one that has a job attached to it, so it is tested
 * first. A business we have written to is treated as a person whatever
 * else their mail looks like: that is the message we cannot afford to
 * put in a folder nobody opens.
 */
export function classify(envelope: Envelope): Folder {
  if (isBounce(envelope)) return "bounced";
  if (envelope.known) return "reply";
  if (isNoise(envelope)) return "other";

  // A reply to something we sent. In-Reply-To is the honest signal; the
  // subject prefix is the fallback for clients that drop it.
  const headers = envelope.headers ?? {};
  if (headers["in-reply-to"] || headers["references"]) return "reply";
  if (/^\s*(re|aw|sv|antw)\s*:/i.test(envelope.subject || "")) return "reply";

  // Everything left is a stranger writing to us out of the blue. Most of
  // it is other agencies cold-emailing back, but some of it is somebody
  // who found the website, so it stays where it will be seen.
  return "reply";
}

/**
 * The first few lines of what they actually said.
 *
 * Takes a whole raw message and gives back something readable: the text
 * part rather than the HTML one where there is a choice, with the quoted
 * copy of our own email underneath it removed, because every reply
 * carries one and it is never the part you want to read.
 */
export function extractReplyText(source: string, limit = 400): string {
  const text = source.replace(/\r\n/g, "\n");

  // Prefer a text/plain part. A multipart message carries both, and the
  // HTML one turns into tag soup when the tags come out.
  let body = "";
  const parts = text.split(/\n--[^\n-][^\n]*\n/);
  for (const part of parts) {
    if (/^content-type:\s*text\/plain/im.test(part)) {
      body = part.slice(part.indexOf("\n\n") + 2);
      break;
    }
  }
  if (!body) {
    const blank = text.indexOf("\n\n");
    body = blank >= 0 ? text.slice(blank + 2) : text;
  }

  // Quoted-printable turns up in plenty of replies and is unreadable raw.
  //
  // Decoded through percent-encoding rather than character by character.
  // "=E2=80=94" is one em dash written as three UTF-8 bytes, and turning
  // each byte into a character gives "â\u0080\u0094" — which is how
  // mangled text gets into a page and stays there.
  body = body.replace(/=\n/g, "");
  if (/=[0-9A-Fa-f]{2}/.test(body)) {
    try {
      body = decodeURIComponent(
        body.replace(/%/g, "%25").replace(/=([0-9A-Fa-f]{2})/g, "%$1"),
      );
    } catch {
      // Not valid quoted-printable after all. Better the raw text than
      // nothing: a reply shown awkwardly still reads, a reply swallowed
      // by a decoder does not.
    }
  }

  // Strip HTML if that is all there was.
  if (/<\/?(p|div|br|html|body)\b/i.test(body)) {
    body = body
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  const lines: string[] = [];
  for (const raw of body.split("\n")) {
    const line = raw.trim();
    // The quoted original, and the line introducing it.
    if (line.startsWith(">")) break;
    if (/^on .+ wrote:$/i.test(line)) break;
    if (/^-{2,}\s*original message\s*-{2,}$/i.test(line)) break;
    if (/^from:\s/i.test(line) && lines.length > 0) break;
    lines.push(line);
  }

  return lines
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}
