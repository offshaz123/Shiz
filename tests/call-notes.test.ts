import test from "node:test";
import assert from "node:assert/strict";
import { noteIsEnough, noteProblem } from "../src/lib/call-notes.ts";

test("an empty note is refused", () => {
  assert.equal(noteIsEnough(""), false);
  assert.equal(noteIsEnough("   \n  "), false);
  assert.match(noteProblem("") ?? "", /what happened/i);
});

test("a letter or two is refused", () => {
  assert.equal(noteIsEnough("no"), false);
  assert.equal(noteIsEnough("ok"), false);
  assert.equal(noteIsEnough("n/a"), false);
  assert.match(noteProblem("no") ?? "", /more words/i);
});

test("mashing the keyboard is refused", () => {
  assert.equal(noteIsEnough("aaaaaaaaaaaaaaaa"), false);
  assert.equal(noteIsEnough("................"), false);
  assert.equal(noteIsEnough("ababababababab"), false);
});

test("a real note is accepted", () => {
  assert.equal(noteIsEnough("Receptionist said the owner is out until Thursday."), true);
  assert.equal(noteIsEnough("Not interested, they signed with another agency in March."), true);
  assert.equal(noteIsEnough("Rang out, no voicemail."), true);
  assert.equal(noteProblem("Rang out, no voicemail."), null);
});

test("the shortest real thing somebody might write is accepted", () => {
  // Short, but it says something a human could act on.
  assert.equal(noteIsEnough("No answer twice"), true);
});
