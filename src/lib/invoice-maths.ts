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

export type Discount = {
  kind: "none" | "percent" | "fixed";
  /** Used when kind is "percent": 10 means ten per cent. */
  percent: number;
  /** Used when kind is "fixed". Pence, like everything else here. */
  pence: number;
};

export const NO_DISCOUNT: Discount = { kind: "none", percent: 0, pence: 0 };

/**
 * Totals, worked out in pence and rounded once per line.
 *
 * Each line is rounded to a penny before anything is added, because the
 * rounded figure is what the line shows on the page, and a total that does
 * not match the lines added up is the one thing nobody forgives on an
 * invoice.
 *
 * The discount comes off before VAT, which is the order HMRC expects and
 * the order that is in the customer's favour: VAT is due on what is
 * actually charged, so taking it off afterwards would overcharge the tax.
 *
 * A discount can never take an invoice below zero. A percentage over a
 * hundred or a fixed amount larger than the bill is a typo, and the right
 * answer to a typo is nothing owed rather than money flowing backwards.
 */
export function totals(
  lines: InvoiceLine[],
  vatRate: number,
  discount: Discount = NO_DISCOUNT,
  /**
   * Money already taken against this invoice — a deposit on booking, or
   * a part payment. Pence, like everything else.
   */
  depositPence = 0,
) {
  const subtotalPence = lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitPence),
    0,
  );

  const asked =
    discount.kind === "percent"
      ? Math.round((subtotalPence * Math.max(0, discount.percent)) / 100)
      : discount.kind === "fixed"
        ? Math.max(0, Math.round(discount.pence))
        : 0;
  const discountPence = Math.min(asked, subtotalPence);

  const afterDiscount = subtotalPence - discountPence;
  const vatPence = Math.round((afterDiscount * vatRate) / 100);
  const totalPence = afterDiscount + vatPence;

  // A deposit larger than the bill is a typo or a job that shrank. Either
  // way the balance is nothing owed rather than a negative, because an
  // invoice that appears to owe the customer money is an invoice that
  // starts a phone call.
  const taken = Math.min(Math.max(0, Math.round(depositPence)), totalPence);

  return {
    subtotalPence,
    discountPence,
    afterDiscountPence: afterDiscount,
    vatPence,
    totalPence,
    depositPence: taken,
    /** What is actually still owed. */
    balancePence: totalPence - taken,
  };
}

export function pounds(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
