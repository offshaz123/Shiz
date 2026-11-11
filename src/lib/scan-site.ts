import { lookup } from "node:dns/promises";

/**
 * Fetching an arbitrary website safely, so the scanner can be pointed at a
 * URL somebody else chose.
 *
 * This lived inside the /api/audit route until the prospect finder needed the
 * same thing. It is extracted rather than copied because the protection below
 * is the part that must never drift: two copies of an SSRF guard is one copy
 * that eventually stops matching the other.
 */

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/**
 * Who we say we are when we fetch somebody's site.
 *
 * Still an honest identification — the name of the tool and a page that
 * explains it — but without the "Mozilla/5.0 (compatible; ...)" wrapper it
 * used to carry. That prefix is the classic signature of a crawler dressed
 * as a browser, and firewalls match on it.
 *
 * Found on a real prospect: car-recovery-services.co.uk answered 502 to the
 * old string and 200 to this one, at the same moment, from the same machine.
 * Their site was working perfectly; the call list said "site wouldn't load",
 * and we would have rung them to discuss a problem that was ours.
 *
 * Deliberately not a browser's user agent. We are a tool fetching a page on
 * behalf of a business that may be about to write to them, and saying so is
 * the right default. A site that blocks us when we are named has made a
 * choice we should respect rather than work around.
 */
export const AUDIT_UA = "ShazMarketingAudit/1.0 (+https://shazmarketing.com/free-audit)";

/**
 * Blocks anything that is not a public address. Without this, whoever can
 * reach the form can point it at an internal service or a cloud metadata
 * endpoint and read the answer back out of the report.
 */
export function isBlockedAddress(ip: string): boolean {
  // IPv4-mapped IPv6, e.g. ::ffff:127.0.0.1
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) return isBlockedAddress(mapped[1]);

  if (ip.includes(":")) {
    const v6 = ip.toLowerCase();
    if (v6 === "::1" || v6 === "::") return true;
    const head = parseInt(v6.split(":")[0] || "0", 16);
    if ((head & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((head & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
    return false;
  }

  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;

  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link local, incl. cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // carrier NAT
  if (a >= 224) return true; // multicast and reserved
  return false;
}

export async function assertSafe(target: URL): Promise<void> {
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("unsupported_protocol");
  }
  if (target.port && !["80", "443", ""].includes(target.port)) {
    throw new Error("unsupported_port");
  }
  const resolved = await lookup(target.hostname, { all: true }).catch(() => []);
  if (resolved.length === 0) throw new Error("dns_failed");
  if (resolved.some((r) => isBlockedAddress(r.address))) {
    throw new Error("blocked_address");
  }
}

/** Follows redirects by hand so each hop gets the same safety check. */
export async function safeFetch(start: URL, signal: AbortSignal) {
  let current = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertSafe(current);
    const res = await fetch(current, {
      redirect: "manual",
      signal,
      headers: { "user-agent": AUDIT_UA, accept: "text/html,*/*" },
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current);
      continue;
    }
    return { res, finalUrl: current };
  }
  throw new Error("too_many_redirects");
}

/** Reads at most MAX_BYTES so a huge page can't exhaust memory. */
export async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    chunks.push(value);
    if (total >= MAX_BYTES) {
      await reader.cancel().catch(() => {});
      break;
    }
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(
    chunks.length === 1 ? chunks[0] : Buffer.concat(chunks)
  );
}

export async function exists(base: URL, path: string, signal: AbortSignal): Promise<boolean> {
  try {
    const target = new URL(path, base);
    await assertSafe(target);
    const res = await fetch(target, {
      signal,
      headers: { "user-agent": AUDIT_UA },
      redirect: "follow",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Turns whatever someone typed into a URL, or returns null. */
export function parseTarget(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  // A hostname with no dot is either a local machine name or a typo.
  if (!target.hostname.includes(".")) return null;
  return target;
}

/**
 * One more page off the same site, as HTML, or "" if it will not come.
 *
 * Used to go and look at a contact page when the homepage has no address on
 * it. Deliberately returns a string rather than throwing: a contact page that
 * 404s or is not HTML is an ordinary outcome of guessing at a URL, not an
 * error worth stopping a scan for.
 *
 * Goes through safeFetch like everything else, so the private-address check
 * applies to it and to each redirect it follows. A page we chose by reading a
 * link off somebody else's site is exactly the case that check exists for.
 */
export async function fetchExtraPage(target: URL, signal: AbortSignal): Promise<string> {
  try {
    const { res } = await safeFetch(target, signal);
    if (!res.ok) return "";
    if (!(res.headers.get("content-type") ?? "").includes("html")) return "";
    return await readCapped(res);
  } catch {
    return "";
  }
}

/**
 * Pages that are not the site: a bot challenge wearing a 200.
 *
 * Found on a real prospect. SiteGround answered our scanner with 167 bytes —
 * a meta refresh to /.well-known/sgcaptcha/ — and nothing about that response
 * says "error". The audit read it as the business's homepage, scored it 4.1,
 * and reported no Meta Pixel, no Analytics and no retargeting. Every one of
 * those findings was about a captcha stub, and any of them could have gone
 * into an email telling a business what was wrong with a website we had
 * never actually seen.
 *
 * That is the failure that matters here. A scan we cannot do is a minor
 * inconvenience; a scan that invents faults is a false accusation sent to a
 * stranger under Walid's name.
 *
 * Detected and refused, never worked around. These challenges exist because
 * the site's owner wants automated traffic to stop, and that is an answer we
 * take rather than one we get past.
 */
const CHALLENGE_SIGNALS = [
  "sgcaptcha",
  "cf-browser-verification",
  "cf_chl_opt",
  "challenge-platform",
  "checking your browser before",
  "enable javascript and cookies to continue",
  "ddos protection by",
  "__cf_bm",
  "incapsula incident id",
  "please verify you are a human",
];

export function isChallengePage(html: string): boolean {
  const lower = html.toLowerCase();
  if (CHALLENGE_SIGNALS.some((signal) => lower.includes(signal))) return true;

  // The shape of one, for the hosts we have not met yet: a tiny document
  // whose only instruction is to go somewhere else immediately. A real page
  // that redirects does so with content behind it; this has none.
  if (html.length < 2000 && /<meta[^>]+http-equiv=["']?refresh/i.test(html)) {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .trim();
    if (text.length < 120) return true;
  }

  return false;
}

export type FetchedPage = {
  html: string;
  finalUrl: string;
  robots: boolean;
  sitemap: boolean;
  ms: number;
};

/**
 * Everything buildReport needs about a site, with the Google lookup left to
 * the caller. The free-audit form wants it; the prospect scanner already has
 * the listing from the Places search and would only be paying twice.
 *
 * Throws a coded Error: invalid_url, unreachable, not_html, blocked_address,
 * unsupported_port, dns_failed, too_many_redirects, blocked_by_site, or an
 * abort.
 */
export async function fetchForAudit(raw: string, timeoutMs = 12_000): Promise<FetchedPage> {
  const target = parseTarget(raw);
  if (!target) throw new Error("invalid_url");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const started = Date.now();
    const { res, finalUrl } = await safeFetch(target, controller.signal);
    const ms = Date.now() - started;

    if (!res.ok) throw new Error("unreachable");

    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) throw new Error("not_html");

    const html = await readCapped(res);
    // Before anything is measured. A challenge page scores like a very bad
    // website, which is exactly how this went unnoticed.
    if (isChallengePage(html)) throw new Error("blocked_by_site");
    const [robots, sitemap] = await Promise.all([
      exists(finalUrl, "/robots.txt", controller.signal),
      exists(finalUrl, "/sitemap.xml", controller.signal),
    ]);

    return { html, finalUrl: finalUrl.toString(), robots, sitemap, ms };
  } finally {
    clearTimeout(timer);
  }
}
