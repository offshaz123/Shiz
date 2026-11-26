/**
 * The same typed note, as HTML, so the link in it is a link.
 *
 * These emails are plain text on purpose: a one-to-one note about
 * somebody's website should look like one, and an HTML template wrapped
 * around four sentences reads as a mailshot to the recipient and to the
 * filters alike. That has not changed.
 *
 * What has changed is that the first email now has a web address in it.
 * In plain text, whether that address is clickable is up to the mail
 * program: phones turn it into a link, Outlook on a desktop often does
 * not, and the result was Walid watching somebody have to select a URL
 * and copy it into a browser. A link nobody can press is not a link.
 *
 * So the message now carries both parts. The text part is unchanged and
 * is what most people will see. The HTML part is the same words, in the
 * same order, with no template, no images, no tables, no fonts and no
 * colours — a plain block of text in whatever the reader's client uses
 * for everything else, with the address wrapped in an anchor. Any client
 * showing the HTML part sees what the text part says, and the link works.
 *
 * Its own module, with no imports, because it is a pure transformation
 * on a string and the thing it must never do — let anything in the body
 * become markup — is worth testing directly.
 */

/**
 * Where a URL in the text stops.
 *
 * The trailing class deliberately excludes the characters that end an
 * English sentence, so "have a look: https://example.com/x." links the
 * address and leaves the full stop as a full stop. Brackets and quotes
 * go the same way.
 */
const URL_IN_TEXT = /https?:\/\/[^\s<>"']*[^\s<>"'.,;:!?)\]}]/g;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Turns the plain body into the HTML alternative.
 *
 * Escaping happens first and linking second, which is the only safe order:
 * the anchor this adds is the one piece of markup in the output, and
 * everything that came in is text by the time it is added.
 */
export function plainToHtml(text: string): string {
  const safe = escapeHtml(text);
  const linked = safe.replace(URL_IN_TEXT, (url) => `<a href="${url}">${url}</a>`);
  const body = linked.replace(/\r?\n/g, "<br>\n");
  // white-space:pre-wrap keeps the blank lines between paragraphs doing
  // what they do in the text version, without a stylesheet or a single
  // wrapper that would make this look designed.
  return `<div style="white-space:pre-wrap;word-break:break-word">${body}</div>`;
}
