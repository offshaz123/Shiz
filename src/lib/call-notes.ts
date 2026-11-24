/**
 * What counts as having written a call up.
 *
 * A call with no note is a call nobody can learn anything from. The
 * phone system records the length and whether it connected; the only
 * thing that makes the next attempt better is what was actually said,
 * and that exists nowhere but in the head of the person who made it.
 *
 * So the note is required on every outcome, not only the interesting
 * ones. "Not interested" without a reason is the one that costs most:
 * a business that said "we already have an agency" and one that said
 * "ring me in March" both end up as the same dead row, and the second
 * one was worth money.
 *
 * Deliberately a module of its own with no imports. The rule has to
 * hold in the browser, where the buttons live, and on the server, where
 * the request actually arrives — a check only the page does is a check
 * that stops the honest and not the hurried. Anything that touches the
 * database cannot be imported into a client component without pulling
 * the MySQL driver into the browser bundle, which fails the build.
 */

/** Shorter than this is somebody getting past the box, not writing a note. */
export const SHORTEST_NOTE = 12;

/**
 * Why this note is not good enough, or null when it is.
 *
 * Returns the sentence shown to the person, because a rule enforced
 * with "invalid" teaches nobody what to type instead.
 */
export function noteProblem(notes: string): string | null {
  const written = notes.trim();

  if (written === "") {
    return "Write down what happened before you save it.";
  }

  if (written.length < SHORTEST_NOTE) {
    return `A few more words than that — what did they actually say?`;
  }

  // Two letters repeated, a row of full stops, "asdf". Somebody is
  // getting past the box rather than filling it in, and a record full
  // of "aaaa" is worse than an empty one: it looks answered.
  if (new Set(written.replace(/[^a-z0-9]/gi, "").toLowerCase()).size < 4) {
    return "That does not say anything. Put down what they said.";
  }

  return null;
}

/** True when this note is enough to save. */
export function noteIsEnough(notes: string): boolean {
  return noteProblem(notes) === null;
}
