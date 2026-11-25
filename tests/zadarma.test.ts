import { test } from "node:test";
import assert from "node:assert/strict";
import { outcomeFor, readCallEnded, sign } from "../src/lib/zadarma.ts";

/**
 * The webhook writes to the call log, which is the record Walid wants to
 * be able to trust. These are the pieces that decide what goes into it.
 */

test("the signature follows their scheme exactly", () => {
  // Order matters and is easy to get wrong silently: parameters sorted by
  // key, then path + query + md5(query), HMAC-SHA1, base64.
  const made = sign("/v1/request/callback/", { to: "441234", from: "100" }, "secret");
  assert.equal(typeof made, "string");
  assert.ok(made.length > 20);

  // Sorting means the parameter order given to us cannot change it.
  assert.equal(
    sign("/v1/request/callback/", { from: "100", to: "441234" }, "secret"),
    made,
  );
  // Everything else must change it.
  assert.notEqual(sign("/v1/request/callback/", { from: "101", to: "441234" }, "secret"), made);
  assert.notEqual(sign("/v1/other/", { to: "441234", from: "100" }, "secret"), made);
  assert.notEqual(sign("/v1/request/callback/", { to: "441234", from: "100" }, "other"), made);
});

test("only a finished outgoing call is read", () => {
  // The same URL receives six kinds of event and five are not this one.
  assert.equal(readCallEnded({ event: "NOTIFY_START", destination: "441234567890" }), null);
  assert.equal(readCallEnded({ event: "NOTIFY_ANSWER", destination: "441234567890" }), null);
  assert.equal(readCallEnded({ event: "NOTIFY_OUT_START", destination: "441234567890" }), null);
  assert.equal(readCallEnded({ event: "NOTIFY_OUT_END" }), null);
});

test("reads the fields we log a call from", () => {
  const ended = readCallEnded({
    event: "NOTIFY_OUT_END",
    internal: "100",
    destination: "442085959751",
    duration: "84",
    disposition: "answered",
    call_start: "2026-11-24 14:02:11",
    is_recorded: "true",
    call_id_with_rec: "abc123",
  });

  assert.equal(ended?.internal, "100");
  assert.equal(ended?.destination, "442085959751");
  assert.equal(ended?.seconds, 84);
  assert.equal(ended?.disposition, "answered");
  assert.equal(ended?.recordingId, "abc123");
});

test("no recording id unless there is actually a recording", () => {
  const ended = readCallEnded({
    event: "NOTIFY_OUT_END",
    destination: "442085959751",
    is_recorded: "false",
    call_id_with_rec: "abc123",
  });
  assert.equal(ended?.recordingId, "");
});

test("a two-second answer is not a conversation", () => {
  // Somebody picking up and putting it down, or a switchboard. Logging
  // that as "spoke to them" would overstate every single day's work, and
  // a record that flatters is a record nobody should rely on.
  assert.equal(outcomeFor("answered", 4), "no-answer");
  assert.equal(outcomeFor("answered", 19), "no-answer");
  assert.equal(outcomeFor("answered", 20), "spoke");
  assert.equal(outcomeFor("answered", 180), "spoke");
  assert.equal(outcomeFor("busy", 0), "no-answer");
  assert.equal(outcomeFor("no answer", 0), "no-answer");
  assert.equal(outcomeFor("failed", 0), "no-answer");
});

test("the signature is base64 of the hex digest, not of the raw bytes", () => {
  // The bug that stopped the first connection attempt working. Their
  // documented example is PHP's base64_encode(hash_hmac('sha1', ...)),
  // and PHP's hash_hmac returns a hex string unless told otherwise — so
  // what is base64'd is forty hex characters, not twenty bytes.
  //
  // Both forms are valid base64 and both look plausible in a header.
  // The only way to tell them apart without their server is the length:
  // 40 bytes of hex encode to 56 characters, 20 raw bytes to 28.
  const made = sign("/v1/pbx/callinfo/", { url: "https://example.com/hook" }, "secret");
  assert.equal(made.length, 56, "signature is the wrong length to be hex-then-base64");

  // And what it decodes to must be readable hex, which raw bytes are not.
  const decoded = Buffer.from(made, "base64").toString("utf8");
  assert.match(decoded, /^[0-9a-f]{40}$/);
});

test("parameters are encoded the way PHP encodes them", async () => {
  // Their example is http_build_query(..., PHP_QUERY_RFC1738), which
  // escapes ! ~ * ' ( ) and turns a space into a plus. JavaScript's
  // encodeURIComponent leaves all of those alone, so a parameter with
  // one in it would be signed differently from the way their server
  // signs it — and the only symptom is a refusal with no reason.
  const { sign } = await import("../src/lib/zadarma.ts");

  // Same payload, written two ways that only differ in those characters.
  const withSpecials = sign("/v1/x/", { q: "a b~c*d" }, "s");
  const naive = Buffer.from(
    (await import("node:crypto"))
      .createHmac("sha1", "s")
      .update(
        `/v1/x/q=${encodeURIComponent("a b~c*d")}` +
          (await import("node:crypto"))
            .createHash("md5")
            .update(`q=${encodeURIComponent("a b~c*d")}`)
            .digest("hex"),
      )
      .digest("hex"),
    "utf8",
  ).toString("base64");

  assert.notEqual(withSpecials, naive, "encoding is still JavaScript's, not PHP's");
});

/**
 * What goes out on the wire when somebody presses Call, and when the
 * number a business sees has to change.
 *
 * Worth testing because the first version of this was wrong in a way
 * nothing could catch: it passed a phone number as the `sip` parameter,
 * which that API takes as an extension number. The request succeeded,
 * the call went through, and every American business saw a London
 * number. Nothing failed, so nothing said so.
 */
test("placing a call asks for the two things the API takes, and nothing else", async () => {
  process.env.ZADARMA_KEY = "key";
  process.env.ZADARMA_SECRET = "secret";
  const seen: { url: string; init: RequestInit }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    seen.push({ url: String(url), init });
    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  }) as typeof fetch;
  try {
    const { placeCall } = await import("../src/lib/zadarma.ts");
    const result = await placeCall("101", "02071234567");
    assert.equal(result.ok, true);
    assert.equal(seen.length, 1);
    assert.match(seen[0].url, /\/v1\/request\/callback\/\?/);
    assert.match(seen[0].url, /from=101/);
    assert.match(seen[0].url, /to=02071234567/);
    // The parameter that did nothing. It takes an extension, not a
    // number, so a number in it is worse than leaving it out.
    assert.doesNotMatch(seen[0].url, /sip=/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("changing the number a business sees is a PUT with the number in the body", async () => {
  process.env.ZADARMA_KEY = "key";
  process.env.ZADARMA_SECRET = "secret";
  const seen: { url: string; init: RequestInit }[] = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    seen.push({ url: String(url), init });
    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
  }) as typeof fetch;
  try {
    const { setExtensionCallerId } = await import("../src/lib/zadarma.ts");
    assert.equal(await setExtensionCallerId("101", "+12029824683"), true);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].init.method, "PUT");
    assert.match(seen[0].url, /\/v1\/pbx\/internal\/101\/callerid\/$/);
    // In the body, not the address, and signed all the same.
    assert.equal(seen[0].init.body, "number=%2B12029824683");
    const headers = seen[0].init.headers as Record<string, string>;
    assert.equal(headers["Content-Type"], "application/x-www-form-urlencoded");
    assert.match(headers.Authorization, /^key:/);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test("a refusal from the phone system is a refusal here, not a shrug", async () => {
  process.env.ZADARMA_KEY = "key";
  process.env.ZADARMA_SECRET = "secret";
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ status: "error" }), { status: 200 })) as typeof fetch;
  try {
    const { setExtensionCallerId } = await import("../src/lib/zadarma.ts");
    assert.equal(await setExtensionCallerId("101", "+12029824683"), false);
  } finally {
    globalThis.fetch = realFetch;
  }
});
