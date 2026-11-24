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
