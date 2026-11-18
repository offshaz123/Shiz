/**
 * Can this domain receive email at all?
 *
 * Added after the first real sending day. Eight first emails went out and
 * two bounced, both with the same reason: "no MX record, implicit MX failed
 * to connect". Both businesses publish an address on their own website and
 * neither domain has a mail server behind it.
 *
 * Two bounces out of eight is a quarter, and bounce rate is one of the few
 * things mailbox providers read directly as a spam signal. On a domain that
 * also carries the client work and the enquiry replies, that is not a
 * rounding error to accept while the daily volume climbs to fifteen.
 *
 * Resolved over HTTPS rather than with node:dns, which is the whole reason
 * this file is worth reading twice. The first version used dns.resolveMx
 * and, tested against the eight addresses from that morning's send, it
 * returned "no mail server" for all eight — including the six that had
 * demonstrably been delivered. The resolver was simply unavailable, the
 * rejection was being caught as a negative answer, and shipping it would
 * have quietly stripped the address off every prospect scanned and emptied
 * the email list without a single error anywhere.
 *
 * So: a resolver that is known to work from this server, and a rule that
 * only a clear answer counts. Anything else is treated as "do not know",
 * and the address is kept.
 *
 * What it deliberately does NOT do is verify the mailbox exists. That needs
 * an SMTP conversation with the receiving server, which is slow, frequently
 * blocked, and read as probing by exactly the spam filters we are trying to
 * stay on the right side of. A missing MX record is the cheap, certain half
 * of the problem, and it is the half that produced both of these bounces.
 */

/** Short: this runs inside a scan batch that is already making HTTP
 *  requests, and a slow lookup must not hold up the queue. */
const TIMEOUT_MS = 4000;

/** Scans arrive in batches and several businesses in one town often share a
 *  host, so the same domain gets asked about repeatedly within one run. */
const cache = new Map<string, boolean>();

/** DNS status codes: 0 is NOERROR, 3 is NXDOMAIN. Only these two are an
 *  answer; anything else means the question was not resolved. */
const NOERROR = 0;
const NXDOMAIN = 3;

export function domainOf(email: string): string {
  const at = email.lastIndexOf("@");
  if (at === -1) return "";
  const domain = email.slice(at + 1).trim().toLowerCase();
  return domain.includes(".") ? domain : "";
}

export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = domainOf(email);
  if (!domain) return false;

  const cached = cache.get(domain);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`,
      { headers: { accept: "application/dns-json" }, signal: controller.signal },
    );
    // Not an answer about the domain, an answer about the resolver. Keep the
    // address and do not remember anything.
    if (!res.ok) return true;

    const data: unknown = await res.json();
    const body = data as { Status?: number; Answer?: { type?: number }[] };
    if (body.Status !== NOERROR && body.Status !== NXDOMAIN) return true;

    // MX records are type 15. A NOERROR with no MX answer is a real "this
    // domain publishes no mail server", which is the case that bounced.
    const accepts = (body.Answer ?? []).some((a) => a.type === 15);
    cache.set(domain, accepts);
    return accepts;
  } catch {
    // Aborted, offline, blocked. Not evidence about the domain.
    return true;
  } finally {
    clearTimeout(timer);
  }
}
