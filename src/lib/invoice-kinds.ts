/**
 * How the money came in.
 *
 * Its own module with no imports, because the form that asks the question
 * runs in the browser and the module that answers it imports the database
 * driver. A browser importing that pulls MySQL into the page bundle, and
 * the build refuses it — correctly.
 */

export type PaidMethod = "cash" | "card" | "transfer" | "other";

export const PAID_METHODS: readonly PaidMethod[] = ["cash", "card", "transfer", "other"];

export const PAID_METHOD_WORD: Record<PaidMethod, string> = {
  cash: "cash",
  card: "card",
  transfer: "bank transfer",
  other: "other",
};

export function asPaidMethod(value: string): PaidMethod | null {
  return (PAID_METHODS as readonly string[]).includes(value) ? (value as PaidMethod) : null;
}
