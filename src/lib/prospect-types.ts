/**
 * The shape of a prospect, and the statuses one can be in.
 *
 * Separate from prospects.ts on purpose. That file opens a MySQL connection,
 * and the call-list UI needs the status list at runtime to draw its buttons —
 * importing it from there pulls the whole database driver into the browser
 * bundle, which fails the build outright. Types alone would have been erased;
 * STATUSES is a real value, so it has to live somewhere the client can reach.
 */

export const STATUSES = [
  "new",
  "called",
  "interested",
  "not-interested",
  "no-answer",
  "customer",
] as const;

export type ProspectStatus = (typeof STATUSES)[number];

export function isStatus(value: unknown): value is ProspectStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

export type Prospect = {
  id: number;
  placeId: string;
  name: string;
  phone: string;
  website: string;
  address: string;
  category: string;
  mapsUri: string;
  reviews: number;
  rating: number | null;
  siteScore: number | null;
  status: ProspectStatus;
  notes: string;
  calledAt: string | null;
  foundFor: string;
};
