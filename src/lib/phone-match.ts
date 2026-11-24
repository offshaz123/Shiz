/**
 * Deciding whether two written phone numbers are the same number.
 *
 * Its own module with no imports, because it is the hinge the whole call
 * integration turns on: when the phone system tells us a call ended, the
 * only thing tying that call to a business is the number that was dialled,
 * and the two will almost never be written the same way.
 *
 * Google gives us "020 8595 9751". The phone system reports what was
 * actually dialled, which is "442085959751". A person typing one into the
 * admin writes "+44 20 8595 9751" or "0208 595 9751". None of those match
 * as strings and all of them are the same shop.
 *
 * The rule is deliberately narrow: compare the last nine digits, and only
 * when both numbers have at least nine. That is enough to tell two British
 * businesses apart while surviving every way of writing a dialling code,
 * and short enough to survive the country code being present on one side
 * and absent on the other.
 *
 * Nine rather than ten, because a UK national number after the leading
 * zero is ten digits and an American one is ten including the area code —
 * but a UK number written without its leading zero is nine. Nine is the
 * largest window that every form of both has.
 */

/** Everything that is not a digit, removed. */
export function digitsOf(value: string): string {
  return (value ?? "").replace(/\D+/g, "");
}

/** How many digits must agree for two numbers to count as the same. */
const WINDOW = 9;

/**
 * The part of a number that identifies it.
 *
 * Trunk and country prefixes are stripped by taking the end rather than by
 * knowing about them, which means this needs no table of dialling codes
 * and does not go wrong on a country nobody thought of.
 */
export function phoneKey(value: string): string {
  const digits = digitsOf(value);
  return digits.length >= WINDOW ? digits.slice(-WINDOW) : "";
}

/**
 * Are these the same number?
 *
 * False for anything too short to be sure about, which is the right
 * answer: a wrong match here files a call against the wrong business, and
 * a call filed against the wrong business is worse than one not filed at
 * all — the first is a lie in the record, the second is a gap in it.
 */
export function samePhone(a: string, b: string): boolean {
  const left = phoneKey(a);
  const right = phoneKey(b);
  return left !== "" && left === right;
}

/**
 * Finds the one row whose number matches, or nothing.
 *
 * Returns null when more than one matches. Two businesses sharing a
 * number is real — an office that answers for both, a man with two
 * trading names — and picking one of them at random would put a call
 * against a business that was never rung.
 */
export function findByPhone<T extends { phone: string }>(rows: T[], dialled: string): T | null {
  const key = phoneKey(dialled);
  if (!key) return null;
  const hits = rows.filter((row) => phoneKey(row.phone) === key);
  return hits.length === 1 ? hits[0] : null;
}
