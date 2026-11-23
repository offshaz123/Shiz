import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADMIN_PAGES,
  defaultPages,
  grantablePages,
  pageFor,
} from "../src/lib/admin-pages.ts";

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
