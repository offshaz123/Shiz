import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_ATTEMPTS, WINDOW_MINUTES } from "../src/lib/login-attempts.ts";
import { readFileSync } from "node:fs";

/**
 * Guessing at a password, and being made to stop.
 *
 * This was found by trying it: fifteen wrong passwords at the client
 * portal in eleven seconds, none refused. The admin form was limited
 * and the portal was not, which is the wrong way round if either had
 * to be — a client password is the only thing between a stranger and
 * that business's leads, invoices and customer list.
 *
 * Then the first fix did not work either, and the reason is worth
 * pinning down in a test. The counter was a Map in module memory, and
 * the two server actions are bundled separately, so each had its own
 * empty copy. The admin login blocked because its copy counted; the
 * portal's never saw a second request. A control that depends on how a
 * bundler split the code is not a control.
 *
 * The behaviour itself needs a database, so these tests pin the two
 * things that can rot without anybody noticing: the numbers, and the
 * fact that both logins actually call the thing.
 */

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8");

test("the limits are the ones that were agreed", () => {
  assert.equal(MAX_ATTEMPTS, 8);
  assert.equal(WINDOW_MINUTES, 15);
});

test("the count is kept in the database, not in module memory", () => {
  const source = read("../src/lib/login-attempts.ts");
  assert.ok(source.includes("login_attempts"), "should read and write a table");
  assert.ok(
    !/new Map\s*</.test(source),
    "a Map in module scope is not shared between bundles, which is how this broke",
  );
});

test("the table exists in the schema, or nothing can be counted", () => {
  const db = read("../src/lib/db.ts");
  assert.ok(db.includes("CREATE TABLE IF NOT EXISTS login_attempts"));
  // Per address and per kind, so one portal fumbler cannot lock the
  // owner out of the admin page from the same office.
  assert.ok(/PRIMARY KEY \(scope, ip\)/.test(db));
});

test("the client portal login is limited, and checks before it hashes", () => {
  const portal = read("../src/app/portal/actions.ts");
  assert.ok(portal.includes("tooManyAttempts"), "portal must ask");
  assert.ok(portal.includes("recordFailure"), "portal must count a failure");
  assert.ok(portal.includes("clearAttempts"), "a good password must clear the count");

  // Order matters: scrypt is deliberately slow, so answering unlimited
  // guesses is unlimited work for the server even when every guess is
  // wrong. The check has to come first.
  //
  // Measured inside the function, not the file: the import lines name
  // both of these in whatever order the formatter put them, which is
  // not the order they run in.
  const fn = portal.slice(portal.indexOf("export async function clientLogin"));
  const asked = fn.indexOf("tooManyAttempts");
  const hashed = fn.indexOf("checkClientLogin");
  assert.ok(asked > -1 && hashed > -1, "both should appear inside clientLogin");
  assert.ok(asked < hashed, "the limit must be checked before the password is hashed");
});

test("the admin login is still limited", () => {
  const admin = read("../src/app/admin/actions.ts");
  assert.ok(admin.includes("tooManyAttempts"));
  assert.ok(admin.includes("recordFailure"));
  assert.ok(admin.includes("clearAttempts"));
});

/**
 * These are async now. A missing await reads as "always truthy" and
 * would lock every login out of every account, which is a worse
 * outage than the hole it closed.
 */
test("every caller awaits the check", () => {
  for (const file of ["../src/app/portal/actions.ts", "../src/app/admin/actions.ts"]) {
    const source = read(file);
    for (const call of ["tooManyAttempts", "recordFailure", "clearAttempts"]) {
      const used = new RegExp(`(?<!await )(?<!\\* )\\b${call}\\(`, "g");
      const bare = [...source.matchAll(used)].filter(
        (m) => !source.slice(Math.max(0, m.index - 30), m.index).includes("import"),
      );
      assert.equal(bare.length, 0, `${file} calls ${call} without awaiting it`);
    }
  }
});
