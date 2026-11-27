/**
 * Reviews pasted in a block, turned into rows.
 *
 * Walid has real reviews sitting somewhere else — Google, a phone,
 * an email — and typing them into a form one at a time is the kind of
 * job that does not get done. So the admin page takes a paste.
 *
 * Deliberately forgiving about the shape, because the point is that he
 * pastes what he already has rather than reformatting it first. What it
 * will not do is guess: a line it cannot read with confidence is handed
 * back as a problem with its line number, never quietly dropped and
 * never turned into an invented review. These are real customers and
 * the words have to be theirs.
 */

export type PastedReview = {
  name: string;
  business: string | null;
  rating: number;
  body: string;
};

export type PasteProblem = { line: number; text: string; why: string };

export type PasteResult = {
  reviews: PastedReview[];
  problems: PasteProblem[];
};

/** Longest a name or business can be, matching the database columns. */
const MOST_NAME = 120;
const MOST_BUSINESS = 160;

/**
 * The star rating, however it was written.
 *
 * Accepts a bare number, a number out of five, and a row of stars,
 * because all three turn up depending on where the review was copied
 * from. Returns 0 when there is no rating to read, which the caller
 * treats as a problem rather than as a guess.
 */
export function readRating(raw: string): number {
  const text = raw.trim();
  if (!text) return 0;

  // ★★★★★ or ***** — count the filled ones, ignore the empty.
  const filled = (text.match(/[★*]/g) ?? []).length;
  const hollow = (text.match(/[☆]/g) ?? []).length;
  if (filled > 0 && filled + hollow <= 5) return filled;

  // "5", "5/5", "5 stars", "4.5"
  const number = text.match(/(\d(?:[.,]\d)?)\s*(?:\/\s*5|\s*stars?)?/i);
  if (!number) return 0;
  const value = Math.round(Number(number[1].replace(",", ".")));
  return value >= 1 && value <= 5 ? value : 0;
}

/** "Dave Smith (Smith Plumbing)" or "Dave Smith, Smith Plumbing". */
function splitName(raw: string): { name: string; business: string | null } {
  const text = raw.trim().replace(/^["'“”]+|["'“”]+$/g, "");
  const bracketed = text.match(/^(.+?)\s*[([{]\s*(.+?)\s*[)\]}]$/);
  if (bracketed) {
    return {
      name: bracketed[1].trim().slice(0, MOST_NAME),
      business: bracketed[2].trim().slice(0, MOST_BUSINESS) || null,
    };
  }
  const comma = text.match(/^([^,]+),\s*(.+)$/);
  if (comma) {
    return {
      name: comma[1].trim().slice(0, MOST_NAME),
      business: comma[2].trim().slice(0, MOST_BUSINESS) || null,
    };
  }
  return { name: text.slice(0, MOST_NAME), business: null };
}

/**
 * One block of pasted text, read into reviews.
 *
 * The expected shape is one review per line, three parts separated by
 * a pipe, a tab, or two or more spaces:
 *
 *   Dave Smith | 5 | They rebuilt our site in a week and the phone
 *   Jo Patel (Patel Tiling) | 4 | Good work, a bit slow to start
 *
 * Blank lines are skipped. A line that does not have three parts, or
 * whose rating cannot be read, or whose review text is empty, comes
 * back as a problem with its line number so it can be fixed and pasted
 * again. Nothing is invented to fill a gap.
 */
export function parsePastedReviews(input: string): PasteResult {
  const reviews: PastedReview[] = [];
  const problems: PasteProblem[] = [];

  const lines = input.replace(/\r\n?/g, "\n").split("\n");

  lines.forEach((raw, i) => {
    const line = i + 1;
    const text = raw.trim();
    if (!text) return;

    // Pipes first because they are unambiguous, then tabs, then a run
    // of spaces — which is what a copy out of a spreadsheet or a table
    // usually leaves behind.
    const parts = text.includes("|")
      ? text.split("|")
      : text.includes("\t")
        ? text.split("\t")
        : text.split(/\s{2,}/);

    const clean = parts.map((p) => p.trim()).filter((p) => p !== "");
    if (clean.length < 3) {
      problems.push({
        line,
        text,
        why: "Needs three parts: name, rating, then what they said.",
      });
      return;
    }

    const rating = readRating(clean[1]);
    if (rating === 0) {
      problems.push({ line, text, why: `"${clean[1]}" is not a rating from 1 to 5.` });
      return;
    }

    // Everything after the rating is the review, so a pipe inside
    // somebody's sentence does not cut it in half.
    const body = clean.slice(2).join(" | ").trim();
    if (body.length < 3) {
      problems.push({ line, text, why: "No review text." });
      return;
    }

    const { name, business } = splitName(clean[0]);
    if (!name) {
      problems.push({ line, text, why: "No name." });
      return;
    }

    reviews.push({ name, business, rating, body });
  });

  return { reviews, problems };
}
