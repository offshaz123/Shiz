import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Talking to the phone system.
 *
 * Two directions. We ask it to place a call, and it tells us what
 * happened — which is the half that matters, because it turns "did he
 * actually ring anybody today" from a question into a record.
 *
 * Zadarma's signature scheme is unusual enough to be worth writing down
 * rather than discovering twice: the parameters are sorted by key, built
 * into a query string, and the signed text is the method path, then that
 * query string, then the md5 of that query string, all concatenated. That
 * is then HMAC-SHA1'd with the secret and base64'd. Getting any part of
 * that order wrong gives a signature that fails with no explanation.
 */

const BASE = "https://api.zadarma.com";

function keys(): { key: string; secret: string } | null {
  const key = process.env.ZADARMA_KEY;
  const secret = process.env.ZADARMA_SECRET;
  // A missing key is a feature that is not switched on, not an error.
  // Everything here returns null and the pages say the phone system is
  // not connected rather than throwing on a page nobody could fix.
  return key && secret ? { key, secret } : null;
}

export function isConnected(): boolean {
  return keys() !== null;
}

/** Sorted, URL-encoded, exactly as their signature expects. */
function queryString(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((name) => `${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`)
    .join("&");
}

export function sign(method: string, params: Record<string, string>, secret: string): string {
  const query = queryString(params);
  const payload = `${method}${query}${createHash("md5").update(query).digest("hex")}`;
  return createHmac("sha1", secret).update(payload).digest("base64");
}

/**
 * One signed GET against their API.
 *
 * Never throws. Every caller is either a page being rendered or a button
 * somebody pressed, and neither should break because a phone system is
 * having an afternoon.
 */
async function call<T>(method: string, params: Record<string, string> = {}): Promise<T | null> {
  const auth = keys();
  if (!auth) return null;

  const query = queryString(params);
  try {
    const res = await fetch(`${BASE}${method}${query ? `?${query}` : ""}`, {
      headers: { Authorization: `${auth.key}: ${sign(method, params, auth.secret)}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`Zadarma ${method}: ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`Zadarma ${method}:`, err);
    return null;
  }
}

/**
 * Rings the agent, then rings the business, then joins them.
 *
 * `from` is the agent's extension, `to` is the business. The optional
 * `sip` decides whose number shows on the business's phone, which is the
 * whole reason for buying a London number and an American one.
 */
export async function placeCall(
  agentExtension: string,
  prospectNumber: string,
  callerId?: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isConnected()) return { ok: false, reason: "not_connected" };

  const params: Record<string, string> = { from: agentExtension, to: prospectNumber };
  if (callerId) params.sip = callerId;

  const result = await call<{ status: string; message?: string }>("/v1/request/callback/", params);
  if (!result) return { ok: false, reason: "no_answer_from_phone_system" };
  return result.status === "success"
    ? { ok: true }
    : { ok: false, reason: result.message ?? "refused" };
}

/**
 * A temporary link to a recording.
 *
 * Fetched when somebody asks to hear it rather than stored, because the
 * links expire — storing one would mean a row full of addresses that
 * stopped working half an hour after they were written.
 */
export async function recordingLink(callId: string): Promise<string | null> {
  const result = await call<{ status: string; link?: string; links?: string[] }>(
    "/v1/pbx/record/request/",
    { call_id: callId, lifetime: "1800" },
  );
  if (!result || result.status !== "success") return null;
  return result.link ?? result.links?.[0] ?? null;
}

/* ------------------------------------------------------- what they tell us */

/**
 * Checks that a webhook really came from the phone system.
 *
 * This endpoint is a public address that writes to the call log. Without
 * this check, anybody who found it could post a hundred calls that never
 * happened into somebody's record — which is precisely the record Walid
 * wants to be able to trust.
 *
 * Compared in constant time, because a check that leaks how much of the
 * signature was right is a check that can be guessed at.
 */
export function signatureMatches(body: string, header: string | null): boolean {
  const auth = keys();
  if (!auth || !header) return false;

  const expected = createHmac("sha1", auth.secret).update(body).digest("base64");
  const given = Buffer.from(header.trim());
  const mine = Buffer.from(expected);
  if (given.length !== mine.length) return false;
  return timingSafeEqual(given, mine);
}

/** What their end-of-call notification carries that we use. */
export type CallEnded = {
  /** Our extension, which tells us which agent made it. */
  internal: string;
  /** The number that was dialled. */
  destination: string;
  /** Seconds of actual conversation. 0 when nobody picked up. */
  seconds: number;
  /** answered, busy, "no answer", cancel, failed, and so on. */
  disposition: string;
  startedAt: string;
  /** Present when there is a recording to fetch later. */
  recordingId: string;
};

/**
 * Reads an end-of-call notification.
 *
 * Returns null for anything that is not an outgoing call that has
 * finished. The same URL receives six kinds of event and five of them
 * are not this one.
 */
export function readCallEnded(form: Record<string, string>): CallEnded | null {
  if (form.event !== "NOTIFY_OUT_END") return null;

  const destination = form.destination ?? "";
  if (!destination) return null;

  return {
    internal: form.internal ?? "",
    destination,
    seconds: Number(form.duration ?? 0) || 0,
    disposition: (form.disposition ?? "").toLowerCase(),
    startedAt: form.call_start ?? "",
    recordingId: form.is_recorded === "true" ? (form.call_id_with_rec ?? "") : "",
  };
}

/**
 * How the call went, in the words the call list already uses.
 *
 * Mapped rather than stored raw so the automatic rows and the ones a
 * person logs by hand read the same. A list where half the outcomes say
 * "no answer" and half say "NOANSWER" is a list nobody can filter.
 */
export function outcomeFor(disposition: string, seconds: number): string {
  if (disposition === "answered") {
    // Under twenty seconds is somebody picking up and putting it down,
    // or a switchboard. Calling that "spoke to them" would overstate
    // every day's work, and this record is only worth having if it does
    // not do that.
    return seconds >= 20 ? "spoke" : "no-answer";
  }
  if (disposition === "busy") return "no-answer";
  if (disposition === "cancel" || disposition === "no answer") return "no-answer";
  return "no-answer";
}
