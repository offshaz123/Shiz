/**
 * Turning what somebody typed into the account name we stored.
 *
 * Its own module with no imports, so it can be tested directly. It is on
 * the login path, and the failure it prevents is the worst kind: a client
 * typing the right thing, being told it is wrong, and having no way to
 * find out which of the two of us is at fault.
 *
 * The rule is that the stored name is the strict one and what gets typed
 * is the forgiving one. `createClient` folds a business name down to
 * lowercase letters, digits and hyphens — "Plated Up" is stored as
 * `plated-up` — so anything that folds down to the same thing has to be
 * accepted. Someone reading "plated-up" off a chat message on a phone
 * will type "Plated Up", "platedup" or "PLATEDUP", and all three mean it.
 */

/**
 * The one fold, used both to make an account name and to look one up.
 *
 * Both have to be the same function or they drift: an account created
 * from "Smith & Sons" and a client typing "Smith & Sons" have to arrive
 * at the same string, and the only way to be sure of that is for there to
 * be one place that decides.
 */
export function normaliseAccountName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/**
 * The same again with hyphens dropped, for the case where the stored name
 * has a hyphen the person did not type: "platedup" has to find
 * `plated-up`. Compared against the stored name put through the same
 * treatment, never used as a lookup key of its own.
 */
export function squashAccountName(input: string): string {
  return normaliseAccountName(input).replace(/-/g, "");
}

/**
 * Whether what was typed is an email address rather than an account name.
 *
 * Deliberately crude: it only decides which column to look in, and the
 * password still has to be right either way. Anything stricter would
 * refuse a real address for being unusual.
 */
export function looksLikeEmail(input: string): boolean {
  const value = input.trim();
  return value.includes("@") && value.indexOf("@") > 0 && value.length <= 200;
}
