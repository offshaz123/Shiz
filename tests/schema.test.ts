import test from "node:test";
import assert from "node:assert/strict";
import { ADDED_COLUMNS, SCHEMA } from "../src/lib/db.ts";

/**
 * The migration list has to work on an empty database, not just on ours.
 *
 * Columns are added one at a time, in the order they appear in the list,
 * and several carry an AFTER clause saying where in the table to put
 * them. An AFTER that names a column added further down the same list
 * works on our live database — the column was already there from an
 * earlier deploy — and fails on a database that has neither, which
 * throws out of the schema setup and makes every page in the admin say
 * "No database connection" with nothing to say why.
 *
 * Four of them were like that, found by pointing the site at an empty
 * database rather than by reading the diff. This is the cheap version of
 * that check.
 */

/** Column names in the CREATE TABLE statements, per table. */
function baseColumns(): Map<string, Set<string>> {
  const tables = new Map<string, Set<string>>();

  for (const statement of SCHEMA) {
    const name = /CREATE TABLE IF NOT EXISTS (\w+)/.exec(statement)?.[1];
    if (!name) continue;

    const body = statement.slice(statement.indexOf("(") + 1, statement.lastIndexOf(")"));
    const columns = new Set<string>();
    for (const line of body.split("\n")) {
      const first = /^\s*(\w+)\s+\S/.exec(line)?.[1];
      if (!first) continue;
      // Skip the key and constraint lines, which are not columns.
      if (/^(PRIMARY|UNIQUE|KEY|INDEX|CONSTRAINT|FOREIGN|FULLTEXT)$/i.test(first)) continue;
      columns.add(first);
    }
    tables.set(name, columns);
  }

  return tables;
}

test("every AFTER names a column that exists by the time it runs", () => {
  const tables = baseColumns();
  const broken: string[] = [];

  for (const { table, column, definition } of ADDED_COLUMNS) {
    const have = tables.get(table) ?? new Set<string>();
    const after = /\bAFTER\s+`?(\w+)`?/i.exec(definition)?.[1];

    if (after && !have.has(after)) {
      broken.push(
        `${table}.${column} says AFTER ${after}, which does not exist yet at that point`,
      );
    }

    have.add(column);
    tables.set(table, have);
  }

  assert.deepEqual(broken, []);
});

test("every added column belongs to a table the schema creates", () => {
  const tables = baseColumns();
  const orphans = ADDED_COLUMNS.filter(({ table }) => !tables.has(table)).map(
    ({ table, column }) => `${table}.${column}`,
  );
  assert.deepEqual(orphans, []);
});

test("no column is added twice", () => {
  const seen = new Set<string>();
  const twice: string[] = [];
  for (const { table, column } of ADDED_COLUMNS) {
    const key = `${table}.${column}`;
    if (seen.has(key)) twice.push(key);
    seen.add(key);
  }
  assert.deepEqual(twice, []);
});
