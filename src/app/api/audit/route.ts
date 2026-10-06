import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { runChecks, scoreChecks, type AuditResult } from "@/lib/site-audit";

export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;
const UA =
  "Mozilla/5.0 (compatible; ShazMarketingAudit/1.0; +https://shazmarketing.com/free-audit)";

/**
 * This endpoint fetches a URL chosen by whoever is using the form, which makes
 * it a server-side request forgery risk if left open: someone could point it at
 * an internal address or a cloud metadata endpoint and read the response back
 * out of the results. So every hostname is resolved and checked against the
 * private ranges before anything is fetched, and every redirect is re-checked.
 */
function isBlockedAddress(ip: string): boolean {
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

async function assertSafe(target: URL) {
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
async function safeFetch(start: URL, signal: AbortSignal) {
  let current = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertSafe(current);
    const res = await fetch(current, {
      redirect: "manual",
      signal,
      headers: { "user-agent": UA, accept: "text/html,*/*" },
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
async function readCapped(res: Response): Promise<string> {
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

async function exists(base: URL, path: string, signal: AbortSignal) {
  try {
    const target = new URL(path, base);
    await assertSafe(target);
    const res = await fetch(target, {
      signal,
      headers: { "user-agent": UA },
      redirect: "follow",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const raw = typeof body?.url === "string" ? body.url.trim() : "";
  if (!raw || raw.length > 2048) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }
  // A hostname with no dot is either a local machine name or a typo.
  if (!target.hostname.includes(".")) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const started = Date.now();
    const { res, finalUrl } = await safeFetch(target, controller.signal);
    const ms = Date.now() - started;

    if (!res.ok) {
      return NextResponse.json(
        { error: "unreachable", status: res.status },
        { status: 422 }
      );
    }

    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html")) {
      return NextResponse.json({ error: "not_html" }, { status: 422 });
    }

    const html = await readCapped(res);
    const [robots, sitemap] = await Promise.all([
      exists(finalUrl, "/robots.txt", controller.signal),
      exists(finalUrl, "/sitemap.xml", controller.signal),
    ]);

    const checks = runChecks(html, finalUrl.toString(), { robots, sitemap, ms });
    const { counts, score } = scoreChecks(checks);

    const result: AuditResult = {
      url: target.toString(),
      finalUrl: finalUrl.toString(),
      checks,
      score,
      counts,
    };
    return NextResponse.json(result);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "failed";
    const status = reason === "blocked_address" || reason === "unsupported_port" ? 400 : 422;
    return NextResponse.json({ error: reason }, { status });
  } finally {
    clearTimeout(timer);
  }
}
