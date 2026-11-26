import { createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "./site-config";

/**
 * Their photographs, served through us.
 *
 * A rebuilt page points at the business's own image files, on their own
 * server. That is the honest arrangement — we are showing them their
 * pictures, not taking them — and most of the time it works.
 *
 * It fails in one common way. A good many hosts and CDNs serve images
 * only to pages on their own domain and answer everybody else with 403.
 * It is called hotlink protection, it is switched on by default on
 * several popular hosts, and the result on our page is a row of empty
 * frames, which looks like we built something broken.
 *
 * So the page asks our server for the picture and our server asks
 * theirs, with their own site named as the referer, which is what their
 * CDN is checking. Nothing is stored: the bytes pass straight through
 * and the answer carries a long cache header, so the viewer's browser
 * keeps it rather than us keeping it. That holds to the same promise
 * the rest of this makes — we hold nothing of theirs after the week is
 * up, because we never held it in the first place.
 *
 * Signed, and this is not optional. An image proxy anybody can put a
 * URL into is an open relay: it will be found, it will be used to fetch
 * things our server can reach and the internet cannot, and the
 * bandwidth bill is ours. Every address is signed with the same secret
 * the unsubscribe links use, and an unsigned or edited one is refused
 * before any request leaves this machine.
 */

function secret(): string | null {
  const value = process.env.CRON_SECRET;
  return value && value.length >= 16 ? value : null;
}

function sign(url: string, key: string): string {
  return createHmac("sha256", key).update(`preview-image:${url}`).digest("hex").slice(0, 32);
}

/**
 * Is this an address we are willing to fetch at all?
 *
 * Only ordinary web addresses, and nothing that points back inside our
 * own network. A signature stops a stranger choosing the address, but
 * the check is cheap and the thing it prevents — our server being used
 * to read something only our server can reach — is the expensive one.
 */
export function fetchable(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return false;
  // Addresses written as numbers, where a name would normally be: the
  // private ranges, loopback, and the link-local address cloud
  // providers put their credentials behind.
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  if (host === "::1" || host.startsWith("[")) return false;
  return true;
}

/** The address the rebuilt page asks for, in place of theirs. */
export function throughUs(imageUrl: string): string {
  const key = secret();
  // With nothing to sign with, the page points straight at their file.
  // Worse against hotlink protection, and better than no picture.
  if (!key || !fetchable(imageUrl)) return imageUrl;
  return `${siteConfig.url}/preview/image?u=${encodeURIComponent(imageUrl)}&s=${sign(imageUrl, key)}`;
}

/** Was this address signed by us, and not edited since? */
export function signedByUs(imageUrl: string, signature: string): boolean {
  const key = secret();
  if (!key || !signature) return false;
  const want = Buffer.from(sign(imageUrl, key));
  const got = Buffer.from(signature);
  // Compared in constant time, so the comparison itself cannot be used
  // to work the signature out one character at a time.
  return want.length === got.length && timingSafeEqual(want, got);
}
