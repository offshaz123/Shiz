import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PAGES,
  defaultPages,
  grantablePages,
  pageFor,
} from "../src/lib/admin-pages.ts";
import { ADMIN_GROUPS, PORTAL_GROUPS, TONE } from "../src/lib/nav-groups.ts";

/**
 * The page list is the whole permission model, so the quiet mistakes in it
 * are the ones that matter: a page nobody can reach, or worse, one a member
 * of staff can grant themselves.
 */

test("the team page can never be granted to staff", () => {
  // If this can be switched on, every other switch on that screen is
  // decorative: whoever has it can give themselves the rest.
  const team = ADMIN_PAGES.find((p) => p.key === "staff");
  assert.ok(team);
  assert.equal(team.canGrant, false);
  assert.ok(!defaultPages().includes("staff"));
  assert.ok(!grantablePages().some((p) => p.key === "staff"));
});

test("a new person does not get the clients page", () => {
  // The one page Walid named. It carries other businesses' logins, their
  // spend and their customers.
  assert.ok(!defaultPages().includes("clients"));
  assert.ok(defaultPages().includes("prospects"));
});

test("every page has a unique key and address", () => {
  assert.equal(new Set(ADMIN_PAGES.map((p) => p.key)).size, ADMIN_PAGES.length);
  assert.equal(new Set(ADMIN_PAGES.map((p) => p.href)).size, ADMIN_PAGES.length);
});

test("a path inside a page belongs to that page, not to the overview", () => {
  // Every admin path starts with /admin, so a first-match rule would put
  // the whole clients section behind the overview permission.
  assert.equal(pageFor("/admin/clients/platedup")?.key, "clients");
  assert.equal(pageFor("/admin/prospects/41")?.key, "prospects");
  assert.equal(pageFor("/admin")?.key, "overview");
  assert.equal(pageFor("/admin/staff")?.key, "staff");
  assert.equal(pageFor("/portal"), null);
});

test("the owner's username cannot be taken by a member of staff", async () => {
  const { isReservedUsername, toUsername } = await import("../src/lib/staff.ts");
  // Walid signs in as admin. A staff row holding that username would be
  // a staff account standing in front of the owner's login.
  assert.ok(isReservedUsername("admin"));
  assert.ok(isReservedUsername("ADMIN"));
  assert.ok(isReservedUsername(" Admin "));
  assert.ok(isReservedUsername("owner"));
  assert.ok(!isReservedUsername("adminsam"));
  assert.ok(!isReservedUsername("sam"));
  // Usernames may carry digits, which is what Walid asked for.
  assert.equal(toUsername("Sam 2"), "sam2");
  assert.equal(toUsername("jade.okoro"), "jade.okoro");
});

/**
 * The side column is drawn by group, not by page.
 *
 * That is a new way for a page to disappear: it exists, it is allowed,
 * it has a heading — and if that heading is not in the list the column
 * draws, nothing renders it and the only way to reach the page is to
 * type the address. The page would still work, which is what makes it
 * the kind of thing nobody notices for a month.
 */
test("every page sits under a heading the column actually draws", () => {
  const drawn = new Set(ADMIN_GROUPS.map((g) => g.key));
  for (const page of ADMIN_PAGES) {
    assert.ok(
      drawn.has(page.group),
      `${page.key} is under "${page.group}", which the side column does not draw`,
    );
  }
});

test("no heading is drawn over nothing", () => {
  for (const group of ADMIN_GROUPS) {
    assert.ok(
      ADMIN_PAGES.some((page) => page.group === group.key),
      `"${group.label}" has no pages under it`,
    );
  }
});

test("every heading has a colour of its own", () => {
  const tones = ADMIN_GROUPS.map((g) => g.tone);
  assert.equal(new Set(tones).size, tones.length, "two headings share a colour");
  for (const group of ADMIN_GROUPS) {
    const tone = TONE[group.tone];
    assert.ok(tone, `${group.key} has no tone`);
    // Whole class names, never built up at runtime, or Tailwind never
    // generates them and the colour silently does not appear.
    for (const part of [tone.dot, tone.label, tone.rule, tone.active, tone.icon]) {
      assert.doesNotMatch(part, /\$\{|undefined/);
      assert.ok(part.length > 0);
    }
  }
});

test("the client portal's headings are sound in the same way", () => {
  const tones = PORTAL_GROUPS.map((g) => g.tone);
  assert.equal(new Set(tones).size, tones.length);
  for (const group of PORTAL_GROUPS) assert.ok(TONE[group.tone]);
});
