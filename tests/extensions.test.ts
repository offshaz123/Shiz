import test from "node:test";
import assert from "node:assert/strict";
import { clashes, clashWords } from "../src/lib/extensions.ts";

test("nobody sharing is no clash", () => {
  assert.deepEqual(
    clashes([
      { name: "Walid", extension: "100" },
      { name: "Ali", extension: "101" },
    ]),
    [],
  );
});

test("two people on one extension is caught", () => {
  const found = clashes([
    { name: "Walid", extension: "100" },
    { name: "Ali", extension: "100" },
  ]);
  assert.equal(found.length, 1);
  assert.equal(found[0].extension, "100");
  assert.deepEqual(found[0].names, ["Walid", "Ali"]);
});

test("blank extensions are not a clash", () => {
  assert.deepEqual(
    clashes([
      { name: "Walid", extension: "" },
      { name: "Ali", extension: "" },
      { name: "Sam", extension: "   " },
    ]),
    [],
  );
});

test("whitespace around an extension still counts as the same one", () => {
  const found = clashes([
    { name: "Walid", extension: "100" },
    { name: "Ali", extension: " 100 " },
  ]);
  assert.equal(found.length, 1);
});

test("three on one is reported once, with all three", () => {
  const found = clashes([
    { name: "A", extension: "7" },
    { name: "B", extension: "7" },
    { name: "C", extension: "7" },
  ]);
  assert.equal(found.length, 1);
  assert.deepEqual(found[0].names, ["A", "B", "C"]);
  assert.match(clashWords(found[0]), /A and B and C|A and B, and C/);
});

test("the warning names the people and the extension", () => {
  const words = clashWords({ extension: "100", names: ["Walid", "Ali"] });
  assert.match(words, /Walid/);
  assert.match(words, /Ali/);
  assert.match(words, /100/);
});
