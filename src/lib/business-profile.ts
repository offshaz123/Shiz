/**
 * Tidying up what a business typed about itself.
 *
 * Its own module with no imports, so it can be tested and so the browser
 * can use the same functions as the server without dragging the database
 * driver along.
 *
 * The point is that nobody should have to be careful. Somebody filling
 * this in on a phone between jobs will type "m12 4wd" or "M124WD" or
 * "gb 123 456 789", and every one of those is the right answer typed
 * casually. The form takes it as given and the invoice prints it properly,
 * because an invoice with a mangled postcode on it looks like it came from
 * somebody who does not check things.
 *
 * Nothing here changes what was meant. A business name is left exactly as
 * written: "McGrath" and "MOT4U" are not mistakes to be corrected, and a
 * tidy-up that title-cases a name is a tidy-up that gets it wrong.
 */

/**
 * A UK postcode, upper-cased with the one space in the right place.
 *
 * The outward and inward halves split three from the end, which holds for
 * every UK format from "M1 1AA" to "DN55 1PT". Anything that does not look
 * like a UK postcode at all is upper-cased and left alone, because the
 * alternative is refusing an address somebody actually lives at.
 */
export function tidyPostcode(input: string): string {
  const bare = input.replace(/\s+/g, "").toUpperCase();
  if (bare.length < 5 || bare.length > 7) return input.trim().toUpperCase();
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(bare)) return input.trim().toUpperCase();
  return `${bare.slice(0, -3)} ${bare.slice(-3)}`;
}

/**
 * A VAT number, upper-cased and closed up, with GB put on the front.
 *
 * Nine or twelve digits with no country code is a UK VAT number typed the
 * way it appears on a certificate, and "GB" in front of it is what has to
 * appear on an invoice. A number that already carries any country's prefix
 * is left with the one it has.
 */
export function tidyVatNumber(input: string): string {
  const bare = input.replace(/[\s.-]+/g, "").toUpperCase();
  if (!bare) return "";
  if (/^\d{9}$|^\d{12}$/.test(bare)) return `GB${bare}`;
  return bare;
}

/** Addresses are read, never sent to. Lower-casing one would be wrong. */
export function tidyEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Spaces collapsed, nothing else touched: phone formats vary too much. */
export function tidyPhone(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

/**
 * A website as it should be printed: no scheme, no www, no trailing slash.
 *
 * What goes on an invoice is "autowrapmanchester.co.uk", whatever was
 * pasted in, because the rest is for a browser rather than for a person.
 */
export function tidyWebsite(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export type Address = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

/**
 * The address as it goes on a letter: one part per line, nothing empty.
 *
 * Built from the parts rather than kept as typed, so a client who leaves
 * the second line blank does not get a gap in the middle of their address
 * and a client who fills everything in gets it in the right order whatever
 * order they filled it in.
 */
export function formatAddress(address: Address): string {
  return [
    address.line1,
    address.line2,
    address.city,
    tidyPostcode(address.postcode),
    // "United Kingdom" on an invoice from a Manchester garage to a
    // Manchester customer is noise. It goes on only if they said so.
    address.country,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}
