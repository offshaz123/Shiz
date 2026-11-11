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

export const AUDIT_UA =
  "Mozilla/5.0 (compatible; ShazMarketingAudit/1.0; +https://shazmarketing.com/free-audit)";

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
 * unsupported_port, dns_failed, too_many_redirects, or an abort.
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
    const [robots, sitemap] = await Promise.all([
      exists(finalUrl, "/robots.txt", controller.signal),
      exists(finalUrl, "/sitemap.xml", controller.signal),
    ]);

    return { html, finalUrl: finalUrl.toString(), robots, sitemap, ms };
  } finally {
    clearTimeout(timer);
  }
}
