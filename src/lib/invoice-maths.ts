/**
 * Invoice arithmetic and the shapes it works on.
 *
 * Its own module with no imports, because the page that writes an invoice
 * runs in the browser and needs the same totals as the page that renders
 * one on the server. Putting these next to the queries dragged the MySQL
 * driver into the browser bundle, and two copies of the same sum is how a
 * total on screen ends up a penny away from the total in the email.
 *
 * Money is pence, as a whole number, throughout. Pounds as a float is a
 * total that eventually comes out a penny short, and the one document
 * where a penny gets noticed is the one asking somebody to pay.
 */

export type InvoiceLine = {
  id: number;
  description: string;
  /** Hours, units, whatever they are selling. */
  quantity: number;
  /** Pence. */
  unitPence: number;
};

/**
 * Totals, worked out in pence and rounded once per line.
 *
 * Each line is rounded to a penny before anything is added, because the
 * rounded figure is what the line shows on the page, and a total that does
 * not match the lines added up is the one thing nobody forgives on an
 * invoice.
 */
export function totals(lines: InvoiceLine[], vatRate: number) {
  const subtotalPence = lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPence),
    0,
  );
  const vatPence = Math.round((subtotalPence * vatRate) / 100);
  return { subtotalPence, vatPence, totalPence: subtotalPence + vatPence };
}

export function pounds(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
